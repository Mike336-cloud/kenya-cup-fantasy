'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, SquadPlayer, ValidationResult, BoosterType, RosterStatus } from '@/types/fantasy';
import { canAddPlayer, validateSquad, validateSquadForSave, SQUAD_RULES, isPlayerLocked } from '@/lib/fantasyRules';
import { isPositionEligibleForSlot } from '@/components/squad/PitchView';

const TOTAL_BUDGET = SQUAD_RULES.TOTAL_BUDGET;

interface SquadState {
  squad: SquadPlayer[];
  captainId: string | null;
  viceCaptainId: string | null;
  activeBooster: BoosterType | null;
  selectedPosition: string | null;
  isPickingPlayer: boolean;
  activeFilter: string;

  // Computed helpers
  getRemainingBudget: () => number;
  getSpentBudget: () => number;
  isSquadFull: () => boolean;
  getPositionCount: (position: string) => number;
  getClubCount: (club: string) => number;

  // Actions
  addPlayer: (player: Player, pitchSlot?: number) => ValidationResult;
  removePlayer: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  setActiveBooster: (booster: BoosterType | null) => ValidationResult;
  setSelectedPosition: (position: string | null) => void;
  setIsPickingPlayer: (picking: boolean) => void;
  setActiveFilter: (filter: string) => void;
  validateSquad: () => ValidationResult;
  validateForSave: () => ValidationResult;
  resetSquad: () => void;
  swapPlayers: (fromId: string, toId: string) => { success: boolean; error?: string };
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      squad: [],
      captainId: null,
      viceCaptainId: null,
      activeBooster: null,
      selectedPosition: null,
      isPickingPlayer: false,
      activeFilter: 'All',

      // ── Computed ────────────────────────────────────────────────────────────
      getRemainingBudget: () => {
        if (get().activeBooster === 'limit') {
          return TOTAL_BUDGET;
        }
        const spent = get().squad.reduce((sum, sp) => sum + (Number(sp.player?.cost) || 0), 0);
        return Number(TOTAL_BUDGET) - spent;
      },

      getSpentBudget: () => {
        return get().squad.reduce((sum, sp) => sum + (Number(sp.player?.cost) || 0), 0);
      },

      isSquadFull: () => get().squad.length >= SQUAD_RULES.TOTAL_PLAYERS,

      getPositionCount: (position: string) => {
        return get().squad.filter(sp => sp.player?.position === position).length;
      },

      getClubCount: (club: string) => {
        return get().squad.filter(sp => sp.player?.club === club).length;
      },

      // ── Actions ─────────────────────────────────────────────────────────────
      addPlayer: (player: Player, pitchSlot?: number): ValidationResult => {
        const state = get();
        const pIdStr = String(player.id);

        // Strict duplicate check to avoid ghost or dual states
        const alreadyInSquad = state.squad.some(sp => String(sp.playerId) === pIdStr);
        if (alreadyInSquad) {
          return { isValid: false, errors: ['Player is already in your squad.'], warnings: [] };
        }

        const currentPlayers = state.squad.map(sp => sp.player);
        const remaining = state.getRemainingBudget();

        // Enforce strict Number on cost to avoid type mismatch bugs
        const normalizedPlayer: Player = {
          ...player,
          id: pIdStr,
          cost: Number(player.cost) || 0,
        };

        const check = canAddPlayer(normalizedPlayer, currentPlayers, remaining, state.activeBooster);
        if (!check.isValid) return check;

        // Find assigned or first available slot 1-23 (1-15: Starters, 16-23: Substitutes)
        const usedSlots = new Set(state.squad.map(sp => sp.pitchSlot));
        let assignedSlot = pitchSlot;
        if (!assignedSlot || usedSlots.has(assignedSlot)) {
          // Prefer slot matching player position
          for (let i = 1; i <= SQUAD_RULES.TOTAL_PLAYERS; i++) {
            if (!usedSlots.has(i) && isPositionEligibleForSlot(i, normalizedPlayer.position)) {
              assignedSlot = i;
              break;
            }
          }
          if (!assignedSlot) {
            for (let i = 1; i <= SQUAD_RULES.TOTAL_PLAYERS; i++) {
              if (!usedSlots.has(i)) {
                assignedSlot = i;
                break;
              }
            }
          }
        }

        const slotNum = assignedSlot || (state.squad.length + 1);
        const rosterStatus = slotNum <= SQUAD_RULES.STARTERS_COUNT ? 'STARTER' : 'BENCH';

        const newSquadPlayer: SquadPlayer = {
          playerId: pIdStr,
          player: normalizedPlayer,
          isCaptain: false,
          isViceCaptain: false,
          isLocked: isPlayerLocked(normalizedPlayer),
          pitchSlot: slotNum,
          rosterStatus,
        };

        // Strict immutable state update
        set(s => ({
          squad: [...s.squad, newSquadPlayer],
          isPickingPlayer: false,
          selectedPosition: null,
        }));

        return { isValid: true, errors: [], warnings: [] };
      },

      removePlayer: (playerId: string) => {
        const pIdStr = String(playerId);
        set(s => {
          const newSquad = s.squad.filter(sp => String(sp.playerId) !== pIdStr);
          const wasCaptain = s.captainId && String(s.captainId) === pIdStr;
          const wasViceCaptain = s.viceCaptainId && String(s.viceCaptainId) === pIdStr;

          let newBooster = s.activeBooster;
          if (wasCaptain && (s.activeBooster === 'triple' || s.activeBooster === 'co')) {
            newBooster = null;
          }
          if (wasViceCaptain && s.activeBooster === 'co') {
            newBooster = null;
          }

          return {
            squad: newSquad,
            captainId: wasCaptain ? null : s.captainId,
            viceCaptainId: wasViceCaptain ? null : s.viceCaptainId,
            activeBooster: newBooster,
          };
        });
      },

      setCaptain: (playerId: string) => {
        const pIdStr = String(playerId);
        set(s => {
          const wasVice = s.viceCaptainId && String(s.viceCaptainId) === pIdStr;
          let newBooster = s.activeBooster;
          if (wasVice && s.activeBooster === 'co') {
            newBooster = null; // de-activate co-captain if vice-captain was reassigned to captain
          }

          return {
            captainId: pIdStr,
            viceCaptainId: wasVice ? null : s.viceCaptainId,
            activeBooster: newBooster,
            squad: s.squad.map(sp => ({
              ...sp,
              isCaptain: String(sp.playerId) === pIdStr,
              isViceCaptain: sp.isViceCaptain && String(sp.playerId) !== pIdStr,
            })),
          };
        });
      },

      setViceCaptain: (playerId: string) => {
        const pIdStr = String(playerId);
        set(s => {
          const wasCapt = s.captainId && String(s.captainId) === pIdStr;
          let newBooster = s.activeBooster;
          if (wasCapt && (s.activeBooster === 'triple' || s.activeBooster === 'co')) {
            newBooster = null; // de-activate if captain was reassigned to vice-captain
          }

          return {
            viceCaptainId: pIdStr,
            captainId: wasCapt ? null : s.captainId,
            activeBooster: newBooster,
            squad: s.squad.map(sp => ({
              ...sp,
              isViceCaptain: String(sp.playerId) === pIdStr,
              isCaptain: sp.isCaptain && String(sp.playerId) !== pIdStr,
            })),
          };
        });
      },

      setActiveBooster: (booster: BoosterType | null): ValidationResult => {
        if (!booster) {
          set({ activeBooster: null });
          return { isValid: true, errors: [], warnings: [] };
        }

        const state = get();
        if (booster === 'triple') {
          if (!state.captainId) {
            return {
              isValid: false,
              errors: ['👑 Triple Captain requires a Captain to be selected on your pitch first.'],
              warnings: [],
            };
          }
        }

        if (booster === 'co') {
          const hasCapt = !!state.captainId;
          const hasVice = !!state.viceCaptainId;
          if (!hasCapt && !hasVice) {
            return {
              isValid: false,
              errors: ['👥 Co-Captains requires both a Captain and a Vice-Captain (Assistant) to be selected on your pitch first.'],
              warnings: [],
            };
          }
          if (!hasCapt) {
            return {
              isValid: false,
              errors: ['👑 Co-Captains requires a Captain to be selected on your pitch first.'],
              warnings: [],
            };
          }
          if (!hasVice) {
            return {
              isValid: false,
              errors: ['⭐ Co-Captains requires a Vice-Captain (Assistant) to be selected on your pitch first.'],
              warnings: [],
            };
          }
        }

        set({ activeBooster: booster });
        return { isValid: true, errors: [], warnings: [] };
      },

      setSelectedPosition: (position: string | null) => set({ selectedPosition: position }),
      setIsPickingPlayer: (picking: boolean) => set({ isPickingPlayer: picking }),
      setActiveFilter: (filter: string) => set({ activeFilter: filter }),

      validateSquad: (): ValidationResult => {
        const players = get().squad.map(sp => sp.player);
        return validateSquad(players, get().activeBooster);
      },

      validateForSave: (): ValidationResult => {
        const state = get();
        const players = state.squad.map(sp => sp.player);
        return validateSquadForSave(players, state.captainId, state.activeBooster, state.viceCaptainId, state.squad);
      },

      resetSquad: () => {
        set({ squad: [], captainId: null, viceCaptainId: null, selectedPosition: null, activeBooster: null });
      },

      swapPlayers: (fromId: string, toId: string): { success: boolean; error?: string } => {
        const fStr = String(fromId);
        const tStr = String(toId);
        const state = get();
        const fromSp = state.squad.find(x => String(x.playerId) === fStr);
        const toSp = state.squad.find(x => String(x.playerId) === tStr);

        if (!fromSp || !toSp) {
          return { success: false, error: 'Both players must be in your squad to swap.' };
        }

        // Lockout Rule: A manager cannot swap if either player's match has already kicked off!
        if (isPlayerLocked(fromSp.player) || fromSp.isLocked) {
          return {
            success: false,
            error: `🔒 Cannot swap: ${fromSp.player.name}'s match has already kicked off and is locked.`,
          };
        }
        if (isPlayerLocked(toSp.player) || toSp.isLocked) {
          return {
            success: false,
            error: `🔒 Cannot swap: ${toSp.player.name}'s match has already kicked off and is locked.`,
          };
        }

        const slotA = fromSp.pitchSlot;
        const slotB = toSp.pitchSlot;

        // Tactical Position Eligibility:
        if (!isPositionEligibleForSlot(slotB, fromSp.player.position)) {
          return {
            success: false,
            error: `Tactical position mismatch: Slot #${slotB} does not accept ${fromSp.player.position}.`,
          };
        }
        if (!isPositionEligibleForSlot(slotA, toSp.player.position)) {
          return {
            success: false,
            error: `Tactical position mismatch: Slot #${slotA} does not accept ${toSp.player.position}.`,
          };
        }

        const statusA: RosterStatus = slotB <= SQUAD_RULES.STARTERS_COUNT ? 'STARTER' : 'BENCH';
        const statusB: RosterStatus = slotA <= SQUAD_RULES.STARTERS_COUNT ? 'STARTER' : 'BENCH';

        set(s => {
          const newSquad = s.squad.map(sp => {
            if (String(sp.playerId) === fStr) {
              return {
                ...sp,
                pitchSlot: slotB,
                rosterStatus: statusA,
              };
            }
            if (String(sp.playerId) === tStr) {
              return {
                ...sp,
                pitchSlot: slotA,
                rosterStatus: statusB,
              };
            }
            return sp;
          });
          return { squad: newSquad };
        });

        return { success: true };
      },
    }),
    {
      name: 'kc-fantasy-squad',
      partialize: state => ({
        squad: state.squad,
        captainId: state.captainId,
        viceCaptainId: state.viceCaptainId,
        activeBooster: state.activeBooster,
      }),
    }
  )
);

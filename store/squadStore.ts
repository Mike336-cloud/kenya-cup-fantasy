'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, SquadPlayer, ValidationResult } from '@/types/fantasy';
import { canAddPlayer, validateSquad, validateSquadForSave, SQUAD_RULES } from '@/lib/fantasyRules';

const TOTAL_BUDGET = SQUAD_RULES.TOTAL_BUDGET;

interface SquadState {
  squad: SquadPlayer[];
  captainId: string | null;
  viceCaptainId: string | null;
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
  setSelectedPosition: (position: string | null) => void;
  setIsPickingPlayer: (picking: boolean) => void;
  setActiveFilter: (filter: string) => void;
  validateSquad: () => ValidationResult;
  validateForSave: () => ValidationResult;
  resetSquad: () => void;
  swapPlayers: (fromId: string, toId: string) => void;
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      squad: [],
      captainId: null,
      viceCaptainId: null,
      selectedPosition: null,
      isPickingPlayer: false,
      activeFilter: 'All',

      // ── Computed ────────────────────────────────────────────────────────────
      getRemainingBudget: () => {
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

        const check = canAddPlayer(normalizedPlayer, currentPlayers, remaining);
        if (!check.isValid) return check;

        // Find assigned or first available slot 1-15
        const usedSlots = new Set(state.squad.map(sp => sp.pitchSlot));
        let assignedSlot = pitchSlot;
        if (!assignedSlot || usedSlots.has(assignedSlot)) {
          for (let i = 1; i <= 15; i++) {
            if (!usedSlots.has(i)) {
              assignedSlot = i;
              break;
            }
          }
        }

        const newSquadPlayer: SquadPlayer = {
          playerId: pIdStr,
          player: normalizedPlayer,
          isCaptain: false,
          isViceCaptain: false,
          isLocked: false,
          pitchSlot: assignedSlot || (state.squad.length + 1),
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
          return {
            squad: newSquad,
            captainId: s.captainId && String(s.captainId) === pIdStr ? null : s.captainId,
            viceCaptainId: s.viceCaptainId && String(s.viceCaptainId) === pIdStr ? null : s.viceCaptainId,
          };
        });
      },

      setCaptain: (playerId: string) => {
        const pIdStr = String(playerId);
        set(s => ({
          captainId: pIdStr,
          viceCaptainId: s.viceCaptainId && String(s.viceCaptainId) === pIdStr ? null : s.viceCaptainId,
          squad: s.squad.map(sp => ({
            ...sp,
            isCaptain: String(sp.playerId) === pIdStr,
            isViceCaptain: sp.isViceCaptain && String(sp.playerId) !== pIdStr,
          })),
        }));
      },

      setViceCaptain: (playerId: string) => {
        const pIdStr = String(playerId);
        set(s => ({
          viceCaptainId: pIdStr,
          captainId: s.captainId && String(s.captainId) === pIdStr ? null : s.captainId,
          squad: s.squad.map(sp => ({
            ...sp,
            isViceCaptain: String(sp.playerId) === pIdStr,
            isCaptain: sp.isCaptain && String(sp.playerId) !== pIdStr,
          })),
        }));
      },

      setSelectedPosition: (position: string | null) => set({ selectedPosition: position }),
      setIsPickingPlayer: (picking: boolean) => set({ isPickingPlayer: picking }),
      setActiveFilter: (filter: string) => set({ activeFilter: filter }),

      validateSquad: (): ValidationResult => {
        const players = get().squad.map(sp => sp.player);
        return validateSquad(players);
      },

      validateForSave: (): ValidationResult => {
        const state = get();
        const players = state.squad.map(sp => sp.player);
        return validateSquadForSave(players, state.captainId);
      },

      resetSquad: () => {
        set({ squad: [], captainId: null, viceCaptainId: null, selectedPosition: null });
      },

      swapPlayers: (fromId: string, toId: string) => {
        const fStr = String(fromId);
        const tStr = String(toId);
        set(s => {
          const fromSp = s.squad.find(x => String(x.playerId) === fStr);
          const toSp = s.squad.find(x => String(x.playerId) === tStr);
          if (!fromSp || !toSp) return { squad: s.squad };

          const fromSlot = fromSp.pitchSlot;
          const toSlot = toSp.pitchSlot;

          const newSquad = s.squad.map(sp => {
            if (String(sp.playerId) === fStr) return { ...sp, pitchSlot: toSlot };
            if (String(sp.playerId) === tStr) return { ...sp, pitchSlot: fromSlot };
            return sp;
          });
          return { squad: newSquad };
        });
      },
    }),
    {
      name: 'kc-fantasy-squad',
      partialize: state => ({
        squad: state.squad,
        captainId: state.captainId,
        viceCaptainId: state.viceCaptainId,
      }),
    }
  )
);

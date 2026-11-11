'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player } from '@/types/fantasy';
import { MOCK_PLAYERS } from '@/lib/mockData';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

const INITIAL_PLAYERS: Player[] = MOCK_PLAYERS.map(p => ({
  ...p,
  headshot_url: p.headshot_url ? cleanCloudinaryUrl(p.headshot_url) : null,
  isActive: p.isActive !== false,
  matchStatus: p.matchStatus || (p.isInjured ? 'injured' : p.isSuspended ? 'suspended' : 'starting'),
}));

interface PlayersState {
  players: Player[];
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: number | null;

  // Actions
  fetchPlayers: (force?: boolean) => Promise<void>;
  updatePlayer: (idOrName: string, updates: Partial<Player>) => Promise<Player>;
  addPlayer: (playerData: Omit<Player, 'id'>) => Promise<Player>;
  softDeletePlayer: (id: string) => Promise<void>;
  getPlayer: (idOrName: string) => Player | undefined;
  getPlayerHeadshot: (idOrName: string) => string | null;
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: INITIAL_PLAYERS,
      isLoaded: false,
      isLoading: false,
      lastFetched: null,

      fetchPlayers: async (force = false) => {
        const now = Date.now();
        const last = get().lastFetched;
        if (!force && last && now - last < 15_000 && get().isLoaded) {
          return;
        }

        set({ isLoading: true });
        try {
          const res = await fetch('/api/players', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.players) && data.players.length > 0) {
              const remotePlayers: Player[] = data.players.map((remote: Player) => {
                const rawHeadshot = remote.headshot_url || remote.image || null;
                const cleanHeadshot = cleanCloudinaryUrl(rawHeadshot);
                const cleanClubLogo = remote.clubs?.logo_url
                  ? cleanCloudinaryUrl(remote.clubs.logo_url)
                  : remote.club_logo_url
                  ? cleanCloudinaryUrl(remote.club_logo_url)
                  : null;

                return {
                  ...remote,
                  headshot_url: cleanHeadshot,
                  image: cleanHeadshot ?? undefined,
                  club_logo_url: cleanClubLogo,
                  clubs: remote.clubs ? {
                    ...remote.clubs,
                    logo_url: cleanClubLogo,
                  } : null,
                  isActive: remote.isActive !== false,
                  matchStatus: remote.matchStatus || (remote.isInjured ? 'injured' : remote.isSuspended ? 'suspended' : 'starting'),
                };
              });

              // Guard against partial list: if remote has fewer players, preserve rest from INITIAL_PLAYERS
              const remoteNames = new Set(remotePlayers.map(p => p.name.toLowerCase()));
              const missingFromInitial = INITIAL_PLAYERS.filter(p => !remoteNames.has(p.name.toLowerCase()));
              const finalRoster = [...remotePlayers, ...missingFromInitial];

              set({ players: finalRoster, isLoaded: true, isLoading: false, lastFetched: now });
              return;
            }
          }
        } catch (err) {
          console.warn('Could not fetch players from /api/players:', err);
        }
        set({ isLoaded: true, isLoading: false, lastFetched: now });
      },

      updatePlayer: async (idOrName: string, updates: Partial<Player>) => {
        const needle = idOrName.toLowerCase().trim();
        const target = get().players.find(
          p => p.id === idOrName || p.name.toLowerCase() === needle
        );

        if (!target) {
          throw new Error(`Player ${idOrName} not found`);
        }

        const headshot = updates.headshot_url !== undefined
          ? cleanCloudinaryUrl(updates.headshot_url)
          : updates.image !== undefined
          ? cleanCloudinaryUrl(updates.image)
          : target.headshot_url;

        const optimisticUpdated: Player = {
          ...target,
          ...updates,
          headshot_url: headshot,
          image: headshot ?? undefined,
        };

        // 1. Immediate optimistic update in Zustand store so UI reflects change immediately
        set(state => ({
          players: state.players.map(p =>
            (p.id === target.id || p.name.toLowerCase() === needle) ? optimisticUpdated : p
          ),
        }));

        // 2. Persist to API with PUT
        try {
          const res = await fetch('/api/players', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...optimisticUpdated,
              id: target.id,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with status ${res.status}`);
          }

          const data = await res.json();
          if (data.success && data.player) {
            const serverPlayer = data.player;
            const savedHeadshot = cleanCloudinaryUrl(serverPlayer.headshot_url || serverPlayer.image || headshot);
            const savedClubLogo = serverPlayer.clubs?.logo_url
              ? cleanCloudinaryUrl(serverPlayer.clubs.logo_url)
              : serverPlayer.club_logo_url
              ? cleanCloudinaryUrl(serverPlayer.club_logo_url)
              : target.club_logo_url;

            const finalized: Player = {
              ...optimisticUpdated,
              ...serverPlayer,
              headshot_url: savedHeadshot,
              image: savedHeadshot ?? undefined,
              club_logo_url: savedClubLogo,
              clubs: serverPlayer.clubs ? {
                ...serverPlayer.clubs,
                logo_url: savedClubLogo,
              } : optimisticUpdated.clubs,
              matchStatus: serverPlayer.matchStatus || (serverPlayer.isInjured ? 'injured' : serverPlayer.isSuspended ? 'suspended' : 'starting'),
            };

            // 3. Map over players array and replace target player with finalized server record
            set(state => ({
              players: state.players.map(p =>
                (p.id === target.id || p.id === finalized.id || p.name.toLowerCase() === needle) ? finalized : p
              ),
              lastFetched: Date.now(),
            }));

            return finalized;
          } else {
            throw new Error(data.error || 'Failed to update player');
          }
        } catch (err: unknown) {
          console.error('Failed to sync player update to /api/players:', err);
          throw err;
        }
      },

      addPlayer: async (playerData: Omit<Player, 'id'>) => {
        const headshot = cleanCloudinaryUrl(playerData.headshot_url || playerData.image || null);
        const tempId = `temp_${Date.now()}`;
        const newPlayer: Player = {
          ...playerData,
          id: tempId,
          headshot_url: headshot,
          image: headshot ?? undefined,
        };

        // 1. Optimistic update
        set(state => ({ players: [newPlayer, ...state.players] }));

        // 2. Persist to API
        try {
          const res = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with ${res.status}`);
          }

          const data = await res.json();
          if (data.success && data.player) {
            const serverPlayer = data.player;
            const finalized: Player = {
              ...newPlayer,
              ...serverPlayer,
              headshot_url: cleanCloudinaryUrl(serverPlayer.headshot_url || serverPlayer.image || headshot),
              image: cleanCloudinaryUrl(serverPlayer.headshot_url || serverPlayer.image || headshot) ?? undefined,
            };

            set(state => ({
              players: state.players.map(p => (p.id === tempId ? finalized : p)),
              lastFetched: Date.now(),
            }));

            return finalized;
          }
        } catch (err) {
          console.error('Failed to sync new player to /api/players:', err);
          throw err;
        }

        return newPlayer;
      },

      softDeletePlayer: async (id: string) => {
        const player = get().players.find(p => p.id === id);
        if (!player) return;
        await get().updatePlayer(id, { isActive: false });
      },

      getPlayer: (idOrName: string) => {
        if (!idOrName) return undefined;
        const q = idOrName.toLowerCase().trim();
        return get().players.find(p => p.id === idOrName || p.name.toLowerCase() === q);
      },

      getPlayerHeadshot: (idOrName: string) => {
        const player = get().getPlayer(idOrName);
        const url = player?.headshot_url || player?.image || null;
        return cleanCloudinaryUrl(url);
      },
    }),
    {
      name: 'kc_players_storage_v2',
      partialize: state => ({ players: state.players }),
    }
  )
);

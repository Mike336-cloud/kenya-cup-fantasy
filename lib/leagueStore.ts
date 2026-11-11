'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { League, LeagueMember } from '@/types/fantasy';
import { MOCK_LEAGUE_MEMBERS } from '@/lib/mockData';

export const GLOBAL_LEAGUE_ID = 'overall-kenya-cup-leaderboard';
export const GLOBAL_LEAGUE_NAME = 'Overall Kenya Cup Leaderboard';
export const GLOBAL_LEAGUE_CODE = 'GLOBAL';

const INITIAL_GLOBAL_LEAGUE: League = {
  id: GLOBAL_LEAGUE_ID,
  name: GLOBAL_LEAGUE_NAME,
  code: GLOBAL_LEAGUE_CODE,
  adminId: 'system',
  type: 'public',
  season: '26/27',
  createdAt: '2026-11-01T00:00:00Z',
  members: MOCK_LEAGUE_MEMBERS.map(m => ({ ...m })),
};

const INITIAL_PRIVATE_LEAGUE: League = {
  id: 'nairobi-fantasy-elite',
  name: '🏆 Nairobi Fantasy Elite',
  code: 'KC1337',
  adminId: 'u1',
  type: 'private',
  season: '26/27',
  createdAt: '2026-11-05T12:00:00Z',
  members: MOCK_LEAGUE_MEMBERS.map(m => ({ ...m })),
};

interface LeagueStoreState {
  leagues: League[];
  activeLeagueId: string;
  isLoading: boolean;
  error: string | null;

  // Real-time live code lookup states
  searchResult: League | null;
  isSearching: boolean;
  searchError: string | null;

  // Actions
  fetchUserLeagues: (userId?: string) => Promise<void>;
  createLeague: (name: string, type: 'public' | 'private', userTeamName?: string) => Promise<{ success: boolean; league?: League; error?: string }>;
  joinLeague: (code: string, userTeamName?: string) => Promise<{ success: boolean; league?: League; error?: string }>;
  searchLeagueByCode: (code: string) => Promise<League | null>;
  clearSearch: () => void;
  setActiveLeague: (leagueId: string) => void;
  syncUserScore: (gwPoints: number, totalPoints: number, teamName?: string) => void;
  getActiveLeague: () => League | undefined;
}

function recalculateRanks(members: LeagueMember[]): LeagueMember[] {
  const sorted = [...members].sort((a, b) => b.totalPoints - a.totalPoints);
  return sorted.map((m, index) => {
    const newRank = index + 1;
    const prevRank = m.previousRank || m.rank || newRank;
    return {
      ...m,
      rank: newRank,
      previousRank: prevRank,
      rankChange: prevRank - newRank,
    };
  });
}

export const useLeagueStore = create<LeagueStoreState>()(
  persist(
    (set, get) => ({
      leagues: [INITIAL_GLOBAL_LEAGUE, INITIAL_PRIVATE_LEAGUE],
      activeLeagueId: GLOBAL_LEAGUE_ID,
      isLoading: false,
      error: null,
      searchResult: null,
      isSearching: false,
      searchError: null,

      getActiveLeague: () => {
        const { leagues, activeLeagueId } = get();
        return leagues.find(l => l.id === activeLeagueId) || leagues[0];
      },

      setActiveLeague: (leagueId: string) => {
        set({ activeLeagueId: leagueId });
      },

      clearSearch: () => {
        set({ searchResult: null, searchError: null, isSearching: false });
      },

      fetchUserLeagues: async (userId = 'me') => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`/api/leagues?userId=${encodeURIComponent(userId)}`);
          if (!res.ok) throw new Error('Failed to fetch leagues');
          const data = await res.json();
          if (data.success && Array.isArray(data.leagues) && data.leagues.length > 0) {
            set(state => {
              // Merge server leagues with local leagues, preserving overall leaderboard
              const existingIds = new Set(data.leagues.map((l: League) => l.id));
              const localCustom = state.leagues.filter(l => !existingIds.has(l.id));
              return {
                leagues: [...data.leagues, ...localCustom],
                isLoading: false,
              };
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          // If offline or fetch failed, keep local state
          set({ isLoading: false, error: err.message });
        }
      },

      createLeague: async (name: string, type: 'public' | 'private' = 'private', userTeamName = 'My Fantasy XV') => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/leagues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              name,
              type,
              userId: 'me',
              teamName: userTeamName,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
          }

          const created: League = data.league;
          set(state => {
            const updated = [created, ...state.leagues.filter(l => l.id !== created.id)];
            return {
              leagues: updated,
              activeLeagueId: created.id,
              isLoading: false,
            };
          });

          return { success: true, league: created };
        } catch (err: any) {
          // Local fallback creation if network fails
          const inviteCode = 'KC' + Math.random().toString(36).substring(2, 6).toUpperCase();
          const fallbackLeague: League = {
            id: `league_${Date.now()}`,
            name,
            code: inviteCode,
            adminId: 'me',
            type,
            season: '26/27',
            createdAt: new Date().toISOString(),
            members: [
              {
                userId: 'me',
                teamName: userTeamName,
                totalPoints: 534,
                rank: 1,
                previousRank: 1,
                rankChange: 0,
                gameweekPoints: 74,
              },
            ],
          };

          set(state => ({
            leagues: [fallbackLeague, ...state.leagues],
            activeLeagueId: fallbackLeague.id,
            isLoading: false,
          }));

          return { success: true, league: fallbackLeague };
        }
      },

      joinLeague: async (code: string, userTeamName = 'My Fantasy XV') => {
        set({ isLoading: true, error: null });
        const cleanCode = code.trim().toUpperCase();

        try {
          const res = await fetch('/api/leagues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'join',
              code: cleanCode,
              userId: 'me',
              teamName: userTeamName,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
          }

          const joined: League = data.league;
          set(state => {
            const exists = state.leagues.some(l => l.id === joined.id);
            const updated = exists
              ? state.leagues.map(l => (l.id === joined.id ? joined : l))
              : [...state.leagues, joined];
            return {
              leagues: updated,
              activeLeagueId: joined.id,
              isLoading: false,
              searchResult: null,
            };
          });

          return { success: true, league: joined };
        } catch (err: any) {
          // Check local leagues for matching code
          const state = get();
          const localMatch = state.leagues.find(l => l.code.toUpperCase() === cleanCode);
          if (localMatch) {
            const isMember = localMatch.members.some(m => m.userId === 'me');
            if (isMember) {
              set({ isLoading: false });
              return { success: false, error: 'You are already a member of this league.' };
            }
            const updatedMembers = recalculateRanks([
              ...localMatch.members,
              {
                userId: 'me',
                teamName: userTeamName,
                totalPoints: 534,
                rank: localMatch.members.length + 1,
                previousRank: localMatch.members.length + 1,
                rankChange: 0,
                gameweekPoints: 74,
              },
            ]);
            const updatedLeague = { ...localMatch, members: updatedMembers };
            set({
              leagues: state.leagues.map(l => (l.id === updatedLeague.id ? updatedLeague : l)),
              activeLeagueId: updatedLeague.id,
              isLoading: false,
              searchResult: null,
            });
            return { success: true, league: updatedLeague };
          }

          set({ isLoading: false, error: 'League not found with that code.' });
          return { success: false, error: 'League not found with that code.' };
        }
      },

      searchLeagueByCode: async (code: string) => {
        const clean = code.trim().toUpperCase();
        if (clean.length < 3) {
          set({ searchResult: null, searchError: null, isSearching: false });
          return null;
        }

        set({ isSearching: true, searchError: null });

        try {
          const res = await fetch(`/api/leagues?code=${encodeURIComponent(clean)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.league) {
              set({ searchResult: data.league, isSearching: false, searchError: null });
              return data.league;
            }
          }

          // Fallback search in existing client leagues
          const localMatch = get().leagues.find(l => l.code.toUpperCase() === clean);
          if (localMatch) {
            set({ searchResult: localMatch, isSearching: false, searchError: null });
            return localMatch;
          }

          set({ searchResult: null, isSearching: false, searchError: `No league found for "${clean}".` });
          return null;
        } catch {
          const localMatch = get().leagues.find(l => l.code.toUpperCase() === clean);
          if (localMatch) {
            set({ searchResult: localMatch, isSearching: false, searchError: null });
            return localMatch;
          }
          set({ searchResult: null, isSearching: false, searchError: `No league found for "${clean}".` });
          return null;
        }
      },

      // ── "SINGLE TEAM, MULTIPLE LEAGUES" POINT SYNC ───────────────────────────
      // When a manager's team performance is calculated, this action updates the
      // unified score across all leagues they participate in.
      syncUserScore: (gwPoints: number, totalPoints: number, teamName?: string) => {
        set(state => {
          const updatedLeagues = state.leagues.map(league => {
            const memberIndex = league.members.findIndex(m => m.userId === 'me');
            let newMembers = [...league.members];

            if (memberIndex >= 0) {
              newMembers[memberIndex] = {
                ...newMembers[memberIndex],
                gameweekPoints: gwPoints,
                totalPoints: totalPoints,
                teamName: teamName || newMembers[memberIndex].teamName,
              };
            } else if (league.id === GLOBAL_LEAGUE_ID) {
              newMembers.push({
                userId: 'me',
                teamName: teamName || 'My Fantasy XV',
                totalPoints,
                rank: newMembers.length + 1,
                previousRank: newMembers.length + 1,
                rankChange: 0,
                gameweekPoints: gwPoints,
              });
            }

            return {
              ...league,
              members: recalculateRanks(newMembers),
            };
          });

          return { leagues: updatedLeagues };
        });
      },
    }),
    {
      name: 'kenya-cup-leagues-storage',
      partialize: state => ({
        leagues: state.leagues,
        activeLeagueId: state.activeLeagueId,
      }),
    }
  )
);


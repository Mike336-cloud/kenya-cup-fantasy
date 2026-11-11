'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Fixture } from '@/types/fantasy';
import { MOCK_FIXTURES } from '@/lib/mockData';

export type MutableFixture = Fixture & { isPostponed?: boolean };

const INITIAL_FIXTURES: MutableFixture[] = MOCK_FIXTURES.map(f => ({
  ...f,
  isPostponed: false,
}));

interface FixturesState {
  fixtures: MutableFixture[];
  activeRound: number;
  manualActiveRound: number | null;
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: number | null;

  // Actions
  setActiveRound: (round: number) => void;
  calculateActiveRound: (fixtureList?: MutableFixture[]) => number;
  fetchFixtures: (force?: boolean) => Promise<void>;
  createFixture: (fixtureData: Omit<Fixture, 'id'>) => Promise<MutableFixture>;
  updateFixture: (id: string, updates: Partial<MutableFixture>) => Promise<MutableFixture>;
  deleteFixture: (id: string) => Promise<void>;
  togglePostpone: (id: string) => Promise<void>;
  getFixturesByGameweek: (gameweek: number) => MutableFixture[];
}

export const useFixtureStore = create<FixturesState>()(
  persist(
    (set, get) => ({
      fixtures: INITIAL_FIXTURES,
      activeRound: 1,
      manualActiveRound: null,
      isLoaded: false,
      isLoading: false,
      lastFetched: null,

      calculateActiveRound: (fixtureList?: MutableFixture[]) => {
        const list = fixtureList || get().fixtures;
        if (!list || list.length === 0) return 1;

        // Earliest unconcluded fixture (status not completed / concluded)
        const unconcluded = [...list]
          .filter(f => {
            const s = (f.status || '').toLowerCase();
            return s !== 'completed' && s !== 'concluded';
          })
          .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

        if (unconcluded.length > 0) {
          const earliest = unconcluded[0];
          const roundVal = Number(earliest.gameweek || (earliest as unknown as { round?: number }).round);
          return isNaN(roundVal) || roundVal < 1 ? 1 : roundVal;
        }

        // Fallback: highest round or 1
        const maxRound = Math.max(...list.map(f => Number(f.gameweek || 1)), 1);
        return maxRound;
      },

      setActiveRound: (round: number) => {
        set({ activeRound: round, manualActiveRound: round });
      },

      fetchFixtures: async (force = false) => {
        const now = Date.now();
        const last = get().lastFetched;
        if (!force && last && now - last < 30_000 && get().isLoaded) {
          return;
        }

        set({ isLoading: true });
        try {
          const res = await fetch('/api/fixtures');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.fixtures) && data.fixtures.length > 0) {
              const existingMap = new Map(get().fixtures.map(f => [f.id, f]));
              const merged: MutableFixture[] = data.fixtures.map((remote: Fixture) => {
                const local = existingMap.get(remote.id);
                return {
                  ...remote,
                  isPostponed: local?.isPostponed ?? false,
                };
              });

              const allFixtures = merged;
              const computedActive = get().calculateActiveRound(allFixtures);
              const active = get().manualActiveRound ?? computedActive;

              set({
                fixtures: allFixtures,
                activeRound: active,
                isLoaded: true,
                isLoading: false,
                lastFetched: now,
              });
              return;
            }
          }
        } catch (err) {
          console.warn('Could not fetch fixtures from /api/fixtures:', err);
        }
        set({ isLoaded: true, isLoading: false, lastFetched: now });
      },

      createFixture: async (fixtureData: Omit<Fixture, 'id'>) => {
        const tempId = `f_${Date.now()}`;
        const newFixture: MutableFixture = {
          ...fixtureData,
          id: tempId,
          isPostponed: false,
        };

        // 1. Optimistic update
        set(state => ({
          fixtures: [newFixture, ...state.fixtures],
        }));

        // 2. Persist to API / Supabase
        try {
          const res = await fetch('/api/fixtures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fixtureData),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.fixture) {
              const serverFixture: MutableFixture = {
                ...data.fixture,
                isPostponed: false,
              };
              set(state => ({
                fixtures: state.fixtures.map(f => (f.id === tempId ? serverFixture : f)),
              }));
              return serverFixture;
            }
          }
        } catch (err) {
          console.error('Failed to create fixture via /api/fixtures:', err);
        }

        return newFixture;
      },

      updateFixture: async (id: string, updates: Partial<MutableFixture>) => {
        const target = get().fixtures.find(f => f.id === id);
        if (!target) throw new Error(`Fixture ${id} not found`);

        const updated: MutableFixture = {
          ...target,
          ...updates,
        };

        // 1. Optimistic update
        set(state => ({
          fixtures: state.fixtures.map(f => (f.id === id ? updated : f)),
        }));

        // 2. Persist to API
        try {
          const res = await fetch('/api/fixtures', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.fixture) {
              set(state => ({
                fixtures: state.fixtures.map(f => (f.id === id ? { ...updated, ...data.fixture } : f)),
              }));
              return { ...updated, ...data.fixture };
            }
          }
        } catch (err) {
          console.error('Failed to update fixture via /api/fixtures:', err);
        }

        return updated;
      },

      deleteFixture: async (id: string) => {
        // 1. Optimistic delete
        set(state => ({
          fixtures: state.fixtures.filter(f => f.id !== id),
        }));

        // 2. Delete on server
        try {
          await fetch(`/api/fixtures?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to delete fixture via /api/fixtures:', err);
        }
      },

      togglePostpone: async (id: string) => {
        const f = get().fixtures.find(item => item.id === id);
        if (!f) return;
        const next = !f.isPostponed;
        await get().updateFixture(id, { isPostponed: next });
      },

      getFixturesByGameweek: (gameweek: number) => {
        return get().fixtures.filter(f => Number(f.gameweek) === Number(gameweek));
      },
    }),
    {
      name: 'kc_fixtures_storage_v2',
      partialize: state => ({
        fixtures: state.fixtures,
        activeRound: state.activeRound,
        manualActiveRound: state.manualActiveRound,
      }),
    }
  )
);


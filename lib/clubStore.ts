'use client';
import { create } from 'zustand';
import { ClubRecord } from '@/types/fantasy';
import { CLUB_META } from '@/lib/mockData';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

export const INITIAL_CLUBS: ClubRecord[] = Object.entries(CLUB_META).map(([name, meta], i) => ({
  id: `club_${i + 1}`,
  name,
  abbreviation: meta.abbr,
  logo_url: meta.logo ? cleanCloudinaryUrl(meta.logo) : null,
  primary_color: meta.color,
  secondary_color: '#000000',
  home_ground: null,
  is_active_in_kenya_cup: true,
  founded_year: null,
}));

interface ClubsState {
  clubs: ClubRecord[];
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: number | null;

  // Actions
  fetchClubs: (force?: boolean) => Promise<void>;
  updateClub: (nameOrId: string, updates: Partial<ClubRecord>) => Promise<ClubRecord>;
  addClub: (club: Omit<ClubRecord, 'id'>) => Promise<ClubRecord>;
  toggleClubActive: (id: string) => Promise<void>;
  getClub: (nameOrAbbr: string) => ClubRecord | undefined;
  getClubLogo: (nameOrAbbr: string) => string | null;
  getClubMeta: (nameOrAbbr: string) => { abbr: string; color: string; bg: string; logo: string | null };
}

export const useClubsStore = create<ClubsState>((set, get) => ({
  clubs: INITIAL_CLUBS,
  isLoaded: false,
  isLoading: false,
  lastFetched: null,

  fetchClubs: async (force = false) => {
        const now = Date.now();
        const last = get().lastFetched;
        if (!force && last && now - last < 30_000 && get().isLoaded) {
          return;
        }

        set({ isLoading: true });
        try {
          const res = await fetch('/api/clubs');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.clubs) && data.clubs.length > 0) {
              const existingMap = new Map(get().clubs.map(c => [c.name.toLowerCase(), c]));
              const merged = data.clubs.map((remote: ClubRecord) => {
                const local = existingMap.get(remote.name.toLowerCase());
                const rawUrl = remote.logo_url || local?.logo_url || null;
                return {
                  ...remote,
                  logo_url: cleanCloudinaryUrl(rawUrl),
                };
              });

              set({ clubs: merged, isLoaded: true, isLoading: false, lastFetched: now });
              return;
            }
          }
        } catch (err) {
          console.warn('Could not fetch clubs from /api/clubs:', err);
        }
        set({ isLoaded: true, isLoading: false, lastFetched: now });
      },

      updateClub: async (nameOrId: string, updates: Partial<ClubRecord>) => {
        const needle = nameOrId.toLowerCase().trim();
        const target = get().clubs.find(
          c => c.id === nameOrId || c.name.toLowerCase() === needle || c.abbreviation.toLowerCase() === needle
        );

        const currentClub = target ?? {
          id: `club_${Date.now()}`,
          name: nameOrId,
          abbreviation: nameOrId.slice(0, 3).toUpperCase(),
          logo_url: null,
          primary_color: '#16a34a',
          secondary_color: '#000000',
          home_ground: null,
          is_active_in_kenya_cup: true,
          founded_year: null,
        };

        const updatedLogo = updates.logo_url !== undefined ? cleanCloudinaryUrl(updates.logo_url) : currentClub.logo_url;

        const updated: ClubRecord = {
          ...currentClub,
          ...updates,
          logo_url: updatedLogo,
          updated_at: new Date().toISOString(),
        };

        // 1. Optimistic store update
        set(state => ({
          clubs: state.clubs.map(c => (c.name.toLowerCase() === currentClub.name.toLowerCase() ? updated : c)),
        }));

        // 2. Server sync via /api/clubs
        try {
          const res = await fetch('/api/clubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.club) {
              set(state => ({
                clubs: state.clubs.map(c =>
                  c.name.toLowerCase() === updated.name.toLowerCase()
                    ? { ...updated, ...data.club, logo_url: cleanCloudinaryUrl(data.club.logo_url ?? updated.logo_url) }
                    : c
                ),
              }));
              return { ...updated, ...data.club };
            }
          }
        } catch (err) {
          console.error('Failed to sync club update to /api/clubs:', err);
        }

        return updated;
      },

      addClub: async (clubData: Omit<ClubRecord, 'id'>) => {
        const newClub: ClubRecord = {
          ...clubData,
          id: `club_${Date.now()}`,
          logo_url: cleanCloudinaryUrl(clubData.logo_url),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({ clubs: [newClub, ...state.clubs] }));

        try {
          const res = await fetch('/api/clubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClub),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.club) {
              set(state => ({
                clubs: state.clubs.map(c => (c.id === newClub.id ? { ...newClub, ...data.club } : c)),
              }));
              return { ...newClub, ...data.club };
            }
          }
        } catch (err) {
          console.error('Failed to sync new club to /api/clubs:', err);
        }

        return newClub;
      },

      toggleClubActive: async (id: string) => {
        const club = get().clubs.find(c => c.id === id);
        if (!club) return;
        await get().updateClub(club.name, { is_active_in_kenya_cup: !club.is_active_in_kenya_cup });
      },

      getClub: (nameOrAbbr: string) => {
        if (!nameOrAbbr) return undefined;
        const q = nameOrAbbr.toLowerCase().trim();
        return get().clubs.find(
          c => c.name.toLowerCase() === q || c.abbreviation.toLowerCase() === q || c.id === nameOrAbbr
        );
      },

      getClubLogo: (nameOrAbbr: string) => {
        const club = get().getClub(nameOrAbbr);
        return club?.logo_url ? cleanCloudinaryUrl(club.logo_url) : null;
      },

      getClubMeta: (nameOrAbbr: string) => {
        const club = get().getClub(nameOrAbbr);
        const meta = (nameOrAbbr ? CLUB_META[nameOrAbbr] : undefined) ?? {
          abbr: club?.abbreviation ?? (nameOrAbbr ? nameOrAbbr.slice(0, 3).toUpperCase() : 'RFC'),
          color: club?.primary_color ?? '#10B981',
          bg: '#064E3B',
          logo: undefined,
        };

        const resolvedLogo = club?.logo_url
          ? cleanCloudinaryUrl(club.logo_url)
          : meta.logo
          ? cleanCloudinaryUrl(meta.logo)
          : null;

        return {
          abbr: club?.abbreviation ?? meta.abbr,
          color: club?.primary_color ?? meta.color,
          bg: meta.bg,
          logo: resolvedLogo,
        };
      },
}));

// Clear any stale persisted clubs cache to avoid hydration mismatches
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('kc_clubs_storage_v1');
  } catch {
    // Ignore in restricted environments
  }
}

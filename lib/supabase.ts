// ─────────────────────────────────────────────────────────────────────────────
// Supabase Client – production-ready stub
// Replace NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// with your actual values from the Supabase dashboard.
//
// Tables expected (see /types/fantasy.ts → Database):
//   players · squads · squad_players · fixtures · leagues · player_stats
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/fantasy';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True once env vars are configured */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnon);

/**
 * Typed Supabase client singleton.
 * Returns null when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are not yet set,
 * so the app runs in mock-data mode without crashing.
 */
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnon, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Helper: throws a readable error when called before Supabase is configured */
export function getSupabase(): NonNullable<typeof supabase> {
  if (!supabase) {
    throw new Error(
      '🔴 Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. ' +
      'See .env.example for instructions.'
    );
  }
  return supabase;
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed helper queries (swap mock data for these once Supabase is wired up)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all players for a given season */
export async function fetchPlayers() {
  const { data, error } = await getSupabase()
    .from('players')
    .select('*')
    .order('totalPoints', { ascending: false });

  if (error) throw error;
  return data;
}

/** Fetch the current user's squad for a given gameweek */
export async function fetchSquad(userId: string, gameweek: number) {
  const { data, error } = await getSupabase()
    .from('squads')
    .select('*, squad_players(*, players(*))')
    .eq('userId', userId)
    .eq('gameweek', gameweek)
    .single();

  if (error) throw error;
  return data;
}

/** Fetch all fixtures for a given gameweek */
export async function fetchFixtures(gameweek: number) {
  const { data, error } = await getSupabase()
    .from('fixtures')
    .select('*')
    .eq('gameweek', gameweek)
    .order('kickoffTime');

  if (error) throw error;
  return data;
}

/** Fetch league members with rankings */
export async function fetchLeagueStandings(leagueId: string) {
  const { data, error } = await getSupabase()
    .from('leagues')
    .select('*, league_members(*, users(teamName, overallPoints, gameweekPoints))')
    .eq('id', leagueId)
    .single();

  if (error) throw error;
  return data;
}

/** Upsert a squad (save/update) */
export async function saveSquad(squadData: {
  userId: string;
  gameweek: number;
  captainId: string;
  viceCaptainId: string;
  playerIds: string[];
}) {
  const squadRecord: Database['public']['Tables']['squads']['Insert'] = {
    userId: squadData.userId,
    gameweek: squadData.gameweek,
    captainId: squadData.captainId,
    viceCaptainId: squadData.viceCaptainId,
    budget: 100_000_000,
    totalBudget: 100_000_000,
    isLocked: false,
  };

  const { data, error } = await getSupabase()
    .from('squads')
    .upsert(squadRecord)
    .select()
    .single();

  if (error) throw error;
  return data;
}

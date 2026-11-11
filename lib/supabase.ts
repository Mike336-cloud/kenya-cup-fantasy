// ─────────────────────────────────────────────────────────────────────────────
// Supabase Client – Scalable & Edge-Ready with Connection Pooling
// ─────────────────────────────────────────────────────────────────────────────
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/fantasy';

// Scalability: Support connection-pooled Supavisor / PgBouncer endpoints
// in high-concurrency production (e.g. 30 mins before kickoff)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_POOLED_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True once env vars are configured */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnon);

/**
 * Typed Supabase client singleton with connection pooling support.
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
// React cache() memoized queries to prevent duplicate reads during high traffic
// ─────────────────────────────────────────────────────────────────────────────

/** Memoized fetch all players */
export const getCachedPlayers = cache(async () => {
  const { data, error } = await getSupabase()
    .from('players')
    .select('*, clubs(id, name, logo_url, abbreviation, primary_color)')
    .order('totalPoints', { ascending: false });

  if (error) throw error;
  return data;
});

/** Memoized fetch all 12 active Kenya Cup clubs */
export const getCachedClubs = cache(async () => {
  const { data, error } = await getSupabase()
    .from('clubs')
    .select('*')
    .eq('is_active_in_kenya_cup', true)
    .order('name');

  if (error) throw error;
  return data;
});

/** Memoized fetch fixtures for a given gameweek */
export const getCachedFixtures = cache(async (gameweek: number) => {
  const { data, error } = await getSupabase()
    .from('fixtures')
    .select('*')
    .eq('gameweek', gameweek)
    .order('kickoffTime');

  if (error) throw error;
  return data;
});

/** Fetch all players for a given season (compatible backward alias) */
export async function fetchPlayers() {
  return getCachedPlayers();
}

/** Fetch all fixtures for a given gameweek */
export async function fetchFixtures(gameweek: number) {
  return getCachedFixtures(gameweek);
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

/** Fetch league members with rankings */
export async function fetchLeagueStandings(leagueId: string) {
  const { data, error } = await getSupabase()
    .from('leagues')
    .select('*, league_members(*, fantasy_users(teamName, overallPoints, gameweekPoints, avatar_url))')
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
    budget: 150_000_000,
    totalBudget: 150_000_000,
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

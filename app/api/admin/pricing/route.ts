import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runPricingEngine } from '@/lib/pricingEngine';
import { Player } from '@/types/fantasy';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_POOLED_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * POST /api/admin/pricing
 * Triggers transfer market pricing adjustments across all players.
 */
export async function POST() {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    // 1. Fetch current players
    const { data: dbPlayers, error: pErr } = await supabase
      .from('players')
      .select('*');

    if (pErr || !dbPlayers) {
      return NextResponse.json({ success: false, error: pErr?.message || 'Failed to fetch players' }, { status: 500 });
    }

    // 2. Fetch match events from past 3 gameweeks to calculate real form
    const { data: events } = await supabase
      .from('match_events')
      .select('"playerId", gameweek, tries, "tryAssists", conversions, "penaltyGoals", dropGoals, tackles, carries')
      .order('gameweek', { ascending: false });

    const playerScoresHistory: Record<string, number[]> = {};
    if (events) {
      for (const ev of events) {
        if (!playerScoresHistory[ev.playerId]) {
          playerScoresHistory[ev.playerId] = [];
        }
        if (playerScoresHistory[ev.playerId].length < 3) {
          const approxPts =
            (ev.tries || 0) * 5 +
            (ev.tryAssists || 0) * 2 +
            (ev.conversions || 0) * 2 +
            (ev.penaltyGoals || 0) * 3 +
            (ev.tackles || 0) * 0.2;
          playerScoresHistory[ev.playerId].push(approxPts);
        }
      }
    }

    // 3. Run pricing algorithm
    const adjustments = runPricingEngine(dbPlayers as Player[], playerScoresHistory);

    // 4. Update database
    const updatePromises = adjustments.map(adj =>
      supabase
        .from('players')
        .update({
          previous_cost: adj.currentCost,
          cost: adj.newCost,
          form_rating: adj.formRating,
        })
        .eq('id', adj.playerId)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedCount: adjustments.length,
      adjustments,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


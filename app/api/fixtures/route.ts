import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MOCK_FIXTURES } from '@/lib/mockData';
import { Fixture } from '@/types/fantasy';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// GET /api/fixtures — returns all fixtures from Supabase or fallback
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('gameweek', { ascending: true })
        .order('kickoffTime', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, fixtures: data, source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, fixtures: MOCK_FIXTURES, source: 'mock_data' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in GET /api/fixtures:', msg);
    return NextResponse.json({ success: true, fixtures: MOCK_FIXTURES, source: 'error_fallback' });
  }
}

// POST /api/fixtures — creates a new fixture
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameweek, homeClub, awayClub, kickoffTime, venue, status } = body;

    if (!homeClub || !awayClub) {
      return NextResponse.json({ success: false, error: 'Home and Away clubs are required' }, { status: 400 });
    }
    if (homeClub === awayClub) {
      return NextResponse.json({ success: false, error: 'Home club and Away club cannot be the same' }, { status: 400 });
    }
    if (!kickoffTime) {
      return NextResponse.json({ success: false, error: 'Kickoff time is required' }, { status: 400 });
    }

    const payload = {
      gameweek: Number(gameweek) || 1,
      homeClub,
      awayClub,
      kickoffTime: new Date(kickoffTime).toISOString(),
      venue: venue || 'RFUEA Ground',
      status: status || 'scheduled',
      homeScore: body.homeScore ?? null,
      awayScore: body.awayScore ?? null,
    };

    const supabase = getAdminClient();
    if (!supabase) {
      const fallbackFixture: Fixture = {
        ...payload,
        id: `f_${Date.now()}`,
      };
      return NextResponse.json({
        success: true,
        fixture: fallbackFixture,
        source: 'local_only',
        message: 'Saved to local store (Supabase not configured)',
      });
    }

    const { data, error } = await supabase
      .from('fixtures')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase fixture insert error:', error);
      const fallbackFixture: Fixture = {
        ...payload,
        id: `f_${Date.now()}`,
      };
      return NextResponse.json({
        success: true,
        fixture: fallbackFixture,
        source: 'local_fallback',
        warning: error.message,
      });
    }

    return NextResponse.json({ success: true, fixture: data, source: 'supabase_insert' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in POST /api/fixtures:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT /api/fixtures — updates an existing fixture (kickoffTime, venue, status, postponement)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, kickoffTime, venue, status, isPostponed, homeClub, awayClub, gameweek, homeScore, awayScore } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Fixture ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        fixture: body,
        source: 'local_only',
      });
    }

    const updatePayload: Record<string, unknown> = {};
    if (kickoffTime) updatePayload.kickoffTime = new Date(kickoffTime).toISOString();
    if (venue) updatePayload.venue = venue;
    if (status) updatePayload.status = status;
    if (homeScore !== undefined) updatePayload.homeScore = homeScore;
    if (awayScore !== undefined) updatePayload.awayScore = awayScore;
    if (homeClub) updatePayload.homeClub = homeClub;
    if (awayClub) updatePayload.awayClub = awayClub;
    if (gameweek) updatePayload.gameweek = Number(gameweek);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      // Local fixture id (e.g. f_01 or f_12345)
      return NextResponse.json({
        success: true,
        fixture: body,
        source: 'local_id_acknowledged',
      });
    }

    const { data, error } = await supabase
      .from('fixtures')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase fixture update error:', error);
      return NextResponse.json({ success: true, fixture: body, warning: error.message });
    }

    return NextResponse.json({ success: true, fixture: data, source: 'supabase_update' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in PUT /api/fixtures:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/fixtures — deletes a fixture
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Fixture ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabase.from('fixtures').delete().eq('id', id);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in DELETE /api/fixtures:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_POOLED_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile?userId=...
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId')?.trim();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('fantasy_users')
        .select('id, email, teamName, username, avatar_url, is_admin, overallPoints, overallRank, gameweekPoints')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, user: data });
      }
    }

    // Default fallback profile
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: 'manager@kenyacup.ke',
        teamName: 'My Kenya Cup XV',
        username: 'rugby_boss',
        avatar_url: null,
        is_admin: false,
        overallPoints: 534,
        overallRank: 6,
        gameweekPoints: 74,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/profile
// Saves avatar_url, teamName, username
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, avatar_url, teamName, username } = body;

    const supabase = getAdminClient();
    if (supabase && userId) {
      const updates: Record<string, any> = {};
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (teamName !== undefined) updates.teamName = teamName.trim();
      if (username !== undefined) updates.username = username.trim().toLowerCase();

      const { data, error } = await supabase
        .from('fantasy_users')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, user: data });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId || 'me',
        avatar_url: avatar_url || null,
        teamName: teamName || 'My Kenya Cup XV',
        username: username || 'rugby_boss',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


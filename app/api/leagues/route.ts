import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { League, LeagueMember } from '@/types/fantasy';
import { MOCK_LEAGUE_MEMBERS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GLOBAL_LEAGUE_ID = 'overall-kenya-cup-leaderboard';
export const GLOBAL_LEAGUE_NAME = 'Overall Kenya Cup Leaderboard';
export const GLOBAL_LEAGUE_CODE = 'GLOBAL';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// In-memory fallback leagues to ensure seamless functionality in development or offline mode
let fallbackLeagues: League[] = [
  {
    id: GLOBAL_LEAGUE_ID,
    name: GLOBAL_LEAGUE_NAME,
    code: GLOBAL_LEAGUE_CODE,
    adminId: 'system',
    type: 'public',
    season: '26/27',
    createdAt: '2026-11-01T00:00:00Z',
    members: MOCK_LEAGUE_MEMBERS.map(m => ({ ...m })),
  },
  {
    id: 'nairobi-fantasy-elite',
    name: '🏆 Nairobi Fantasy Elite',
    code: 'KC1337',
    adminId: 'u1',
    type: 'private',
    season: '26/27',
    createdAt: '2026-11-05T12:00:00Z',
    members: MOCK_LEAGUE_MEMBERS.map(m => ({ ...m })),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leagues
// ?code=XYZ       -> search league by 6-char code
// ?userId=...     -> fetch user's enrolled leagues
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeParam = searchParams.get('code')?.trim().toUpperCase();
    const userIdParam = searchParams.get('userId')?.trim() || 'me';

    const supabase = getAdminClient();

    // 1. Live code lookup (for Join tab real-time filtering)
    if (codeParam) {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('leagues')
            .select(`
              id, name, code, "adminId", type, season, created_at,
              league_members (
                id, "userId", rank, "previousRank", "rankChange"
              )
            `)
            .ilike('code', codeParam)
            .maybeSingle();

          if (data && !error) {
            const league: League = {
              id: data.id,
              name: data.name,
              code: data.code,
              adminId: data.adminId,
              type: data.type as 'public' | 'private',
              season: data.season,
              createdAt: data.created_at,
              members: (data.league_members || []).map((m: any) => ({
                userId: m.userId,
                teamName: 'Manager Team',
                totalPoints: 0,
                rank: m.rank || 1,
                previousRank: m.previousRank || 1,
                rankChange: m.rankChange || 0,
                gameweekPoints: 0,
              })),
            };
            return NextResponse.json({ success: true, league });
          }
        } catch {
          // fall through to fallback
        }
      }

      // Check fallback leagues
      const matched = fallbackLeagues.find(l => l.code.toUpperCase() === codeParam);
      if (matched) {
        return NextResponse.json({ success: true, league: matched });
      }
      return NextResponse.json({ success: false, error: 'League not found' }, { status: 404 });
    }

    // 2. Fetch user's enrolled leagues
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select(`
            id, name, code, "adminId", type, season, created_at,
            league_members!inner (
              "userId"
            )
          `)
          .eq('league_members.userId', userIdParam);

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: League[] = data.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code,
            adminId: d.adminId,
            type: d.type as 'public' | 'private',
            season: d.season,
            createdAt: d.created_at,
            members: [],
          }));
          return NextResponse.json({ success: true, leagues: mapped });
        }
      } catch {
        // fall through to fallback
      }
    }

    // Ensure fallback leagues always have the user enrolled
    const userLeagues = fallbackLeagues.filter(l =>
      l.type === 'public' || l.members.some(m => m.userId === userIdParam || m.userId === 'me')
    );

    return NextResponse.json({ success: true, leagues: userLeagues });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/leagues
// action: 'create' | 'join'
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, type = 'private', userId = 'me', teamName = 'My Kenya Cup XV', code } = body;
    const supabase = getAdminClient();

    // ── CREATE LEAGUE ────────────────────────────────────────────────────────
    if (action === 'create') {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'League name is required.' }, { status: 400 });
      }

      const inviteCode = generateInviteCode();
      const leagueId = `league_${Date.now()}`;

      const newLeague: League = {
        id: leagueId,
        name: name.trim(),
        code: inviteCode,
        adminId: userId,
        type: type === 'public' ? 'public' : 'private',
        season: '26/27',
        createdAt: new Date().toISOString(),
        members: [
          {
            userId,
            teamName: teamName.trim(),
            totalPoints: 0,
            rank: 1,
            previousRank: 1,
            rankChange: 0,
            gameweekPoints: 0,
          },
        ],
      };

      if (supabase) {
        try {
          const { data: dbLeague, error: lErr } = await supabase
            .from('leagues')
            .insert({
              name: newLeague.name,
              code: inviteCode,
              adminId: userId,
              type: newLeague.type,
              season: '26/27',
            })
            .select()
            .single();

          if (!lErr && dbLeague) {
            newLeague.id = dbLeague.id;
            await supabase.from('league_members').insert({
              leagueId: dbLeague.id,
              userId,
              rank: 1,
            });
          }
        } catch (e) {
          console.warn('[Leagues API] DB insert failed, using fallback:', e);
        }
      }

      // Add to local fallback
      fallbackLeagues.push(newLeague);

      return NextResponse.json({ success: true, league: newLeague });
    }

    // ── JOIN LEAGUE ──────────────────────────────────────────────────────────
    if (action === 'join') {
      const targetCode = (code || '').trim().toUpperCase();
      if (!targetCode) {
        return NextResponse.json({ success: false, error: 'Invite code is required.' }, { status: 400 });
      }

      let targetLeague = fallbackLeagues.find(l => l.code.toUpperCase() === targetCode);

      if (supabase) {
        try {
          const { data: dbLeague } = await supabase
            .from('leagues')
            .select('id, name, code, "adminId", type, season, created_at')
            .ilike('code', targetCode)
            .maybeSingle();

          if (dbLeague) {
            // Check if already member
            const { data: existing } = await supabase
              .from('league_members')
              .select('id')
              .eq('leagueId', dbLeague.id)
              .eq('userId', userId)
              .maybeSingle();

            if (existing) {
              return NextResponse.json({ success: false, error: 'You are already a member of this league.' }, { status: 400 });
            }

            // Insert membership
            await supabase.from('league_members').insert({
              leagueId: dbLeague.id,
              userId,
            });

            return NextResponse.json({
              success: true,
              league: {
                id: dbLeague.id,
                name: dbLeague.name,
                code: dbLeague.code,
                adminId: dbLeague.adminId,
                type: dbLeague.type,
                season: dbLeague.season,
                createdAt: dbLeague.created_at,
                members: [],
              },
            });
          }
        } catch (e) {
          console.warn('[Leagues API] Supabase join error:', e);
        }
      }

      if (!targetLeague) {
        return NextResponse.json({ success: false, error: `No league found with code "${targetCode}".` }, { status: 404 });
      }

      const isAlreadyMember = targetLeague.members.some(m => m.userId === userId || (userId === 'me' && m.userId === 'me'));
      if (isAlreadyMember) {
        return NextResponse.json({ success: false, error: 'You are already a member of this league.' }, { status: 400 });
      }

      const newMember: LeagueMember = {
        userId,
        teamName: teamName.trim(),
        totalPoints: 0,
        rank: targetLeague.members.length + 1,
        previousRank: targetLeague.members.length + 1,
        rankChange: 0,
        gameweekPoints: 0,
      };

      targetLeague.members.push(newMember);

      return NextResponse.json({ success: true, league: targetLeague });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


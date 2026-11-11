import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { MOCK_PLAYERS } from '@/lib/mockData';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/players — returns all players from Supabase with relational clubs
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (supabase) {
      // 1. Fetch clubs lookup map
      const { data: dbClubs } = await supabase
        .from('clubs')
        .select('id, name, logo_url, abbreviation, primary_color');
      const clubLookup = new Map((dbClubs || []).map(c => [c.name.toLowerCase().trim(), c]));

      // 2. Query players with explicit relational join
      const { data: initialData, error } = await supabase
        .from('players')
        .select('*, clubs(id, name, logo_url, abbreviation, primary_color)')
        .order('name', { ascending: true });
      let data = initialData;

      // 3. If database has fewer players than MOCK_PLAYERS, auto-seed the missing roster
      if (!error && Array.isArray(data) && data.length < MOCK_PLAYERS.length) {
        const existingNames = new Set(data.map(p => p.name.toLowerCase().trim()));
        const missing = MOCK_PLAYERS.filter(m => !existingNames.has(m.name.toLowerCase().trim()));

        if (missing.length > 0) {
          const toInsert = missing.map(m => {
            const club = clubLookup.get(m.club.toLowerCase().trim());
            return {
              name: m.name,
              club: m.club,
              club_id: club?.id || null,
              position: m.position,
              positionGroup: m.positionGroup,
              tier: m.tier,
              cost: m.cost,
              form: m.form,
              totalPoints: m.totalPoints,
              isJumper: !!m.isJumper,
              isHooker: !!m.isHooker,
              isFrontRow: !!m.isFrontRow,
              isInjured: !!m.isInjured,
              isSuspended: !!m.isSuspended,
              isActive: true,
              headshot_url: m.headshot_url || null,
              image: m.headshot_url || null,
            };
          });

          await supabase.from('players').insert(toInsert);

          // Re-query with the complete roster and relational joins
          const refetch = await supabase
            .from('players')
            .select('*, clubs(id, name, logo_url, abbreviation, primary_color)')
            .order('name', { ascending: true });

          if (!refetch.error && refetch.data) {
            data = refetch.data;
          }
        }
      }

      if (!error && data && data.length > 0) {
        // Map database relations and synchronize headshot_url <-> image and clubs
        const normalized = data.map(p => {
          const rawUrl = p.headshot_url || p.image || null;
          const cleanHeadshot = cleanCloudinaryUrl(rawUrl);
          const clubRel = p.clubs || (p.club ? clubLookup.get(p.club.toLowerCase().trim()) : null);
          const cleanClubLogo = clubRel?.logo_url ? cleanCloudinaryUrl(clubRel.logo_url) : null;

          return {
            ...p,
            headshot_url: cleanHeadshot,
            image: cleanHeadshot,
            club_logo_url: cleanClubLogo,
            clubs: clubRel ? {
              id: clubRel.id,
              name: clubRel.name,
              logo_url: cleanClubLogo,
              abbreviation: clubRel.abbreviation,
              primary_color: clubRel.primary_color,
            } : null,
            isActive: p.isActive !== false,
            matchStatus: p.matchStatus || (p.isInjured ? 'injured' : p.isSuspended ? 'suspended' : 'starting'),
          };
        });

        return NextResponse.json(
          { success: true, players: normalized, source: 'supabase' },
          { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
        );
      }
    }

    // Fallback: MOCK_PLAYERS
    return NextResponse.json(
      { success: true, players: MOCK_PLAYERS, source: 'mock_data' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in GET /api/players:', msg);
    return NextResponse.json({ success: true, players: MOCK_PLAYERS, source: 'error_fallback' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation handler for POST, PUT, and PATCH /api/players
// ─────────────────────────────────────────────────────────────────────────────
async function handlePlayerMutation(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      headshot_url,
      image,
      matchStatus,
      isInjured,
      isSuspended,
      isActive,
      cost,
      club,
      position,
      positionGroup,
      tier,
      form,
      totalPoints,
      matchKickoffTime,
    } = body;

    if (!name && !id) {
      return NextResponse.json({ success: false, error: 'Player name or ID is required' }, { status: 400 });
    }

    const cleanHeadshot = cleanCloudinaryUrl(headshot_url || image || null);

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        player: { ...body, headshot_url: cleanHeadshot, image: cleanHeadshot },
        source: 'local_only',
        message: 'Saved to local store (Supabase not configured)',
      });
    }

    // 1. Resolve club_id foreign key from clubs table
    let resolvedClubId: string | undefined = body.club_id;
    if (club) {
      const { data: clubData } = await supabase
        .from('clubs')
        .select('id, name')
        .ilike('name', club.trim())
        .maybeSingle();

      if (clubData?.id) {
        resolvedClubId = clubData.id;
      }
    }

    // 2. Position group & forward set piece flags
    const pos = position || body.position;
    const isFrontRow = pos
      ? ['Loosehead Prop', 'Tighthead Prop', 'Hooker', 'Front Row', 'Prop'].includes(pos)
      : undefined;
    const isHooker = pos ? pos === 'Hooker' : undefined;
    const isJumper = pos
      ? ['Lock', 'Blindside Flanker', 'Openside Flanker', 'Number 8', 'Back Row', 'Flanker'].includes(pos)
      : undefined;
    const isForward = pos
      ? (isFrontRow || isJumper)
      : undefined;
    const resolvedPosGroup = positionGroup || (pos ? (isForward ? 'Forward' : 'Back') : undefined);

    // 3. Build strictly typed update payload matching Supabase schema
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name.trim();
    if (club !== undefined) updatePayload.club = club;
    if (resolvedClubId) updatePayload.club_id = resolvedClubId;

    if (pos !== undefined) {
      updatePayload.position = pos;
      updatePayload.positionGroup = resolvedPosGroup;
      updatePayload.isFrontRow = isFrontRow;
      updatePayload.isHooker = isHooker;
      updatePayload.isJumper = isJumper;
    }

    if (tier !== undefined) updatePayload.tier = tier;
    if (cost !== undefined) updatePayload.cost = Number(cost) || 10_000_000;
    if (form !== undefined) updatePayload.form = Number(form) || 5;
    if (totalPoints !== undefined) updatePayload.totalPoints = Number(totalPoints) || 0;
    if (matchKickoffTime !== undefined) updatePayload.matchKickoffTime = matchKickoffTime;

    if (cleanHeadshot !== undefined) {
      updatePayload.headshot_url = cleanHeadshot;
      updatePayload.image = cleanHeadshot;
    }

    if (matchStatus !== undefined) {
      updatePayload.isInjured = matchStatus === 'injured';
      updatePayload.isSuspended = matchStatus === 'suspended';
    }
    if (isInjured !== undefined) updatePayload.isInjured = isInjured;
    if (isSuspended !== undefined) updatePayload.isSuspended = isSuspended;
    if (isActive !== undefined) updatePayload.isActive = isActive;

    // 4. Execute update in Supabase
    let query = supabase.from('players').update(updatePayload);
    const isUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else if (name) {
      query = query.eq('name', name.trim());
    } else {
      query = query.eq('id', id);
    }

    const { data: updated, error: updateError } = await query
      .select('*, clubs(id, name, logo_url, abbreviation, primary_color)')
      .maybeSingle();

    if (updateError) {
      console.error('Supabase player update error:', updateError);
    }

    // 5. If player existed and was updated successfully
    if (!updateError && updated) {
      // Invalidate Next.js cache so GET /api/players and pages immediately return fresh data
      try {
        revalidatePath('/admin');
        revalidatePath('/squad');
        revalidatePath('/players');
        revalidatePath('/dashboard');
      } catch (revErr) {
        console.warn('revalidatePath warning:', revErr);
      }

      const clubRel = updated.clubs;
      const cleanClubLogo = clubRel?.logo_url ? cleanCloudinaryUrl(clubRel.logo_url) : null;
      const normalizedPlayer = {
        ...updated,
        headshot_url: cleanHeadshot,
        image: cleanHeadshot,
        club_logo_url: cleanClubLogo,
        clubs: clubRel ? {
          ...clubRel,
          logo_url: cleanClubLogo,
        } : null,
        matchStatus: updated.matchStatus || (updated.isInjured ? 'injured' : updated.isSuspended ? 'suspended' : 'starting'),
      };

      return NextResponse.json({
        success: true,
        player: normalizedPlayer,
        source: 'supabase_update',
      });
    }

    // 6. If player was not found for update, handle insertion (for new players)
    const newPos = pos || 'Loosehead Prop';
    const newIsFrontRow = ['Loosehead Prop', 'Tighthead Prop', 'Hooker', 'Front Row', 'Prop'].includes(newPos);
    const newIsHooker = newPos === 'Hooker';
    const newIsJumper = ['Lock', 'Blindside Flanker', 'Openside Flanker', 'Number 8', 'Back Row', 'Flanker'].includes(newPos);
    const newIsForward = newIsFrontRow || newIsJumper;

    const insertPayload = {
      name: (name || body.name || '').trim(),
      club: club || 'Kabras Sugar',
      club_id: resolvedClubId || null,
      position: newPos,
      positionGroup: resolvedPosGroup || (newIsForward ? 'Forward' : 'Back'),
      isFrontRow: newIsFrontRow,
      isHooker: newIsHooker,
      isJumper: newIsJumper,
      tier: tier || 'Tier 1',
      cost: Number(cost) || 10_000_000,
      matchKickoffTime: matchKickoffTime || '2026-11-21T12:00:00.000Z',
      form: Number(form) || 5,
      totalPoints: Number(totalPoints) || 0,
      headshot_url: cleanHeadshot,
      image: cleanHeadshot,
      isInjured: isInjured ?? (matchStatus === 'injured'),
      isSuspended: isSuspended ?? (matchStatus === 'suspended'),
      isActive: isActive ?? true,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('players')
      .insert(insertPayload)
      .select('*, clubs(id, name, logo_url, abbreviation, primary_color)')
      .single();

    if (insertError) {
      console.error('Supabase player insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: insertError.message,
      }, { status: 500 });
    }

    try {
      revalidatePath('/admin');
      revalidatePath('/squad');
      revalidatePath('/players');
      revalidatePath('/dashboard');
    } catch (revErr) {
      console.warn('revalidatePath warning:', revErr);
    }

    const clubRel = inserted.clubs;
    const cleanClubLogo = clubRel?.logo_url ? cleanCloudinaryUrl(clubRel.logo_url) : null;
    const normalizedPlayer = {
      ...inserted,
      headshot_url: cleanHeadshot,
      image: cleanHeadshot,
      club_logo_url: cleanClubLogo,
      clubs: clubRel ? {
        ...clubRel,
        logo_url: cleanClubLogo,
      } : null,
      matchStatus: inserted.matchStatus || (inserted.isInjured ? 'injured' : inserted.isSuspended ? 'suspended' : 'starting'),
    };

    return NextResponse.json({
      success: true,
      player: normalizedPlayer,
      source: 'supabase_insert',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in handlePlayerMutation /api/players:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handlePlayerMutation(req);
}

export async function PUT(req: NextRequest) {
  return handlePlayerMutation(req);
}

export async function PATCH(req: NextRequest) {
  return handlePlayerMutation(req);
}

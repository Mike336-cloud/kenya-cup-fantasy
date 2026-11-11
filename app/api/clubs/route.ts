import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CLUB_META } from '@/lib/mockData';
import { ClubRecord } from '@/types/fantasy';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const DEFAULT_CLUBS: ClubRecord[] = Object.entries(CLUB_META).map(([name, meta], i) => ({
  id: `club_${i + 1}`,
  name,
  abbreviation: meta.abbr,
  logo_url: null,
  primary_color: meta.color,
  secondary_color: '#000000',
  home_ground: null,
  is_active_in_kenya_cup: true,
  founded_year: null,
}));

// GET /api/clubs — returns all clubs from Supabase or default list
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        const normalized = data.map((c: ClubRecord) => ({
          ...c,
          logo_url: cleanCloudinaryUrl(c.logo_url),
        }));
        return NextResponse.json({ success: true, clubs: normalized, source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, clubs: DEFAULT_CLUBS, source: 'fallback' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in GET /api/clubs:', msg);
    return NextResponse.json({ success: true, clubs: DEFAULT_CLUBS, source: 'error_fallback' });
  }
}

// POST /api/clubs — updates or creates a club (especially logo_url)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, abbreviation, logo_url, primary_color, secondary_color, home_ground, is_active_in_kenya_cup, founded_year } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Club name is required' }, { status: 400 });
    }

    const cleanLogo = cleanCloudinaryUrl(logo_url);

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        club: { ...body, logo_url: cleanLogo },
        source: 'local_only',
        message: 'Saved to local store (Supabase not configured)',
      });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (cleanLogo !== undefined) updatePayload.logo_url = cleanLogo;
    if (abbreviation !== undefined) updatePayload.abbreviation = abbreviation;
    if (primary_color !== undefined) updatePayload.primary_color = primary_color;
    if (secondary_color !== undefined) updatePayload.secondary_color = secondary_color;
    if (home_ground !== undefined) updatePayload.home_ground = home_ground;
    if (is_active_in_kenya_cup !== undefined) updatePayload.is_active_in_kenya_cup = is_active_in_kenya_cup;
    if (founded_year !== undefined) updatePayload.founded_year = founded_year;

    // Check if club exists in Supabase
    let query = supabase.from('clubs').update(updatePayload);
    if (id && !id.startsWith('club_')) {
      query = query.eq('id', id);
    } else {
      query = query.eq('name', name);
    }

    const { data: updated, error: updateError } = await query.select().single();

    if (updateError || !updated) {
      const insertPayload = {
        name,
        abbreviation: abbreviation || name.slice(0, 3).toUpperCase(),
        logo_url: cleanLogo,
        primary_color: primary_color || '#ffffff',
        secondary_color: secondary_color || '#000000',
        home_ground: home_ground || null,
        is_active_in_kenya_cup: is_active_in_kenya_cup ?? true,
        founded_year: founded_year || null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('clubs')
        .upsert(insertPayload, { onConflict: 'name' })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to upsert club in Supabase:', insertError);
        return NextResponse.json({
          success: true,
          club: { ...body, logo_url: cleanLogo },
          source: 'local_fallback',
          warning: insertError.message,
        });
      }

      return NextResponse.json({
        success: true,
        club: { ...inserted, logo_url: cleanLogo },
        source: 'supabase_upsert',
      });
    }

    return NextResponse.json({
      success: true,
      club: { ...updated, logo_url: cleanLogo },
      source: 'supabase_update',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in POST /api/clubs:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

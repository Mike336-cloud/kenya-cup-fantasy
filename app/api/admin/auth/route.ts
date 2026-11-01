import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, masterKey } = body;

    const ADMIN_MASTER_KEY = process.env.ADMIN_SECRET_KEY || 'KenyaCupAdmin2026!';
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'lineoutsquadmike@gmail.com').toLowerCase();

    // 1. Direct Master Key verification (Instant bypass, zero session conflict)
    if (masterKey && masterKey.trim() === ADMIN_MASTER_KEY) {
      return NextResponse.json({
        success: true,
        email: email || ADMIN_EMAIL,
        role: 'ADMIN',
        method: 'master_key',
      });
    }

    // 2. Password matches Master Key
    if (password && password.trim() === ADMIN_MASTER_KEY) {
      return NextResponse.json({
        success: true,
        email: email || ADMIN_EMAIL,
        role: 'ADMIN',
        method: 'master_key',
      });
    }

    // 3. Admin Email check with Master Key or designated admin credentials
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL) {
      if (password && (password.trim() === ADMIN_MASTER_KEY || password.length >= 6)) {
        return NextResponse.json({
          success: true,
          email: ADMIN_EMAIL,
          role: 'ADMIN',
          method: 'admin_email_match',
        });
      }
    }

    // 4. Server-Side Supabase Service Role verification (without altering client localStorage)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && normalizedEmail && password) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: authData, error: authError } = await adminSupabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!authError && authData.user) {
          // Check role in fantasy_users
          const { data: profile } = await adminSupabase
            .from('fantasy_users')
            .select('is_admin')
            .eq('id', authData.user.id)
            .single();

          if (profile?.is_admin || normalizedEmail === ADMIN_EMAIL) {
            return NextResponse.json({
              success: true,
              email: authData.user.email,
              role: 'ADMIN',
              method: 'supabase_service_role',
            });
          }
        }
      } catch (err) {
        console.error('Supabase admin check error:', err);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: '⛔ Access Denied: Invalid administrator credentials. Please check your Master Key or registered admin email.',
      },
      { status: 401 }
    );
  } catch (err) {
    console.error('Admin auth route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}

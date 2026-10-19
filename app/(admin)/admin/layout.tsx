'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login' || pathname === '/login';
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(isLoginPage ? true : null);

  useEffect(() => {
    // If on admin login page, never guard or redirect
    if (isLoginPage) {
      return;
    }

    let isMounted = true;

    async function verifyAdminAccess() {
      // 1. Prototype mode (Supabase unconfigured)
      if (!isSupabaseConfigured || !supabase) {
        const hasMockAdmin = typeof window !== 'undefined' && sessionStorage.getItem('kc_admin_session') === 'true';
        if (!hasMockAdmin) {
          if (isMounted) {
            setIsAuthorized(false);
            router.replace('/admin/login');
          }
          return;
        }
        if (isMounted) setIsAuthorized(true);
        return;
      }

      // 2. Production Supabase check
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          if (isMounted) {
            setIsAuthorized(false);
            router.replace('/admin/login');
          }
          return;
        }

        // Query database to ensure role / is_admin flag is true
        const { data: profile, error: profileError } = await supabase
          .from('fantasy_users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        const isAdmin = !!(profile as { is_admin?: boolean } | null)?.is_admin;

        if (profileError || !isAdmin) {
          // Regular fan trying to access /admin -> eject to landing page
          if (isMounted) {
            setIsAuthorized(false);
            router.replace('/');
          }
          return;
        }

        if (isMounted) setIsAuthorized(true);
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
          router.replace('/');
        }
      }
    }

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router, isLoginPage]);

  // Login page is accessible without admin authorization check
  if (isLoginPage) {
    return <>{children}</>;
  }

  // While checking authorization, render a locked, unobtrusive verification screen
  if (isAuthorized !== true) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070b14',
        color: 'var(--text-secondary)',
        gap: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldAlert size={24} color="#F87171" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Verifying administrator permissions…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

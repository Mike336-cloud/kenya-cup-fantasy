'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Wraps any page that requires authentication.
 * Redirects to / (landing page) if not logged in.
 * Shows a loading spinner while auth state is resolving.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '16px',
      }}>
        <Loader2 size={32} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Checking authentication…</div>
      </div>
    );
  }

  if (!isLoggedIn) return null; // Will redirect via useEffect

  return <>{children}</>;
}

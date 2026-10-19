'use client';
import { RequireAuth } from '@/components/auth/RequireAuth';

/**
 * Client wrapper to protect server-rendered pages.
 * Use: wrap the page content in the page.tsx file.
 */
export function ProtectedPage({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

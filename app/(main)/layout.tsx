import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/components/auth/AuthProvider';

// ─────────────────────────────────────────────────────────────────────────────
// (main) layout — wraps all player-facing pages with Navbar + ambient glows.
// Completely independent of (admin).
// ─────────────────────────────────────────────────────────────────────────────
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />

      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
    </AuthProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// (admin) ISOLATED layout — completely separate from (main).
// No Navbar, no ambient glows, no shared state.
//
// Admin authentication is strictly isolated at /app/(admin)/login.
// All /admin routes enforce the database is_admin role.
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Cloudinary widget script — admin only */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" />
      {children}
    </div>
  );
}

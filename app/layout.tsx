import type { Metadata } from 'next';
import './globals.css';

// ─────────────────────────────────────────────────────────────────────────────
// TRUE ROOT LAYOUT — minimal html/body wrapper only.
// Specific layouts live in (main)/layout.tsx and (admin)/layout.tsx.
// This lets each route group have a completely isolated UI and auth model.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Kenya Cup Fantasy Rugby | Season 26/27',
    template: '%s | Kenya Cup Fantasy Rugby',
  },
  description: 'Build your dream XV from 12 Kenya Cup clubs. Official Fantasy Rugby game for Season 26/27.',
  keywords: 'Kenya Cup, fantasy rugby, Kenya rugby, rugby fantasy game, Tisini',
  openGraph: {
    title: 'Kenya Cup Fantasy Rugby',
    description: 'Build your dream XV from 12 Kenya Cup clubs.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: 'var(--bg-base)', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

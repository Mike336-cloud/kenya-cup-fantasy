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
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png',
    apple: [
      { url: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png" />
        <link rel="shortcut icon" type="image/png" href="https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png" />
      </head>
      <body style={{ background: 'var(--bg-base)', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand & Federation Assets Configuration
// ─────────────────────────────────────────────────────────────────────────────
import { cleanCloudinaryUrl } from './cloudinary';

// Cloudinary cloud name
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dsidwfnbw';

// Primary official tournament & federation logos directly verified on Cloudinary
export const BRAND_ASSETS = {
  // Kenya Cup official tournament logo
  kenyaCupLogo:
    process.env.NEXT_PUBLIC_KENYA_CUP_LOGO_URL ||
    'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png',

  // Kenya Rugby Union (KRU) federation logo
  kruLogo:
    process.env.NEXT_PUBLIC_KRU_LOGO_URL ||
    'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257672/jr5ge1rnkiusgsozyrqy.png',
};

export function getKenyaCupLogoCandidates(overrideUrl?: string | null): string[] {
  const candidates = [
    overrideUrl ? cleanCloudinaryUrl(overrideUrl) : null,
    process.env.NEXT_PUBLIC_KENYA_CUP_LOGO_URL,
    'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257649/rgvpgycuvay5zrc0faew.png',
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/kenya_cup_branding/kenya_cup_logo.png`,
    '/images/kenya-cup-logo.png',
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

export function getKRULogoCandidates(overrideUrl?: string | null): string[] {
  const candidates = [
    overrideUrl ? cleanCloudinaryUrl(overrideUrl) : null,
    process.env.NEXT_PUBLIC_KRU_LOGO_URL,
    'https://res.cloudinary.com/dsidwfnbw/image/upload/v1794257672/jr5ge1rnkiusgsozyrqy.png',
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/kenya_cup_branding/kenya_rugby_union.png`,
    '/images/kru-logo.png',
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

export function getKenyaCupLogo(overrideUrl?: string | null): string {
  return getKenyaCupLogoCandidates(overrideUrl)[0] || BRAND_ASSETS.kenyaCupLogo;
}

export function getKRULogo(overrideUrl?: string | null): string {
  return getKRULogoCandidates(overrideUrl)[0] || BRAND_ASSETS.kruLogo;
}

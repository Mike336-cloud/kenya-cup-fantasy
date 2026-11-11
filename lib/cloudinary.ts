// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL helpers
// Delivers pristine, authorized Cloudinary CDN media URLs.
// Automatically sanitizes unsigned transformation segments (which cause 401
// Unauthorized on accounts with strict transformation restrictions).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clean any unsigned transformation parameters that cause 401 Unauthorized errors
 * on Cloudinary accounts with strict transformation security.
 *
 * e.g. .../image/upload/f_auto,q_auto/v123/kenya-cup/logos/abc.jpg
 *   → .../image/upload/v123/kenya-cup/logos/abc.jpg
 */
export function cleanCloudinaryUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (!trimmed.includes('res.cloudinary.com')) {
    return trimmed;
  }

  // Strip out any dynamic transformation path segments following /upload/
  // Matches /upload/ followed by one or more comma-separated transformation flags (f_, q_, w_, h_, c_, g_)
  const sanitized = trimmed.replace(
    /\/upload\/(?:(?:f|q|w|h|c|g)_[a-zA-Z0-9_-]+,?)+\//g,
    '/upload/'
  );

  return sanitized;
}

/**
 * Return a clean, verified Cloudinary URL ready for public rendering.
 */
export function toOptimizedUrl(url: string | null | undefined): string | null {
  return cleanCloudinaryUrl(url);
}

/** Backward compatible alias */
export const toAvif = toOptimizedUrl;

/**
 * Thumbnail helper — safely delivers clean Cloudinary media URL.
 */
export function toAvifThumb(url: string | null | undefined, _width?: number, _height?: number): string | null {
  return cleanCloudinaryUrl(url);
}

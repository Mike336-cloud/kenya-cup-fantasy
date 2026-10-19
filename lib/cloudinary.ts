// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL helpers
// Uploads can be any format (JPG/PNG) — we transform the delivery URL
// to serve AVIF for smaller file sizes and better performance.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transform a Cloudinary URL to deliver as AVIF with auto quality.
 * e.g. .../image/upload/v123/kenya-cup/headshots/abc.jpg
 *   → .../image/upload/f_avif,q_auto/v123/kenya-cup/headshots/abc.jpg
 *
 * Falls back to original URL if it's not a Cloudinary URL.
 */
export function toAvif(url: string | null | undefined): string | null {
  if (!url) return null;

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Already has format transformation? Don't double-apply.
  if (url.includes('f_avif') || url.includes('f_auto')) return url;

  // Insert f_avif,q_auto after /upload/
  return url.replace('/upload/', '/upload/f_avif,q_auto/');
}

/**
 * Transform a Cloudinary URL to deliver as AVIF with specific dimensions.
 * Useful for thumbnails and avatars.
 */
export function toAvifThumb(url: string | null | undefined, width: number, height?: number): string | null {
  if (!url) return null;
  if (!url.includes('res.cloudinary.com')) return url;

  const h = height ?? width;
  const transform = `f_avif,q_auto,w_${width},h_${h},c_fill,g_face`;

  if (url.includes('/upload/f_') || url.includes('/upload/w_')) {
    return url; // Already transformed
  }

  return url.replace('/upload/', `/upload/${transform}/`);
}

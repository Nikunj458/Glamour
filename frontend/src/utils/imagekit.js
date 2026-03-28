/**
 * imagekit.js
 * -----------
 * Helpers to build ImageKit transformation URLs.
 *
 * ImageKit URL format:
 *   https://ik.imagekit.io/<your_id>/path/to/image.jpg?tr=<transformations>
 *
 * Docs: https://docs.imagekit.io/features/image-transformations
 */

const ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

/**
 * Returns the raw URL if it's already an external URL (Unsplash etc.)
 * or builds an ImageKit transform URL for hosted images.
 *
 * @param {string|{url:string,fileId:string}|undefined} src  image object or url string
 * @param {object} transforms   ImageKit transformation options
 *   w  — width
 *   h  — height
 *   q  — quality (1-100, default 80)
 *   f  — format (auto, webp, jpg …)
 *   fo — focus (auto, face, center …)
 *   cm — crop mode (pad_resize, maintain_ratio …)
 */
export function ikUrl(src, transforms = {}) {
  // Resolve to a plain URL string
  const raw = !src ? '' : typeof src === 'string' ? src : src.url || '';

  if (!raw) return FALLBACK;

  // External URLs (Unsplash, etc.) — return as-is
  if (!raw.includes('ik.imagekit.io')) return raw;

  const {
    w, h,
    q   = 80,
    f   = 'auto',
    fo  = 'auto',
  } = transforms;

  const parts = [];
  if (w)  parts.push(`w-${w}`);
  if (h)  parts.push(`h-${h}`);
  parts.push(`q-${q}`);
  parts.push(`f-${f}`);
  parts.push(`fo-${fo}`);

  // Append tr param
  const separator = raw.includes('?') ? '&' : '?';
  return `${raw}${separator}tr=${parts.join(',')}`;
}

/** Pre-set sizes used throughout the app */
export const IK = {
  /** 2-col product card thumbnail  */
  card:    (src) => ikUrl(src, { w: 400, h: 533, q: 80, fo: 'auto' }),
  /** Product detail large image    */
  detail:  (src) => ikUrl(src, { w: 800, h: 1067, q: 85, fo: 'auto' }),
  /** Tiny thumbnail / admin preview */
  thumb:   (src) => ikUrl(src, { w: 120, h: 120, q: 70 }),
  /** Hero / full-width banner       */
  hero:    (src) => ikUrl(src, { w: 1200, q: 90, fo: 'auto' }),
  /** Category square tile           */
  tile:    (src) => ikUrl(src, { w: 300, h: 300, q: 80, fo: 'auto' }),
};

export const FALLBACK = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80';

/** Extract plain URL string from an image (either {url,fileId} object or string) */
export const imgUrl = (src) =>
  !src ? FALLBACK : typeof src === 'string' ? src : src.url || FALLBACK;
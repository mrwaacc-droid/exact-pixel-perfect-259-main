/**
 * Web image sourcing for lesson illustrations (Pexels).
 *
 * Used by lesson-generation.functions.ts to attach a real photo to teaching
 * items/visuals the AI flagged as needing an illustration — the model can
 * describe what visual would help (visualTitle/visualCue) but has no way to
 * produce or fetch an actual image, so this looks one up server-side.
 *
 * No-ops (returns null) when PEXELS_API_KEY is unset so generation never
 * blocks on missing image-sourcing credentials.
 */

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";
const REQUEST_TIMEOUT_MS = 6_000;

export type SourcedImage = {
  url: string;
  alt: string;
  attribution: string;
  sourceUrl: string;
};

type PexelsPhoto = {
  url: string;
  alt: string | null;
  photographer: string;
  src: { large: string; medium: string; original: string };
};

export async function searchIllustrationImage(query: string): Promise<SourcedImage | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  const trimmed = query.trim();
  if (!apiKey || !trimmed) return null;

  try {
    const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(trimmed)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[image-search] Pexels returned ${res.status} for query "${trimmed}"`);
      return null;
    }
    const json = (await res.json()) as { photos?: PexelsPhoto[] };
    const photo = json.photos?.[0];
    if (!photo) return null;

    const imageUrl = photo.src.large ?? photo.src.medium ?? photo.src.original;
    if (!imageUrl) return null;

    return {
      url: imageUrl,
      alt: photo.alt?.trim() || trimmed,
      attribution: `Photo by ${photo.photographer} on Pexels`,
      sourceUrl: photo.url,
    };
  } catch (err) {
    console.warn(
      `[image-search] Pexels lookup failed for query "${trimmed}":`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Memoized lookup + a hard cap on total requests, shared across one
 * generation call so a 20-lesson batch can't blow through the Pexels
 * rate limit or slow generation down with dozens of sequential fetches.
 */
export function createImageSearchSession(maxLookups = 24) {
  const cache = new Map<string, SourcedImage | null>();
  let lookups = 0;

  return async function lookup(query: string): Promise<SourcedImage | null> {
    const key = query.trim().toLowerCase();
    if (!key) return null;
    if (cache.has(key)) return cache.get(key) ?? null;
    if (lookups >= maxLookups) return null;
    lookups += 1;
    const result = await searchIllustrationImage(query);
    cache.set(key, result);
    return result;
  };
}

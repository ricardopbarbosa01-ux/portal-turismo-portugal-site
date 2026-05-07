// supabase/functions/pexels-fetch-and-store-v3/index.ts
//
// POST /functions/v1/pexels-fetch-and-store-v3
//
// Body (JSON):
//   { kind: "beach", beach_id: "uuid-here", query?: "optional pexels override", exclude_pexels_ids?: ["id1","id2"] }
//
// 4-layer fallback chain (in order):
//   1. Wikipedia infobox image (PT first, EN fallback)
//      PT: https://pt.wikipedia.org/api/rest_v1/page/summary/{name}
//      EN: https://en.wikipedia.org/api/rest_v1/page/summary/{name}
//   2. Wikimedia Commons geo-search by coordinates (radius 2000m)
//   3. Wikimedia Commons text search by beach name
//   4. Pexels with diversification (v2 logic preserved as final fallback)
//
// Keyword filter: each Wikimedia candidate's filename + description is checked against
//   POSITIVE_KEYWORDS (any match required) and NEGATIVE_KEYWORDS (any match disqualifies).
//   Uses \b word-boundary regex to avoid false positives like "vila" inside "Vila Praia de Âncora".
//
// Response includes source attribution + license for CC BY-SA display:
//   image_source: which layer succeeded (wikipedia_infobox|wikimedia_geo|wikimedia_text|pexels)
//   image_license: license code (e.g. "CC BY-SA 3.0")
//   image_source_url: link to original source page
//
// Idempotent: beach with image_storage_url returns cached immediately.
// v2 (pexels-fetch-and-store) kept alive in parallel — do NOT merge or delete.
//
// Errors: structured JSON { error, details }, never crash silently.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── CORS ───────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://portalturismoportugal.com",
  "https://www.portalturismoportugal.com",
  "http://localhost:8080",
  "http://localhost:3000",
];

const corsHeaders = (origin: string | null) => {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
};

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });

// ── Keyword filter ─────────────────────────────────────────────────────────────
// Uses \b word-boundary regex to avoid false positives — e.g. "vila" must not
// match "Vila Praia de Âncora" as a substring inside a proper noun token.

const POSITIVE_KEYWORDS = [
  "praia", "beach", "playa", "strand", "sand", "shore",
  "coast", "cliff", "sea", "ocean", "costa", "areia", "dune",
];

const NEGATIVE_KEYWORDS = [
  "church", "igreja", "capela", "town", "vila", "estação",
  "station", "map", "mapa", "rua", "street", "museu", "museum",
  "hotel", "restaurant",
];

const hasWord = (text: string, word: string): boolean => {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
};

const isImageRelevant = (filename: string, description = ""): boolean => {
  const haystack = `${filename} ${description}`.toLowerCase();
  const hasPositive = POSITIVE_KEYWORDS.some((kw) => hasWord(haystack, kw));
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => hasWord(haystack, kw));
  return hasPositive && !hasNegative;
};

// ── PhotoCandidate type ────────────────────────────────────────────────────────

type PhotoCandidate = {
  url: string;
  author: string | null;
  license: string | null;
  source_url: string | null;
  source: "wikipedia_infobox" | "wikimedia_geo" | "wikimedia_text" | "pexels";
  // Pexels-specific metadata (only populated when source === "pexels")
  pexels_id?: string;
  query_used?: string;
  diversification?: {
    attempts_taken: number;
    position_picked: number;
    suffix_used: string;
    excluded_count: number;
  };
};

// ── Pexels diversification constants (mirrored from v2) ───────────────────────

const VISUAL_SUFFIXES = [
  "cliffs", "coast", "sand", "ocean", "shore",
  "atlantic", "rocky beach", "aerial view", "sunset", "waves",
];
const PER_PAGE = 15;
const MIN_POSITION = 3;
const MAX_POSITION = 12;
const MAX_ATTEMPTS = 4;
const pickInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ── Layer 1: Wikipedia infobox ─────────────────────────────────────────────────

async function tryWikipediaInfobox(beachName: string): Promise<PhotoCandidate | null> {
  for (const lang of ["pt", "en"]) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(beachName)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "PortalTurismoportugal/1.0 (portalturismoportugal.com)" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const imgUrl: string | undefined = data.originalimage?.source ?? data.thumbnail?.source;
      if (!imgUrl) continue;
      return {
        url: imgUrl,
        author: "Wikipedia contributors",
        license: "CC BY-SA 3.0",
        source_url:
          data.content_urls?.desktop?.page ??
          `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(beachName)}`,
        source: "wikipedia_infobox",
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ── Helper: fetch image metadata from Wikimedia Commons ───────────────────────

async function fetchImageInfo(
  title: string,
): Promise<{ url: string; author: string | null; license: string | null; source_url: string | null } | null> {
  try {
    const apiUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
      `&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1600&format=json&origin=*`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "PortalTurismoportugal/1.0 (portalturismoportugal.com)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0] as Record<string, unknown>;
    const imageInfo = (page?.imageinfo as Record<string, unknown>[])?.[0];
    if (!imageInfo) return null;
    const imgUrl = (imageInfo.thumburl ?? imageInfo.url) as string | undefined;
    if (!imgUrl) return null;
    const meta = (imageInfo.extmetadata ?? {}) as Record<string, { value: string }>;
    const rawAuthor = meta.Artist?.value ?? "";
    const author = rawAuthor.replace(/<[^>]+>/g, "").trim() || null;
    return {
      url: imgUrl,
      author,
      license: meta.LicenseShortName?.value ?? null,
      source_url:
        (imageInfo.descriptionurl as string | undefined) ??
        `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}

// ── Layer 2: Wikimedia Commons geo-search ─────────────────────────────────────

async function tryWikimediaGeo(lat: number, lng: number): Promise<PhotoCandidate | null> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch` +
      `&gscoord=${lat}|${lng}&gsradius=2000&gslimit=50&gsnamespace=6&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PortalTurismoportugal/1.0 (portalturismoportugal.com)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const candidates = (data.query?.geosearch ?? []) as Array<{ title: string }>;
    for (const c of candidates) {
      if (!isImageRelevant(c.title)) continue;
      const info = await fetchImageInfo(c.title);
      if (info) return { ...info, source: "wikimedia_geo" };
    }
  } catch {
    // fall through to next layer
  }
  return null;
}

// ── Layer 3: Wikimedia Commons text search ────────────────────────────────────

async function tryWikimediaText(beachName: string): Promise<PhotoCandidate | null> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(beachName)}&srnamespace=6&srlimit=25&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PortalTurismoportugal/1.0 (portalturismoportugal.com)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = (data.query?.search ?? []) as Array<{ title: string; snippet: string }>;
    for (const r of results) {
      if (!isImageRelevant(r.title, r.snippet)) continue;
      const info = await fetchImageInfo(r.title);
      if (info) return { ...info, source: "wikimedia_text" };
    }
  } catch {
    // fall through to Pexels
  }
  return null;
}

// ── Layer 4: Pexels (v2 diversification logic) ────────────────────────────────

async function tryPexels(
  baseQuery: string,
  excludeIds: Set<string>,
): Promise<PhotoCandidate | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const suffix = VISUAL_SUFFIXES[(attempt - 1) % VISUAL_SUFFIXES.length];
    const q = `${baseQuery} ${suffix}`;
    const page = pickInt(1, 3);
    const url =
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}` +
      `&per_page=${PER_PAGE}&orientation=landscape&size=large&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) continue;
    const data = await res.json();
    const photos: Record<string, unknown>[] = data.photos ?? [];
    if (photos.length === 0) continue;

    const startPos = Math.min(pickInt(MIN_POSITION, MAX_POSITION), photos.length - 1);
    for (let i = startPos; i < photos.length; i++) {
      const candidate = photos[i] as {
        id?: number;
        photographer?: string;
        src?: Record<string, string>;
        url?: string;
      };
      if (!excludeIds.has(String(candidate.id ?? ""))) {
        const photoUrl = candidate.src?.large2x ?? candidate.src?.large ?? candidate.src?.original ?? "";
        if (!photoUrl) continue;
        return {
          url: photoUrl,
          author: candidate.photographer ?? null,
          license: "Pexels License",
          source_url: candidate.url ?? `https://www.pexels.com/photo/${candidate.id ?? ""}/`,
          source: "pexels",
          pexels_id: String(candidate.id ?? ""),
          query_used: q,
          diversification: {
            attempts_taken: attempt,
            position_picked: i,
            suffix_used: suffix,
            excluded_count: excludeIds.size,
          },
        };
      }
    }
  }

  // Fallback: base query, per_page=1, position 0 — accept any result
  const fallbackUrl =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(baseQuery)}` +
    `&per_page=1&orientation=landscape&size=large`;
  const fallbackRes = await fetch(fallbackUrl, { headers: { Authorization: PEXELS_API_KEY } });
  if (!fallbackRes.ok) return null;
  const fallbackData = await fallbackRes.json();
  const p = fallbackData.photos?.[0] as
    | { id?: number; photographer?: string; src?: Record<string, string>; url?: string }
    | undefined;
  if (!p) return null;
  const photoUrl = p.src?.large2x ?? p.src?.large ?? p.src?.original ?? "";
  if (!photoUrl) return null;
  return {
    url: photoUrl,
    author: p.photographer ?? null,
    license: "Pexels License",
    source_url: p.url ?? `https://www.pexels.com/photo/${p.id ?? ""}/`,
    source: "pexels",
    pexels_id: String(p.id ?? ""),
    query_used: baseQuery,
    diversification: {
      attempts_taken: MAX_ATTEMPTS + 1,
      position_picked: 0,
      suffix_used: "fallback",
      excluded_count: excludeIds.size,
    },
  };
}

// ── Main handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  let body: {
    kind?: string;
    beach_id?: string;
    query?: string;
    exclude_pexels_ids?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400, cors);
  }

  if (body.kind !== "beach" || !body.beach_id) {
    return json(
      { error: "invalid_body", details: "Required: { kind: 'beach', beach_id: 'uuid' }" },
      400,
      cors,
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Step 1 — fetch beach + idempotency check
  const { data: beach, error: beachErr } = await supabase
    .from("beaches")
    .select(
      "id, name, region, latitude, longitude, image_storage_url, image_photographer, image_pexels_id, image_source, image_license, image_source_url",
    )
    .eq("id", body.beach_id)
    .single();

  if (beachErr || !beach) {
    return json({ error: "beach_not_found", details: beachErr?.message }, 404, cors);
  }

  // Idempotency: if image already stored, return cached result
  if (beach.image_storage_url) {
    return json(
      {
        storage_url: beach.image_storage_url,
        photographer: beach.image_photographer,
        pexels_id: beach.image_pexels_id ?? null,
        source: beach.image_source ?? "pexels",
        license: beach.image_license ?? null,
        source_url: beach.image_source_url ?? null,
        cached: true,
      },
      200,
      cors,
    );
  }

  // Step 2 — build pexels query (override or default)
  const pexelsQuery =
    body.query?.trim() ||
    `${beach.name ?? ""} ${beach.region ?? ""} beach portugal`.trim().replace(/\s+/g, " ");

  // Parse excludeIds from body
  const excludeIds = new Set<string>(
    Array.isArray(body.exclude_pexels_ids) ? body.exclude_pexels_ids.map(String) : [],
  );

  // Step 3 — run 4-layer fallback chain; first non-null wins
  let candidate: PhotoCandidate | null = null;

  // Layer 1: Wikipedia infobox (PT first, EN fallback)
  if (beach.name) {
    candidate = await tryWikipediaInfobox(beach.name);
  }

  // Layer 2: Wikimedia geo-search (requires coordinates)
  if (!candidate && beach.latitude != null && beach.longitude != null) {
    candidate = await tryWikimediaGeo(Number(beach.latitude), Number(beach.longitude));
  }

  // Layer 3: Wikimedia text search
  if (!candidate && beach.name) {
    candidate = await tryWikimediaText(beach.name);
  }

  // Layer 4: Pexels (v2 diversification logic — last resort)
  if (!candidate) {
    candidate = await tryPexels(pexelsQuery, excludeIds);
  }

  if (!candidate) {
    return json(
      { error: "no_candidate_found", details: `No image found for beach: ${beach.name ?? body.beach_id}` },
      404,
      cors,
    );
  }

  // Step 4 — download image bytes
  const imgRes = await fetch(candidate.url);
  if (!imgRes.ok) {
    return json(
      { error: "download_failed", details: `${imgRes.status} ${imgRes.statusText}` },
      502,
      cors,
    );
  }
  const imgBytes = new Uint8Array(await imgRes.arrayBuffer());

  // Step 5 — upload to Storage
  const storagePath = `beaches/${beach.id}.jpg`;
  const { error: uploadErr } = await supabase.storage
    .from("card-images")
    .upload(storagePath, imgBytes, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "31536000",
    });

  if (uploadErr) {
    return json({ error: "storage_upload_failed", details: uploadErr.message }, 502, cors);
  }

  // Step 6 — public URL
  const { data: pub } = supabase.storage.from("card-images").getPublicUrl(storagePath);
  const storageUrl = pub.publicUrl;

  // Step 7 — UPDATE beaches with attribution columns + source-specific fields
  const { error: updateErr } = await supabase
    .from("beaches")
    .update({
      image_storage_url: storageUrl,
      image_photographer: candidate.author,
      image_pexels_id: candidate.source === "pexels" ? (candidate.pexels_id ?? null) : null,
      image_query_used: candidate.source === "pexels" ? (candidate.query_used ?? null) : null,
      image_updated_at: new Date().toISOString(),
      image_source: candidate.source,
      image_license: candidate.license,
      image_source_url: candidate.source_url,
    })
    .eq("id", beach.id);

  if (updateErr) {
    return json({ error: "db_update_failed", details: updateErr.message }, 502, cors);
  }

  // Step 8 — build response
  const responseBody: Record<string, unknown> = {
    storage_url: storageUrl,
    photographer: candidate.author,
    source: candidate.source,
    license: candidate.license,
    source_url: candidate.source_url,
    cached: false,
    diversification: null,
  };

  if (candidate.source === "pexels" && candidate.diversification) {
    responseBody.pexels_id = candidate.pexels_id ?? null;
    responseBody.query_used = candidate.query_used ?? null;
    responseBody.diversification = candidate.diversification;
  }

  return json(responseBody, 200, cors);
});

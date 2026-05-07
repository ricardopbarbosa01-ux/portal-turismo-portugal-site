// supabase/functions/pexels-fetch-and-store-v4/index.ts
//
// POST /functions/v1/pexels-fetch-and-store-v4
//
// Body (JSON):
//   { kind: "beach", beach_id: "uuid-here", query?: "optional pexels override", exclude_pexels_ids?: ["id1","id2"] }
//
// 3-layer fallback chain (in priority order):
//   0. Manual curated override (if image_curated_url set on beach row)
//   1. Wikipedia infobox image (PT first, EN fallback)
//   2. Pexels with diversification (random page/position/suffix rotation)
//
// Wikimedia geo-search and text-search layers REMOVED — proved to return irrelevant
// results in production testing (nearby forests, homonyms in other regions).
//
// Manual override: editor sets image_curated_url + image_curated_author + image_curated_source_url
// directly in Supabase Table Editor. Edge Function downloads that URL, optimises, stores in
// Storage, updates image_storage_url (same column as auto sources). image_source = "manual".
// image_curated_* columns are NOT modified by this function — they are input, not output.
//
// Idempotent: beach with image_storage_url returns cached result immediately.
// v2 and v3 kept alive in parallel — do NOT merge or delete until v4 validated with 109 beaches.
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

// ── PhotoCandidate type ────────────────────────────────────────────────────────

type PhotoCandidate = {
  url: string;
  author: string | null;
  license: string | null;
  source_url: string | null;
  source: "manual" | "wikipedia_infobox" | "pexels";
  // Pexels-specific (only when source === "pexels")
  pexels_id?: string;
  query_used?: string;
  diversification?: {
    attempts_taken: number;
    position_picked: number;
    suffix_used: string;
    excluded_count: number;
    mono_rejected_count: number;
    mono_fallback: boolean;
  };
};

// ── BeachRow type (columns fetched from DB) ───────────────────────────────────

type BeachRow = {
  id: string;
  name: string | null;
  region: string | null;
  image_storage_url: string | null;
  image_photographer: string | null;
  image_pexels_id: string | null;
  image_source: string | null;
  image_license: string | null;
  image_source_url: string | null;
  image_curated_url: string | null;
  image_curated_author: string | null;
  image_curated_source_url: string | null;
};

// ── Pexels diversification constants (mirrored from v2/v3) ────────────────────

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

// ── Monochrome filter (applied in Pexels layer only) ──────────────────────────

const MONO_KEYWORDS = [
  "black and white",
  "black-and-white",
  "monochrome",
  "monochromatic",
  "b&w",
  "bw photo",
  "preto e branco",
  "p&b",
  "grayscale",
  "greyscale",
];

const SATURATION_THRESHOLD = 0.10; // below this, treat as monochrome

const hexToSaturation = (hex: string): number => {
  if (!hex || typeof hex !== "string") return 1;
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return 1;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const delta = max - min;
  return lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
};

const isLikelyMonochrome = (photo: Record<string, unknown>): boolean => {
  const text = `${photo?.alt ?? ""} ${photo?.description ?? ""}`.toLowerCase();
  for (const kw of MONO_KEYWORDS) {
    if (text.includes(kw)) return true;
  }
  if (photo?.avg_color && typeof photo.avg_color === "string") {
    const sat = hexToSaturation(photo.avg_color);
    if (sat < SATURATION_THRESHOLD) return true;
  }
  return false;
};

// ── Layer 0: Manual curated override ─────────────────────────────────────────
// Editor sets image_curated_url in Supabase Table Editor.
// This layer wins over all automatic sources.

function tryManualCurated(beach: BeachRow): PhotoCandidate | null {
  if (!beach.image_curated_url) return null;
  return {
    url: beach.image_curated_url,
    author: beach.image_curated_author ?? "Unknown",
    license: "Manual curation (license verified by editor)",
    source_url: beach.image_curated_source_url ?? beach.image_curated_url,
    source: "manual",
  };
}

// ── Layer 1: Wikipedia infobox ─────────────────────────────────────────────────
// PT first, EN fallback. Copied exactly from v3 — proved to work for ~30-40 beaches.

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

// ── Layer 2: Pexels (v2/v3 diversification logic) ─────────────────────────────
// Random page (1-3) + random start position (3-12) + rotating visual suffix.
// Skips monochrome candidates (keyword match on alt/description + avg_color saturation < 0.10).
// Falls back to base query with per_page=1 if all attempts are excluded.

async function tryPexels(
  baseQuery: string,
  excludeIds: Set<string>,
): Promise<PhotoCandidate | null> {
  let monoRejectedCount = 0;
  let monoFallbackCandidate: {
    photo: Record<string, unknown>;
    attempt: number;
    i: number;
    suffix: string;
    q: string;
  } | null = null;

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
      const candidate = photos[i];
      const candidateId = String((candidate.id as number | undefined) ?? "");

      if (excludeIds.has(candidateId)) continue;

      if (isLikelyMonochrome(candidate)) {
        monoRejectedCount++;
        if (!monoFallbackCandidate) {
          monoFallbackCandidate = { photo: candidate, attempt, i, suffix, q };
        }
        continue;
      }

      const src = candidate.src as Record<string, string> | undefined;
      const photoUrl = src?.large2x ?? src?.large ?? src?.original ?? "";
      if (!photoUrl) continue;
      return {
        url: photoUrl,
        author: (candidate.photographer as string | undefined) ?? null,
        license: "Pexels License",
        source_url:
          (candidate.url as string | undefined) ??
          `https://www.pexels.com/photo/${candidateId}/`,
        source: "pexels",
        pexels_id: candidateId,
        query_used: q,
        diversification: {
          attempts_taken: attempt,
          position_picked: i,
          suffix_used: suffix,
          excluded_count: excludeIds.size,
          mono_rejected_count: monoRejectedCount,
          mono_fallback: false,
        },
      };
    }
  }

  // All attempts × positions failed — use first non-excluded mono candidate as last resort
  if (monoFallbackCandidate) {
    const { photo: candidate, attempt, i, suffix, q } = monoFallbackCandidate;
    const candidateId = String((candidate.id as number | undefined) ?? "");
    const src = candidate.src as Record<string, string> | undefined;
    const photoUrl = src?.large2x ?? src?.large ?? src?.original ?? "";
    if (photoUrl) {
      return {
        url: photoUrl,
        author: (candidate.photographer as string | undefined) ?? null,
        license: "Pexels License",
        source_url:
          (candidate.url as string | undefined) ??
          `https://www.pexels.com/photo/${candidateId}/`,
        source: "pexels",
        pexels_id: candidateId,
        query_used: q,
        diversification: {
          attempts_taken: attempt,
          position_picked: i,
          suffix_used: suffix,
          excluded_count: excludeIds.size,
          mono_rejected_count: monoRejectedCount,
          mono_fallback: true,
        },
      };
    }
  }

  // Final fallback: base query, per_page=1, accept any result (even mono)
  const fallbackUrl =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(baseQuery)}` +
    `&per_page=1&orientation=landscape&size=large`;
  const fallbackRes = await fetch(fallbackUrl, { headers: { Authorization: PEXELS_API_KEY } });
  if (!fallbackRes.ok) return null;
  const fallbackData = await fallbackRes.json();
  const p = fallbackData.photos?.[0] as Record<string, unknown> | undefined;
  if (!p) return null;
  const pId = String((p.id as number | undefined) ?? "");
  const pSrc = p.src as Record<string, string> | undefined;
  const photoUrl = pSrc?.large2x ?? pSrc?.large ?? pSrc?.original ?? "";
  if (!photoUrl) return null;
  return {
    url: photoUrl,
    author: (p.photographer as string | undefined) ?? null,
    license: "Pexels License",
    source_url: (p.url as string | undefined) ?? `https://www.pexels.com/photo/${pId}/`,
    source: "pexels",
    pexels_id: pId,
    query_used: baseQuery,
    diversification: {
      attempts_taken: MAX_ATTEMPTS + 1,
      position_picked: 0,
      suffix_used: "fallback",
      excluded_count: excludeIds.size,
      mono_rejected_count: monoRejectedCount,
      mono_fallback: isLikelyMonochrome(p),
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

  // Step 1 — fetch beach (including curated fields) + idempotency check
  const { data: beach, error: beachErr } = await supabase
    .from("beaches")
    .select(
      "id, name, region, image_storage_url, image_photographer, image_pexels_id, " +
      "image_source, image_license, image_source_url, " +
      "image_curated_url, image_curated_author, image_curated_source_url",
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

  // Step 2 — build Pexels query (body override or default)
  const pexelsQuery =
    body.query?.trim() ||
    `${beach.name ?? ""} ${beach.region ?? ""} beach portugal`.trim().replace(/\s+/g, " ");

  const excludeIds = new Set<string>(
    Array.isArray(body.exclude_pexels_ids) ? body.exclude_pexels_ids.map(String) : [],
  );

  // Step 3 — 3-layer fallback chain; first non-null wins
  let candidate: PhotoCandidate | null = null;

  // Layer 0: manual curated override (absolute priority)
  candidate = tryManualCurated(beach as BeachRow);

  // Layer 1: Wikipedia infobox (PT first, EN fallback)
  if (!candidate && beach.name) {
    candidate = await tryWikipediaInfobox(beach.name);
  }

  // Layer 2: Pexels diversification (last resort)
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

  // Step 4 — download image bytes from candidate URL
  const imgRes = await fetch(candidate.url);
  if (!imgRes.ok) {
    return json(
      { error: "download_failed", details: `${imgRes.status} ${imgRes.statusText}` },
      502,
      cors,
    );
  }
  const imgBytes = new Uint8Array(await imgRes.arrayBuffer());

  // Step 5 — upload to Storage (upsert, 1-year cache)
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

  // Step 6 — get public URL
  const { data: pub } = supabase.storage.from("card-images").getPublicUrl(storagePath);
  const storageUrl = pub.publicUrl;

  // Step 7 — UPDATE beaches with attribution + source metadata.
  //   image_curated_* columns are NOT touched — they are editor input, preserved as-is.
  const { error: updateErr } = await supabase
    .from("beaches")
    .update({
      image_storage_url: storageUrl,
      image_photographer: candidate.author,
      image_source: candidate.source,
      image_license: candidate.license,
      image_source_url: candidate.source_url,
      image_pexels_id: candidate.source === "pexels" ? (candidate.pexels_id ?? null) : null,
      image_query_used: candidate.source === "pexels" ? (candidate.query_used ?? null) : null,
      image_updated_at: new Date().toISOString(),
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

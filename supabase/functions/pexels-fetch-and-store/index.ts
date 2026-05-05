// supabase/functions/pexels-fetch-and-store/index.ts
//
// POST /functions/v1/pexels-fetch-and-store
//
// Body (JSON):
//   { kind: "beach", beach_id: "uuid-here", query?: "optional override" }
//
// Behaviour:
//   1. If kind=beach and beach already has image_storage_url → return existing (idempotent)
//   2. Build query: explicit override > "<beach.name> <beach.region> beach portugal"
//   3. Call Pexels API (1 result, landscape, large size)
//   4. Download the photo bytes
//   5. Upload to Supabase Storage: card-images/beaches/{beach_id}.jpg
//   6. Get public URL
//   7. UPDATE beaches SET image_storage_url, image_photographer, image_pexels_id, image_query_used, image_updated_at
//   8. Return { storage_url, photographer, pexels_id, source: "pexels", cached: false }
//
// Errors: graceful with structured JSON { error, details }, never crash silently.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  let body: { kind?: string; beach_id?: string; query?: string };
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
    .select("id, name, region, image_storage_url, image_photographer, image_pexels_id")
    .eq("id", body.beach_id)
    .single();

  if (beachErr || !beach) {
    return json({ error: "beach_not_found", details: beachErr?.message }, 404, cors);
  }

  if (beach.image_storage_url) {
    return json(
      {
        storage_url: beach.image_storage_url,
        photographer: beach.image_photographer,
        pexels_id: beach.image_pexels_id,
        source: "pexels",
        cached: true,
      },
      200,
      cors,
    );
  }

  // Step 2 — build query
  const query =
    body.query?.trim() ||
    `${beach.name ?? ""} ${beach.region ?? ""} beach portugal`.trim().replace(/\s+/g, " ");

  if (!query) {
    return json({ error: "empty_query", details: "beach has no name/region and no override given" }, 400, cors);
  }

  // Step 3 — Pexels search
  const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=large`;
  const pexelsRes = await fetch(pexelsUrl, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!pexelsRes.ok) {
    return json(
      { error: "pexels_api_error", details: `${pexelsRes.status} ${pexelsRes.statusText}` },
      502,
      cors,
    );
  }

  const pexelsData = await pexelsRes.json();
  const photo = pexelsData.photos?.[0];
  if (!photo) {
    return json({ error: "no_pexels_result", details: `query: ${query}` }, 404, cors);
  }

  const photoUrl: string = photo.src?.large2x ?? photo.src?.large ?? photo.src?.original;
  if (!photoUrl) {
    return json({ error: "no_photo_url", details: "pexels response missing src" }, 502, cors);
  }

  // Step 4 — download bytes
  const imgRes = await fetch(photoUrl);
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

  // Step 7 — UPDATE beaches
  const { error: updateErr } = await supabase
    .from("beaches")
    .update({
      image_storage_url: storageUrl,
      image_photographer: photo.photographer ?? null,
      image_pexels_id: String(photo.id ?? ""),
      image_query_used: query,
      image_updated_at: new Date().toISOString(),
    })
    .eq("id", beach.id);

  if (updateErr) {
    return json({ error: "db_update_failed", details: updateErr.message }, 502, cors);
  }

  return json(
    {
      storage_url: storageUrl,
      photographer: photo.photographer ?? null,
      pexels_id: String(photo.id ?? ""),
      query_used: query,
      source: "pexels",
      cached: false,
    },
    200,
    cors,
  );
});

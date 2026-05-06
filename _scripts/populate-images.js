// _scripts/populate-images.js
//
// Populates beaches.image_storage_url + WebP version by calling the
// pexels-fetch-and-store Edge Function and optimising the result.
//
// Usage (run from project root):
//   cd _scripts && npm install               # one-time
//   node populate-images.js                  # DRY-RUN (default) — generates report only
//   node populate-images.js --apply          # APPLY — uploads optimised versions + UPDATEs DB
//
// Modes:
//   --dry-run (default): simulates run, generates HTML report, NO writes
//   --apply:             real run, writes optimised JPEG+WebP, updates DB
//
// What it does (per beach without image_storage_url):
//   1. Calls Edge Function pexels-fetch-and-store (which uploads original JPEG + updates DB)
//   2. Downloads the original from Storage
//   3. Optimises locally with sharp: resize max 1600px wide, JPEG q=82
//   4. Creates WebP version (q=80)
//   5. (--apply only) Uploads optimised versions, updates image_storage_url + image_storage_url_webp
//   6. Adds entry to HTML report
//
// Output:
//   _scripts/reports/populate-YYYYMMDD-HHmmss.html
//   _scripts/reports/populate-YYYYMMDD-HHmmss.json (machine-readable backup)
//
// Failure handling:
//   - Per-beach try/catch — one failure does not abort the whole run
//   - Failures listed in report with red border + error message
//   - JSON backup saved even on partial failure (resumable)

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Sharp with graceful fallback message
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch (e) {
  console.error("\n❌ sharp not installed. Run inside _scripts/:");
  console.error("   npm install\n");
  console.error("If sharp install fails on Windows, see README troubleshooting section.");
  process.exit(1);
}

// Load .env from repo root (one level up from _scripts/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
dotenv.config({ path: join(ROOT, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error("❌ Missing env vars. Ensure .env at repo root has:");
  console.error("   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const MODE = APPLY ? "APPLY" : "DRY-RUN";
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/pexels-fetch-and-store`;
const RATE_LIMIT_MS = 500;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ts = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

console.log(`\n=== populate-images.js [${MODE}] ===\n`);

// 1. Fetch beaches needing images
const { data: beaches, error: fetchErr } = await supabase
  .from("beaches")
  .select("id, name, region, image_storage_url")
  .is("image_storage_url", null)
  .order("name");

if (fetchErr) {
  console.error("❌ Failed to fetch beaches:", fetchErr.message);
  process.exit(1);
}

console.log(`Found ${beaches.length} beach(es) without image_storage_url\n`);

if (beaches.length === 0) {
  console.log("Nothing to do. Exiting.");
  process.exit(0);
}

// 2. Process each
const results = [];
let processed = 0;

const usedPexelsIds = new Set();

for (const beach of beaches) {
  processed++;
  const label = `[${processed}/${beaches.length}] ${beach.name} (${beach.region ?? "?"})`;
  process.stdout.write(`${label}... `);

  const result = {
    id: beach.id,
    name: beach.name,
    region: beach.region,
    status: "pending",
    storage_url: null,
    storage_url_webp: null,
    photographer: null,
    pexels_id: null,
    query_used: null,
    error: null,
    bytes_original: null,
    bytes_optimised: null,
    bytes_webp: null,
    diversification: null,
  };

  try {
    // 2a. Call Edge Function (uploads original + updates DB regardless of mode —
    //     the original JPEG is needed for both dry-run preview and apply optimisation)
    const fnRes = await fetch(EDGE_FN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "beach",
        beach_id: beach.id,
        exclude_pexels_ids: Array.from(usedPexelsIds),
      }),
    });

    if (!fnRes.ok) {
      const errBody = await fnRes.text();
      throw new Error(`Edge fn ${fnRes.status}: ${errBody.slice(0, 200)}`);
    }

    const fnData = await fnRes.json();
    if (fnData.pexels_id) usedPexelsIds.add(fnData.pexels_id);
    result.storage_url = fnData.storage_url;
    result.photographer = fnData.photographer;
    result.pexels_id = fnData.pexels_id;
    result.query_used = fnData.query_used ?? null;
    result.diversification = fnData.diversification ?? null;

    // 2b. Download original
    const imgRes = await fetch(fnData.storage_url);
    if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    result.bytes_original = imgBuffer.length;

    // 2c. Optimise JPEG
    const optimisedJpeg = await sharp(imgBuffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    result.bytes_optimised = optimisedJpeg.length;

    // 2d. Create WebP
    const webpBuffer = await sharp(imgBuffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    result.bytes_webp = webpBuffer.length;

    if (APPLY) {
      // 2e. Upload optimised versions
      const jpegPath = `beaches/${beach.id}.jpg`;
      const webpPath = `beaches/${beach.id}.webp`;

      const { error: jpegUpErr } = await supabase.storage
        .from("card-images")
        .upload(jpegPath, optimisedJpeg, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "31536000",
        });
      if (jpegUpErr) throw new Error(`JPEG upload: ${jpegUpErr.message}`);

      const { error: webpUpErr } = await supabase.storage
        .from("card-images")
        .upload(webpPath, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
          cacheControl: "31536000",
        });
      if (webpUpErr) throw new Error(`WebP upload: ${webpUpErr.message}`);

      // 2f. Update DB with WebP URL (image_storage_url already set by Edge Fn)
      const { data: pubWebp } = supabase.storage.from("card-images").getPublicUrl(webpPath);
      result.storage_url_webp = pubWebp.publicUrl;

      const { error: upErr } = await supabase
        .from("beaches")
        .update({
          image_storage_url_webp: pubWebp.publicUrl,
          image_updated_at: new Date().toISOString(),
        })
        .eq("id", beach.id);
      if (upErr) throw new Error(`DB update: ${upErr.message}`);
    } else {
      // Dry-run: compute would-be WebP URL for preview
      const webpPath = `beaches/${beach.id}.webp`;
      const { data: pubWebp } = supabase.storage.from("card-images").getPublicUrl(webpPath);
      result.storage_url_webp = pubWebp.publicUrl;
    }

    result.status = "ok";
    process.stdout.write(`OK (${(result.bytes_original / 1024).toFixed(0)}KB → ${(result.bytes_optimised / 1024).toFixed(0)}KB jpeg, ${(result.bytes_webp / 1024).toFixed(0)}KB webp)\n`);
  } catch (err) {
    result.status = "fail";
    result.error = err.message;
    process.stdout.write(`FAIL: ${err.message}\n`);
  }

  results.push(result);
  await sleep(RATE_LIMIT_MS);
}

// 3. Generate reports
const reportsDir = join(__dirname, "reports");
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

const stamp = ts();
const jsonPath = join(reportsDir, `populate-${stamp}.json`);
const htmlPath = join(reportsDir, `populate-${stamp}.html`);

writeFileSync(
  jsonPath,
  JSON.stringify({ mode: MODE, generated_at: new Date().toISOString(), results }, null, 2),
);

const okCount = results.filter((r) => r.status === "ok").length;
const failCount = results.filter((r) => r.status === "fail").length;
const totalOriginal = results.reduce((s, r) => s + (r.bytes_original ?? 0), 0);
const totalOptimised = results.reduce((s, r) => s + (r.bytes_optimised ?? 0), 0);
const totalWebp = results.reduce((s, r) => s + (r.bytes_webp ?? 0), 0);

const escape = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cards = results
  .map((r) => {
    const previewUrl = r.storage_url ?? "";
    const border = r.status === "ok" ? "#3a7" : "#c33";
    return `
    <div class="card" style="border: 2px solid ${border};">
      <img src="${escape(previewUrl)}" alt="${escape(r.name)}" loading="lazy" />
      <div class="meta">
        <div class="name">${escape(r.name)}</div>
        <div class="region">${escape(r.region ?? "—")}</div>
        <div class="query">Query: <code>${escape(r.query_used ?? "(cached, no new query)")}</code></div>
        ${r.diversification ? `<div class="diversification" style="font-size:11px;color:#aaa;margin-top:4px;">attempt ${r.diversification.attempts_taken} · pos ${r.diversification.position_picked} · suffix: ${escape(r.diversification.suffix_used)} · excluded: ${r.diversification.excluded_count}</div>` : ""}
        <div class="photographer">Photo: ${escape(r.photographer ?? "—")}</div>
        ${r.bytes_original ? `<div class="bytes">Sizes: ${(r.bytes_original / 1024).toFixed(0)}KB → ${(r.bytes_optimised / 1024).toFixed(0)}KB jpeg / ${(r.bytes_webp / 1024).toFixed(0)}KB webp</div>` : ""}
        ${r.status === "fail" ? `<div class="error">ERROR: ${escape(r.error)}</div>` : ""}
        <div class="id"><code>${escape(r.id)}</code></div>
      </div>
    </div>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8" />
<title>populate-images report — ${stamp} — ${MODE}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #0B1B2B; color: #F2E8D5; margin: 0; padding: 24px; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  .summary { background: #050D17; padding: 16px; border-radius: 6px; margin-bottom: 24px; }
  .summary span { display: inline-block; margin-right: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .card { background: #050D17; border-radius: 6px; overflow: hidden; }
  .card img { width: 100%; height: 180px; object-fit: cover; display: block; background: #222; }
  .meta { padding: 12px; font-size: 13px; line-height: 1.5; }
  .name { font-weight: 600; font-size: 15px; color: #C9A24B; }
  .region { color: #E5D6B5; margin-bottom: 6px; }
  .query, .photographer, .bytes, .id { font-size: 12px; opacity: 0.8; }
  .error { color: #ff7676; margin-top: 6px; font-size: 12px; }
  code { background: #0B1B2B; padding: 1px 4px; border-radius: 3px; }
</style>
</head>
<body>
<h1>populate-images report — ${escape(MODE)}</h1>
<div class="summary">
  <span><strong>Generated:</strong> ${escape(new Date().toISOString())}</span>
  <span><strong>Total:</strong> ${results.length}</span>
  <span style="color: #3a7;"><strong>OK:</strong> ${okCount}</span>
  <span style="color: #ff7676;"><strong>Fail:</strong> ${failCount}</span>
  <span><strong>Bytes:</strong> ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalOptimised / 1024 / 1024).toFixed(1)}MB jpeg / ${(totalWebp / 1024 / 1024).toFixed(1)}MB webp</span>
</div>
<div class="grid">
${cards}
</div>
</body>
</html>`;

writeFileSync(htmlPath, html);

console.log(`\n=== Done ===`);
console.log(`Mode:       ${MODE}`);
console.log(`Total:      ${results.length}`);
console.log(`OK:         ${okCount}`);
console.log(`Fail:       ${failCount}`);
console.log(`\nReport:     ${htmlPath}`);
console.log(`JSON:       ${jsonPath}\n`);

if (!APPLY) {
  console.log("📌 DRY-RUN complete. Open the HTML report and review.");
  console.log("   To apply changes for real, run: node populate-images.js --apply\n");
} else {
  console.log("✅ APPLY complete. Database and Storage updated.\n");
}

process.exit(failCount > 0 ? 1 : 0);

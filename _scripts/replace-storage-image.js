// _scripts/replace-storage-image.js
//
// Generic CLI to replace a single image in Supabase Storage.
// Resizes with sharp (MozJPEG, progressive, no upscale) and upserts into a bucket.
//
// Usage (run from repo root C:\Users\Powerpc or from inside _scripts/):
//   node Portal-turismo-site/_scripts/replace-storage-image.js \
//     --source "/path/to/photo.jpg" \
//     --bucket card-images \
//     --path "beaches/513d687d-b8f9-4d87-b5a7-c6de1d7d695c.jpg"
//
// Optional flags:
//   --width  <px>     Max output width in pixels (default: 1600, no upscale)
//   --quality <0-100> JPEG quality (default: 80)
//
// Requires in Portal-turismo-site/.env:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Does NOT touch the database (zero supabase.from() calls).

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Sharp with graceful fallback ───────────────────────────────────────────────
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch (e) {
  console.error("\nsharp not installed. Run inside _scripts/:");
  console.error("   npm install\n");
  process.exit(1);
}

// ── Load .env from repo root (one level up from _scripts/) ────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
dotenv.config({ path: join(ROOT, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Ensure .env at repo root has:");
  console.error("   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ── CLI arg parsing ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

let sourcePath = null;
let bucket = null;
let storagePath = null;
let maxWidth = 1600;
let jpegQuality = 80;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--source":
      sourcePath = args[++i];
      break;
    case "--bucket":
      bucket = args[++i];
      break;
    case "--path":
      storagePath = args[++i];
      break;
    case "--width":
      maxWidth = parseInt(args[++i], 10);
      break;
    case "--quality":
      jpegQuality = parseInt(args[++i], 10);
      break;
    case "--help":
    case "-h":
      console.log("Usage:");
      console.log(
        "  node replace-storage-image.js --source <path> --bucket <name> --path <storage-path>",
      );
      console.log("\nRequired:");
      console.log("  --source   <path>      Local image file (absolute or relative)");
      console.log("  --bucket   <name>      Supabase Storage bucket name (e.g. card-images)");
      console.log(
        "  --path     <path>      Destination path in bucket (e.g. beaches/uuid.jpg)",
      );
      console.log("\nOptional:");
      console.log("  --width    <px>        Max output width, no upscale (default: 1600)");
      console.log("  --quality  <0-100>     JPEG quality (default: 80)");
      process.exit(0);
  }
}

// ── Input validation (fail fast) ──────────────────────────────────────────────
let valid = true;

if (!sourcePath || sourcePath.trim() === "") {
  console.error("Error: --source is required");
  valid = false;
}

if (!bucket || bucket.trim() === "") {
  console.error("Error: --bucket is required");
  valid = false;
}

if (!storagePath || storagePath.trim() === "") {
  console.error("Error: --path is required");
  valid = false;
}

if (!valid) {
  console.error('\nRun with --help for usage.');
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source file not found: ${sourcePath}`);
  process.exit(1);
}

try {
  fs.accessSync(sourcePath, fs.constants.R_OK);
} catch {
  console.error(`Error: Source file is not readable: ${sourcePath}`);
  process.exit(1);
}

// ── Read source file and metadata ─────────────────────────────────────────────
const inputBuffer = fs.readFileSync(sourcePath);
const inputKB = (inputBuffer.length / 1024).toFixed(1);

const metaIn = await sharp(inputBuffer).metadata();
const widthIn = metaIn.width ?? "?";
const heightIn = metaIn.height ?? "?";

console.log(`\nSource:     ${sourcePath}`);
console.log(`            ${widthIn}x${heightIn}px | ${inputKB}KB`);

// ── Resize and recompress ─────────────────────────────────────────────────────
const outputBuffer = await sharp(inputBuffer)
  .resize({ width: maxWidth, withoutEnlargement: true })
  .jpeg({ quality: jpegQuality, mozjpeg: true, progressive: true })
  .toBuffer();

const outputKB = (outputBuffer.length / 1024).toFixed(1);
const metaOut = await sharp(outputBuffer).metadata();
const widthOut = metaOut.width ?? "?";
const heightOut = metaOut.height ?? "?";

const savedPct =
  inputBuffer.length > 0
    ? (((inputBuffer.length - outputBuffer.length) / inputBuffer.length) * 100).toFixed(1)
    : "0.0";

console.log(`After resize: ${widthOut}x${heightOut}px | ${outputKB}KB`);

// ── Upload to Supabase Storage ────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log(`\nUploading to bucket "${bucket}" at path "${storagePath}" ...`);

const { error: uploadError } = await supabase.storage
  .from(bucket)
  .upload(storagePath, outputBuffer, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "31536000",
  });

if (uploadError) {
  console.error(`Upload failed: ${uploadError.message}`);
  process.exit(1);
}

console.log("Upload OK.");

// ── Get public URL and verify HTTP 200 ───────────────────────────────────────
const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
const publicUrl = pub.publicUrl;

const cachebustedUrl = `${publicUrl}?t=${Date.now()}`;
console.log(`Verifying: ${cachebustedUrl}`);

const verifyRes = await fetch(cachebustedUrl);

if (!verifyRes.ok) {
  console.error(`Verify FAILED: HTTP ${verifyRes.status}`);
  process.exit(1);
}

const contentLength = verifyRes.headers.get("content-length") ?? "N/A";

// ── Final summary ─────────────────────────────────────────────────────────────
console.log(`
=== replace-storage-image complete ===
Source:    ${sourcePath}
Bucket:    ${bucket}/${storagePath}
Before:    ${widthIn}x${heightIn}px | ${inputKB}KB
After:     ${widthOut}x${heightOut}px | ${outputKB}KB (saved ${savedPct}%)
URL:       ${publicUrl}
Verify:    HTTP ${verifyRes.status} | Content-Length: ${contentLength} bytes
`);

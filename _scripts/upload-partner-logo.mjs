// _scripts/upload-partner-logo.mjs
//
// Upload a partner logo (PNG, transparency preserved) to Supabase Storage.
// No reprocessing — uploads raw file to preserve brand colours and transparency.
//
// Usage (from repo root):
//   node --use-system-ca _scripts/upload-partner-logo.mjs \
//     --source "/path/to/logo.png" \
//     --bucket card-images \
//     --path "partner-logos/good-feeling-surf-school.png"
//
// Requires in .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
dotenv.config({ path: join(ROOT, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const args = process.argv.slice(2);
let sourcePath, bucket, storagePath;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source") sourcePath = args[++i];
  else if (args[i] === "--bucket") bucket = args[++i];
  else if (args[i] === "--path") storagePath = args[++i];
}

if (!sourcePath || !bucket || !storagePath) {
  console.error("Usage: --source <path> --bucket <name> --path <storage-path>");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`);
  process.exit(1);
}

const buf = fs.readFileSync(sourcePath);
const sizeKB = (buf.length / 1024).toFixed(1);
console.log(`\nSource: ${sourcePath} | ${sizeKB}KB`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log(`Uploading to ${bucket}/${storagePath} ...`);
const { error } = await supabase.storage
  .from(bucket)
  .upload(storagePath, buf, {
    contentType: "image/png",
    upsert: true,
    cacheControl: "31536000",
  });

if (error) {
  console.error(`Upload failed: ${error.message}`);
  process.exit(1);
}

const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
const publicUrl = pub.publicUrl;

const verifyRes = await fetch(`${publicUrl}?t=${Date.now()}`);
const contentLength = verifyRes.headers.get("content-length") ?? "N/A";

console.log(`
=== upload-partner-logo complete ===
Bucket:  ${bucket}/${storagePath}
Size:    ${sizeKB}KB (raw PNG, no reprocessing)
URL:     ${publicUrl}
Verify:  HTTP ${verifyRes.status} | Content-Length: ${contentLength} bytes
`);

if (!verifyRes.ok) {
  console.error(`Verify FAILED: HTTP ${verifyRes.status}`);
  process.exit(1);
}

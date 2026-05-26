// One-off upload: partner logo PNG (preserves alpha/transparency)
// Usage: node --use-system-ca _scripts/upload-partner-logo-png.mjs <source.png> <storage-path>
// Example: node --use-system-ca _scripts/upload-partner-logo-png.mjs C:/tmp/albufeira-logo-final.png partner-logos/albufeira-surf-sup.png

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const [sourcePath, storagePath] = process.argv.slice(2);
if (!sourcePath || !storagePath) {
  console.error("Usage: node upload-partner-logo-png.mjs <source.png> <storage-path>");
  process.exit(1);
}

const buf = fs.readFileSync(sourcePath);
console.log(`Source: ${sourcePath} (${(buf.length / 1024).toFixed(1)} KB)`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { error } = await supabase.storage
  .from("partner-images")
  .upload(storagePath, buf, {
    contentType: "image/png",
    upsert: true,
    cacheControl: "31536000",
  });

if (error) {
  console.error("Upload failed:", error.message);
  process.exit(1);
}

const { data } = supabase.storage.from("partner-images").getPublicUrl(storagePath);
console.log("Upload OK.");
console.log("Public URL:", data.publicUrl);

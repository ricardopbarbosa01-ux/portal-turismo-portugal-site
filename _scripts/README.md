# _scripts/

Local-only utility scripts for PTH maintenance. Not deployed.

## Setup (one-time)

```powershell
cd _scripts
npm install
```

If `sharp` install fails on Windows, see Troubleshooting below.

## Environment variables

Copy `.env.example` from repo root to `.env` and fill in:

```
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard → Settings → API>
```

⚠️ `.env` is gitignored. Never commit the service role key.

## populate-images.js

Iterates over beaches without `image_storage_url`, calls the Edge Function `pexels-fetch-and-store`, optimises (resize 1600px + WebP), and generates an HTML review report.

### Dry-run (default)

```powershell
cd _scripts
node populate-images.js
```

Generates `_scripts/reports/populate-YYYYMMDD-HHmmss.html` and `.json`.
Open the HTML in a browser. Review thumbnails. NO writes happen in dry-run.

### Apply

```powershell
node populate-images.js --apply
```

Uploads optimised JPEG+WebP to Storage, updates `image_storage_url_webp` in DB.

## Troubleshooting

### sharp install fails on Windows

Most modern Windows + Node 18+ should work out of the box (sharp ships prebuilt binaries). If install fails:

1. Confirm Node version ≥ 18.17: `node --version`
2. Try clean reinstall: `rm -r node_modules; rm package-lock.json; npm install`
3. As fallback, replace sharp with jimp in package.json:
   `"jimp": "^0.22.10"` instead of `"sharp": "^0.33.5"`
   Then update populate-images.js to use jimp API (10x slower but pure JS).

### Edge Function returns "no_pexels_result"

Means the auto-generated query (`<beach name> <region> beach portugal`) didn't match anything on Pexels. Options:
- Skip and curate manually later
- Add manual override: future work, not in this script yet

# pexels-fetch-and-store-v4

Hybrid image system: manual editorial override + Wikipedia infobox + Pexels fallback.

## Why v4 exists

v3 tested a 4-layer chain including Wikimedia geo-search and text-search. Both failed in production:
- **Geo-search** returned geographically nearby files unrelated to beaches (forests, roads).
- **Text-search** returned homonyms in other regions (searching "Fajã da Areia" returned Açores results when Madeira was intended).

v4 simplifies to 3 layers that actually work reliably.

## Layers (priority order)

| # | Name | Trigger | Notes |
|---|------|---------|-------|
| 0 | Manual curated | `image_curated_url` set on beach row | Absolute priority; editor-verified image |
| 1 | Wikipedia infobox | Beach has a Wikipedia article with an infobox image | PT API first, EN fallback; works for ~30-40 famous beaches |
| 2 | Pexels diversification | All above fail | Random page/position/suffix rotation to avoid duplicate results |

## How to add a manual override

### What columns to fill

Open **Supabase Dashboard → Table Editor → beaches**, find the beach row, and fill:

| Column | Value |
|--------|-------|
| `image_curated_url` | Direct URL to the image file (JPEG/PNG/WebP, min 1600px wide) |
| `image_curated_author` | Photographer or creator name (required for attribution) |
| `image_curated_source_url` | Page URL where the image was found (Wikimedia File page, Pexels photo page, etc.) |

Then **set `image_storage_url` to NULL** on the same row — this clears the idempotency guard so the next populate run re-fetches.

### Acceptable image sources

**Wikimedia Commons** (recommended — free, stable URLs, good resolution):
1. Search at `https://commons.wikimedia.org` with the beach name.
2. Filter to images; choose one with license **CC BY**, **CC BY-SA**, or **Public Domain**.
3. Click the image → on the file description page, click the full-resolution image link.
4. Right-click the image → "Copy image address" → paste into `image_curated_url`.
5. Author is in the "Author" field on the file page.
6. Source URL is the `commons.wikimedia.org/wiki/File:...` page URL.

**Pexels** (no attribution required, but good practice to credit):
1. Search at `https://www.pexels.com`.
2. Click photo → "Free Download" → choose size "Large" or "Original".
3. Right-click the downloaded image → copy image address, OR use the direct photo URL.
4. Photographer name shown below the photo.
5. Source URL is the Pexels photo page URL (`https://www.pexels.com/photo/...`).

**Unsplash** (similar to Pexels, attribution appreciated):
- Use the photo download URL (not the page URL).
- Note photographer name and profile link as `image_curated_source_url`.

### License warning

Editor is responsible for verifying that the chosen image:
- **Permits commercial use** (CC BY, CC BY-SA, Pexels License, Unsplash License — all OK; CC BY-NC is NOT OK).
- **Has proper attribution** stored in `image_curated_author` and `image_curated_source_url`.
- **Has sufficient resolution** (ideally ≥ 1600px wide; script resizes down, never up).

The Edge Function downloads the image as-is; it does not verify the license automatically.

## API contract

**Request:**
```json
POST /functions/v1/pexels-fetch-and-store-v4
{ "kind": "beach", "beach_id": "uuid", "query": "optional pexels override", "exclude_pexels_ids": ["123"] }
```

**Response (new fetch):**
```json
{
  "storage_url": "https://...supabase.co/storage/v1/object/public/card-images/beaches/<id>.jpg",
  "photographer": "Author Name",
  "source": "manual|wikipedia_infobox|pexels",
  "license": "CC BY-SA 3.0|Pexels License|Manual curation (license verified by editor)",
  "source_url": "https://...",
  "cached": false,
  "diversification": { ... }  // only present when source=pexels
}
```

**Response (cached / idempotent):**
```json
{ "storage_url": "...", "photographer": "...", "source": "...", "cached": true }
```

## Differences from v3

| Feature | v3 | v4 |
|---------|----|----|
| Manual curated override | ✗ | ✓ Layer 0 |
| Wikipedia infobox | ✓ | ✓ Layer 1 (same code) |
| Wikimedia geo-search | ✓ | ✗ Removed |
| Wikimedia text-search | ✓ | ✗ Removed |
| Pexels diversification | ✓ | ✓ Layer 2 (same code) |
| Columns fetched from DB | without curated_* | includes curated_* |

v2 and v3 remain deployed in parallel until v4 is validated across all 109 beaches.

## Deploy

```bash
npx supabase functions deploy pexels-fetch-and-store-v4 --no-verify-jwt --project-ref glupdjvdvunogkqgxoui
```

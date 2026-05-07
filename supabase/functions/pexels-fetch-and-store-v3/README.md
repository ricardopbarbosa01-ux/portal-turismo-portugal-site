# pexels-fetch-and-store-v3 — Multi-Source Image Edge Function

## Purpose

v3 replaces the Pexels-only approach of v2 with a 4-layer fallback chain that favours authoritative encyclopedic sources first (Wikipedia, Wikimedia Commons) before falling back to Pexels. This results in more accurate beach-specific photos with proper CC BY-SA licensing and attribution metadata. v2 (`pexels-fetch-and-store`) is kept alive in parallel during a 5-praia validation gate before mass apply to all 109 beaches.

## v2 vs v3 differences

| Feature | v2 | v3 |
|---------|----|----|
| Sources | Pexels only | Wikipedia infobox → Wikimedia geo → Wikimedia text → Pexels |
| Attribution fields | photographer name | author + license + source_url |
| New DB columns | — | image_source, image_license, image_source_url |
| Keyword filter | None | Positive + negative word-boundary regex |
| image_pexels_id | Always set | Only set when source = "pexels" |
| image_query_used | Always set | Only set when source = "pexels" |
| v2 status | Active | Kept alive in parallel during v3 validation |

## Layer order

### Layer 1 — Wikipedia infobox image

- Endpoint: `GET https://pt.wikipedia.org/api/rest_v1/page/summary/{name}` (PT first, EN fallback)
- Extracts `originalimage.source` or `thumbnail.source` from REST summary response
- No keyword filtering needed — Wikipedia article pages are already semantically authoritative
- Author: `"Wikipedia contributors"` (standard attribution for Wikipedia content)
- License: `"CC BY-SA 3.0"` (standard Wikipedia media license)
- Single network call per language; fast path if Wikipedia has an article for the beach

### Layer 2 — Wikimedia Commons geo-search

- Endpoint: `commons.wikimedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lng}&gsradius=2000&gslimit=50&gsnamespace=6`
- Requires `latitude` and `longitude` columns populated in the `beaches` table
- Returns up to 50 File namespace (namespace 6) candidates within 2000m of coordinates
- Each candidate is filtered by `isImageRelevant(title)` before fetching full metadata
- First passing candidate calls `fetchImageInfo()` for URL, author, license, source_url

### Layer 3 — Wikimedia Commons text search

- Endpoint: `commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={name}&srnamespace=6&srlimit=25`
- Searches File namespace by beach name string; up to 25 results
- Each result filtered by `isImageRelevant(title, snippet)` using both filename and snippet
- First passing result calls `fetchImageInfo()` for full metadata

### Layer 4 — Pexels (final fallback)

- Exact v2 diversification logic: suffix rotation (10 visual suffixes), random pagination (positions 3–12), `excludeIds` opt-in tracking
- Up to 4 attempts before hard fallback to base query at position 0
- License: `"Pexels License"` (free for commercial use per Pexels ToS, attribution encouraged)
- Pexels-specific fields (`pexels_id`, `query_used`, `diversification`) appear in response only when this layer is used

## Positive / negative keyword filtering

Applied to filename + description of every Wikimedia candidate (Layers 2 and 3).

**Positive keywords** (any match required to accept a candidate):

```
praia, beach, playa, strand, sand, shore, coast, cliff, sea, ocean, costa, areia, dune
```

**Negative keywords** (any match disqualifies the candidate):

```
church, igreja, capela, town, vila, estação, station, map, mapa, rua, street, museu, museum, hotel, restaurant
```

### Word boundary note

Filtering uses `\b` regex anchors (word boundaries) so substrings inside legitimate beach names do NOT trigger false positives. Example: "vila" must not match "Vila Praia de Âncora" as a disqualifying substring, because in that name "Praia" provides a positive match and "Vila" at the start is a boundary-anchored proper noun. The gate is `hasPositive AND NOT hasNegative` — a candidate passes only when at least one positive keyword matches AND no negative keyword matches as a whole word.

Implementation:

```typescript
const hasWord = (text: string, word: string): boolean => {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
};
```

## Example JSON responses

### Wikipedia infobox source

```json
{
  "storage_url": "https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/card-images/beaches/<id>.jpg",
  "photographer": "Wikipedia contributors",
  "source": "wikipedia_infobox",
  "license": "CC BY-SA 3.0",
  "source_url": "https://pt.wikipedia.org/wiki/Praia_da_Rocha",
  "cached": false,
  "diversification": null
}
```

### Pexels fallback source

```json
{
  "storage_url": "https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/card-images/beaches/<id>.jpg",
  "photographer": "John Doe",
  "source": "pexels",
  "license": "Pexels License",
  "source_url": "https://www.pexels.com/photo/12345/",
  "cached": false,
  "pexels_id": "12345",
  "query_used": "Praia da Murtinheira coast beach portugal cliffs",
  "diversification": {
    "attempts_taken": 2,
    "position_picked": 7,
    "suffix_used": "cliffs",
    "excluded_count": 3
  }
}
```

## Attribution requirements (mandatory for CC BY-SA)

Wikipedia and Wikimedia Commons images are typically licensed under **CC BY-SA 3.0** or **CC BY 4.0**. Attribution MUST be displayed to comply with license terms. The `author`, `license`, and `source_url` fields are provided for this purpose.

- For `image_source` in `{wikipedia_infobox, wikimedia_geo, wikimedia_text}`: display attribution near the image as `Photo: <author> · <license> · <source link>`
- For `image_source = "pexels"`: attribution follows Pexels ToS (Fase 5 will add UI treatment)

**Fase 4.5 (future task — HTML/CSS adapter)** MUST render the attribution line for all wiki-sourced images. Failing to attribute CC BY-SA content is a license violation.

## DB columns added by this plan

Migration: `docs/migrations/2026-05-06-add-image-source-fields.sql`

| Column | Type | Description |
|--------|------|-------------|
| `image_source` | TEXT | `wikipedia_infobox \| wikimedia_geo \| wikimedia_text \| pexels` |
| `image_license` | TEXT | License code (e.g. `CC BY-SA 3.0`, `Pexels License`) |
| `image_source_url` | TEXT | URL to original source page for attribution link |

All three columns are nullable TEXT, idempotent (`IF NOT EXISTS`). Apply via Supabase SQL Editor before deploying v3.

## Deployment

**Step 1** — Apply migration in Supabase SQL Editor:

```sql
-- docs/migrations/2026-05-06-add-image-source-fields.sql
ALTER TABLE beaches
  ADD COLUMN IF NOT EXISTS image_source     TEXT,
  ADD COLUMN IF NOT EXISTS image_license    TEXT,
  ADD COLUMN IF NOT EXISTS image_source_url TEXT;
```

**Step 2** — Deploy v3 function:

```bash
npx supabase functions deploy pexels-fetch-and-store-v3 --no-verify-jwt --project-ref glupdjvdvunogkqgxoui
```

**v2 kept alive:** `pexels-fetch-and-store` remains active in parallel. Do NOT delete v2 until v3 passes the 5-praia validation gate.

## Manual validation gate

Before mass apply (`_scripts/populate-images.js` for all 109 beaches), run v3 manually on these 5 test beaches and visually review results:

| Beach | Expected layer | Scenario |
|-------|---------------|----------|
| Praia da Marinha | wikipedia_infobox | Famous beach — strong Wikipedia article (PT + EN) |
| Praia da Fajã da Areia | wikimedia_geo or wikimedia_text | Azores beach — obscure, geo-search should find Commons files |
| Praia de Caxinas | wikimedia_geo or wikimedia_text | North PT beach — smaller Wikipedia presence |
| Praia de São Torpes | wikimedia_geo or wikimedia_text | Alentejo coast — Wikimedia coverage expected |
| Praia da Murtinheira | pexels (acceptable) | Edge case — may fall to Pexels; coastal neighbour within ~1-2km is acceptable |

All 5 must return a valid `storage_url` with appropriate `source` attribution. Only after all 5 pass, proceed with full `populate-images.js` run.

## Test call example

```bash
curl -X POST https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/pexels-fetch-and-store-v3 \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{ "kind": "beach", "beach_id": "<uuid-from-beaches-table>" }'
```

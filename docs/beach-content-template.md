# Beach Entry Template

Copy this block into `data/beaches-master.json` under `"beaches": [...]` when adding a new beach.
Fill every field. Use `"status": "draft"` until the Supabase record and both language descriptions are ready.

---

## JSON Template

```json
{
  "slug": "praia-do-EXEMPLO",
  "supabase_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "draft",
  "last_updated": "YYYY-MM-DD",

  "name_pt": "Praia do Exemplo",
  "name_en": "Exemplo Beach",
  "region": "Algarve",
  "subregion": "Lagos",

  "beach_type": "sandy",
  "ideal_for": ["families", "swimming"],
  "water_quality": "Excelente",
  "family_friendly": true,
  "surf": false,
  "fishing": false,

  "access": "easy-flat",
  "parking": "free-onsite",
  "lifeguard": false,
  "disabled_access": false,
  "facilities": [],

  "webcam_available": false,
  "latitude": 37.0000,
  "longitude": -8.0000,

  "description_pt": "Descrição editorial em português — 1–2 frases, tom informativo e direto.",
  "description_en": "Editorial description in English — 1–2 sentences, informative and direct.",

  "related_pages_pt": ["beaches.html"],
  "related_pages_en": ["en/beaches.html"],
  "booking_region_hint": "Lagos"
}
```

---

## Field Reference

| Field | Type | Required | Valid Values / Notes |
|-------|------|----------|----------------------|
| `slug` | string | ✅ | kebab-case, unique, matches URL pattern |
| `supabase_id` | UUID | ✅ | Copy from Supabase `beaches` table. Create record first if new. |
| `status` | string | ✅ | `live` · `draft` · `missing-data` |
| `last_updated` | date | ✅ | ISO 8601: `YYYY-MM-DD` |
| `name_pt` | string | ✅ | Official PT name |
| `name_en` | string | ✅ | EN equivalent (translate or transliterate) |
| `region` | string | ✅ | Must match Supabase exactly → `Alentejo` `Algarve` `Açores` `Centro` `Lisboa e Setúbal` `Madeira` `Norte` `Oeste` |
| `subregion` | string | ✅ | Municipality or local name (e.g. `Lagos`, `Cascais`) |
| `beach_type` | string | ✅ | `sandy` `cove` `urban` `wild` `surf` `river-mouth` `natural-reserve` `volcanic` |
| `ideal_for` | array | ✅ | Any of: `families` `swimming` `snorkelling` `surf` `fishing` `photography` `sunset` `hiking-nearby` `windsurfing` `diving` `kayaking` `big-wave-watching` `beach-volleyball` |
| `water_quality` | string | ✅ | `Excelente` `Boa` `Suficiente` `Má` (must match Supabase value) |
| `family_friendly` | boolean | ✅ | `true` if suitable for children and older guests |
| `surf` | boolean | ✅ | `true` if known surf spot |
| `fishing` | boolean | ✅ | `true` if popular for fishing |
| `access` | string | ✅ | `easy-flat` `wooden-staircase` `cliff-path` `sandy-path` `boat-only` `car-direct` |
| `parking` | string | ✅ | `free-onsite` `paid-onsite` `nearby-free` `nearby-paid` `limited` `none` |
| `lifeguard` | boolean | ✅ | Seasonal; document season if known |
| `disabled_access` | boolean | ✅ | Based on `disabled` in Supabase `facilities` array |
| `facilities` | array | ✅ | Subset of: `lifeguard` `restaurant` `disabled` `showers` `wc` `bike-parking` |
| `webcam_available` | boolean | ✅ | `true` if webcam exists on `webcams.html` |
| `latitude` | float | ✅ | Decimal degrees (from Supabase or Google Maps) |
| `longitude` | float | ✅ | Decimal degrees (negative for Portugal) |
| `description_pt` | string | ✅ | 1–3 sentences, editorial tone. Goes into Supabase `description` field. |
| `description_en` | string | ✅ | 1–3 sentences. Used for EN pages and `en/beach.html` SEO. |
| `related_pages_pt` | array | ✅ | PT editorial pages that should link to this beach |
| `related_pages_en` | array | ✅ | EN editorial pages that should link to this beach |
| `booking_region_hint` | string | ✅ | Town/region name for Booking.com search query |

---

## Slug Convention

- Use lowercase kebab-case
- Remove accents: `praia-da-marinha` not `praia-da-marínha`
- Prefix with `praia-` for beaches named "Praia de/do/da X"
- For places named without "Praia" (e.g. `zambujeira-do-mar`), keep as-is
- Must be globally unique within `beaches-master.json`

## Description Style Guide

**PT:** Frase curta, sem clichés ("paraíso", "espetacular"), sem superlativos vazios. Mencionar o carácter físico, o tipo de utilizador e o que distingue.
```
"Encaixada entre falésias douradas, acessível por escadas de madeira. Uma das praias mais fotogénicas do Algarve."
```

**EN:** Same tone. Direct, editorial. Avoid marketing language.
```
"Tucked between golden cliffs and reached by wooden steps — one of the Algarve's most photogenic coves."
```

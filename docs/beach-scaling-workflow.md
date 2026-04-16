# Beach Scaling Workflow

Operational checklist for adding a new beach to the portal.
Target: go from "beach name" to live, linked, bilingual entry in < 30 minutes.

Current scale: **82 beaches in Supabase**. Target: **200+**.
Master file: `data/beaches-master.json`

---

## Overview

```
1. Supabase record  →  2. beaches-master.json  →  3. descriptions  →  4. internal links  →  5. validate  →  6. deploy
```

---

## Step-by-step

### Step 1 — Check if beach already exists in Supabase

```bash
# Quick name search via REST API
node -e "
const URL='https://glupdjvdvunogkqgxoui.supabase.co';
const KEY='sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';
fetch(URL+'/rest/v1/beaches?name=ilike.*BEACH_NAME*&select=id,name,region',
  {headers:{'Authorization':'Bearer '+KEY,'apikey':KEY}})
  .then(r=>r.json()).then(console.log).catch(console.error)
"
```

- If beach exists → copy the `id` (UUID)
- If beach does not exist → create it in Supabase first (Step 1b)

### Step 1b — Create Supabase record (new beach only)

Minimum required fields for Supabase insert:
```json
{
  "name": "Praia do Exemplo",
  "region": "Algarve",
  "water_quality": "Boa",
  "description": "PT description (1–3 sentences).",
  "image_url": "https://images.unsplash.com/...",
  "facilities": [],
  "latitude": 37.0000,
  "longitude": -8.0000,
  "is_active": true
}
```

Use the Supabase dashboard or `_scripts/` tooling. Copy the generated UUID.

---

### Step 2 — Add entry to beaches-master.json

1. Open `data/beaches-master.json`
2. Copy the template from `docs/beach-content-template.md`
3. Paste as the last item in the `"beaches"` array (add a comma to the previous entry)
4. Fill all required fields
5. Set `"status": "draft"` until fully ready

Key fields to get right immediately:
- `slug` — unique, kebab-case, no accents
- `supabase_id` — UUID from Step 1
- `region` — must match Supabase spelling exactly
- `latitude` / `longitude` — verify against Google Maps

---

### Step 3 — Write descriptions (PT + EN)

**PT description** → update in Supabase `description` field
**EN description** → stored in `beaches-master.json` `description_en` field (used for EN editorial pages)

Style guide: `docs/beach-content-template.md` → "Description Style Guide"

Checklist:
- [ ] 1–3 sentences, no marketing fluff
- [ ] Mentions beach character (type, access, setting)
- [ ] Mentions target user if relevant (surf, families, nature)
- [ ] PT description live in Supabase

---

### Step 4 — Wire internal links

For each page in `related_pages_pt` and `related_pages_en`:
- Add a link card or mention pointing to `beach.html?id={supabase_id}`
- If the beach belongs to a guide (e.g. `praias-algarve.html`), add it to that guide's beach list

Priority linking targets:
- `beaches.html` (auto-populated from Supabase — no manual action needed if record is active)
- Guide pages matching region/type
- `index.html` FEATURED array (for top-tier beaches only)

---

### Step 5 — Validate

```bash
node _scripts/validate-beaches-data.js
```

Checks:
- All required fields present
- No duplicate slugs
- No duplicate supabase_ids
- Valid `status`, `water_quality`, `region` values
- `latitude` between 29–42, `longitude` between -10 and -6

Fix any errors before continuing.

---

### Step 6 — Set status to live

In `beaches-master.json`, change `"status": "draft"` → `"status": "live"`.
Update `"last_updated"` to today's date.

---

### Step 7 — Deploy

```bash
npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true
```

---

### Step 8 — Smoke test (30 seconds)

- [ ] `beach.html?id={supabase_id}` loads and shows name + description
- [ ] Beach appears in `beaches.html` filtered by its region
- [ ] Any linked editorial page shows the beach correctly
- [ ] Mobile layout looks clean

---

## Batch additions (5+ beaches at once)

1. Add all entries to `beaches-master.json` as `status: draft`
2. Create all Supabase records
3. Write all descriptions
4. Run validator
5. Set all to `status: live`
6. Single deploy

---

## Status definitions

| Status | Meaning |
|--------|---------|
| `live` | Supabase record active, PT description present, EN description present, linked from at least one editorial page |
| `draft` | Entry added to master file but not yet fully ready — missing data, description or links |
| `missing-data` | Known beach that needs research before it can go live (GPS, description, image) |

---

## Regions quick reference

| Region (Supabase) | Coverage | Example towns |
|-------------------|----------|---------------|
| `Algarve` | South coast | Lagos, Portimão, Faro, Tavira |
| `Alentejo` | Southwest wild coast | Odemira, Aljezur, Sines |
| `Centro` | Central west coast | Nazaré, Figueira da Foz, Peniche |
| `Lisboa e Setúbal` | Setúbal Peninsula | Comporta, Sesimbra, Setúbal |
| `Oeste` | Greater Lisbon coast | Cascais, Sintra, Ericeira |
| `Norte` | North coast | Viana do Castelo, Barcelos, Caminha |
| `Madeira` | Madeira island | Funchal, Porto Santo |
| `Açores` | Azores islands | Ponta Delgada, Horta |

---

## Priority beaches to add next (suggested)

Beaches known from editorial pages that may not yet be in Supabase:

| Beach | Region | Guide page |
|-------|--------|------------|
| Praia dos Galapinhos | Lisboa e Setúbal | praias-perto-lisboa.html |
| Praia de Sesimbra | Lisboa e Setúbal | praias-perto-lisboa.html |
| Praia da Costa de Caparica | Oeste | praias-perto-lisboa.html |
| Praia de Odeceixe | Alentejo | praias-para-surfistas-iniciantes-portugal.html |
| Praia de Porto Santo | Madeira | best-beaches-portugal.html |
| Praia de São Rafael | Algarve | praias-familias-algarve.html |
| Praia do Vau | Algarve | praias-familias-algarve.html |
| Ribeira d'Ilhas | Oeste | surf.html (Ericeira WCT spot) |
| Praia da Nazaré (Praia Norte) | Centro | surf.html (big wave spot) |
| Praia Verde | Algarve | best-beaches-algarve.html |

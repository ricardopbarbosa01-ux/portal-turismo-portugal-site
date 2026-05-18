#!/usr/bin/env node
/**
 * _scripts/prerender-top-beaches.js
 * Node CLI — Pre-renders top 30 beaches as static HTML for Google indexing.
 *
 * Usage:
 *   node prerender-top-beaches.js               # generate 30 PT files in /praias/
 *   node prerender-top-beaches.js --lang pt      # same as above
 *   node prerender-top-beaches.js --lang en      # generate 30 EN files in /en/praias/
 *   node prerender-top-beaches.js --dry-run      # preview only, no files written
 *   node prerender-top-beaches.js --lang en --dry-run
 *
 * Depends on:
 *   - data/beaches-master.json (read-only)
 *   - _scripts/templates/beach-static.html (read-only, PT)
 *   - _scripts/templates/beach-static-en.html (read-only, EN)
 *   - writes to: praias/<slug>.html (PT) or en/praias/<slug>.html (EN)
 *
 * Selection algorithm (deterministic):
 *   1. Filter status === 'live'
 *   2. Sort by REGION_ORDER, then name_pt alphabetically
 *   3. Take first 30
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = JSON.parse(readFileSync(join(ROOT, 'data/beaches-master.json'), 'utf8'));

// ── Parse CLI flags ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'pt';
if (!['pt', 'en'].includes(lang)) {
  console.error('[prerender] ERROR: --lang must be pt or en');
  process.exit(1);
}

const TEMPLATE = readFileSync(
  join(__dirname, lang === 'en' ? 'templates/beach-static-en.html' : 'templates/beach-static.html'),
  'utf8'
);
const OUT_DIR = join(ROOT, lang === 'en' ? 'en/praias' : 'praias');

// ── Region priority order (Algarve first for SEO) ─────────────────────────
const REGION_ORDER = [
  'Algarve',
  'Oeste',
  'Lisboa e Setúbal',
  'Norte',
  'Centro',
  'Madeira',
  'Açores',
  'Alentejo'
];

// ── GYG affiliate URLs by region (from js/beach-page.js) ─────────────────
const GYG_URLS = {
  'Algarve':          'https://www.getyourguide.com/s/?q=Algarve&partner_id=0WTBHZE&cmp=pthcard-algarve',
  'Norte':            'https://www.getyourguide.com/s/?q=Porto&partner_id=0WTBHZE&cmp=pthcard-norte',
  'Centro':           'https://www.getyourguide.com/s/?q=Coimbra+Portugal&partner_id=0WTBHZE&cmp=pthcard-centro',
  'Lisboa e Setúbal': 'https://www.getyourguide.com/s/?q=Lisbon&partner_id=0WTBHZE&cmp=pthcard-lisboa',
  'Alentejo':         'https://www.getyourguide.com/s/?q=Alentejo&partner_id=0WTBHZE&cmp=pthcard-alentejo',
  'Madeira':          'https://www.getyourguide.com/s/?q=Madeira&partner_id=0WTBHZE&cmp=pthcard-madeira',
  'Oeste':            'https://www.getyourguide.com/s/?q=Nazare+Portugal&partner_id=0WTBHZE&cmp=pthcard-oeste',
  'Açores':      'https://www.getyourguide.com/s/?q=Azores&partner_id=0WTBHZE&cmp=pthcard-acores'
};

// ── Amazon OneLink block (pthportugal-21) ─────────────────────────────────
const AMAZON_BLOCK = `<!-- Amazon OneLink — geo-redirect para storefront local com pthportugal-21 -->
<script>
  amzn_assoc_tracking_id = "pthportugal-21";
  amzn_assoc_ad_mode = "auto";
  amzn_assoc_ad_type = "smart";
  amzn_assoc_marketplace = "amazon";
  amzn_assoc_region = "ES";
<\/script>
<script src="//z-eu.associates-amazon.com/s/getads.js?Marketplace=ES"><\/script>`;

// ── Beach type PT labels ──────────────────────────────────────────────────
const BEACH_TYPE_PT = {
  'sandy':           'Arenosa',
  'cove':            'Enseada',
  'urban':           'Urbana',
  'wild':            'Selvagem',
  'surf':            'Surf',
  'river-mouth':     'Foz de Rio',
  'natural-reserve': 'Reserva Natural',
  'volcanic':        'Vulcânica'
};

// ── Beach type EN labels ──────────────────────────────────────────────────
const BEACH_TYPE_EN = {
  'sandy':           'Sandy',
  'cove':            'Cove',
  'urban':           'Urban',
  'wild':            'Wild',
  'surf':            'Surf',
  'river-mouth':     'River Mouth',
  'natural-reserve': 'Nature Reserve',
  'volcanic':        'Volcanic'
};

// ── Helpers ───────────────────────────────────────────────────────────────
/**
 * Escape HTML special characters to prevent XSS in static output.
 * Input: data from beaches-master.json (editorial, not user input).
 * Still escaped for correctness and HTML validity.
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Escape a string for safe embedding inside a JSON string value.
 * Used for Schema.org JSON-LD inline blocks.
 */
function escapeJson(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Return EN or PT beach type label.
 */
function beachTypeLabel(type, l) {
  if (l === 'en') return BEACH_TYPE_EN[type] || type;
  return BEACH_TYPE_PT[type] || type;
}

/**
 * Select top 30 beaches: filter live, sort by REGION_ORDER then name_pt.
 */
function selectTop30(beaches) {
  const live = beaches.filter(b => b.status === 'live');
  live.sort((a, b) => {
    const ra = REGION_ORDER.indexOf(a.region);
    const rb = REGION_ORDER.indexOf(b.region);
    if (ra !== rb) return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
    return a.name_pt.localeCompare(b.name_pt, 'pt');
  });
  return live.slice(0, 30);
}

/**
 * Build amenityFeature array JSON (without outer brackets).
 * Returns a comma-separated list of LocationFeatureSpecification objects.
 */
function buildAmenities(beach, l) {
  const amenities = [];
  if (beach.lifeguard) {
    amenities.push({
      '@type': 'LocationFeatureSpecification',
      name: l === 'en' ? 'Lifeguard' : 'Nadador-salvador',
      value: true
    });
  }
  if (beach.family_friendly) {
    amenities.push({
      '@type': 'LocationFeatureSpecification',
      name: l === 'en' ? 'Family friendly' : 'Família',
      value: true
    });
  }
  if (beach.webcam_available) {
    amenities.push({
      '@type': 'LocationFeatureSpecification',
      name: 'Webcam',
      value: true
    });
  }
  if (beach.disabled_access) {
    amenities.push({
      '@type': 'LocationFeatureSpecification',
      name: l === 'en' ? 'Disabled access' : 'Acesso mobilidade reduzida',
      value: true
    });
  }
  // Remove outer [ and ] — template wraps in [{{amenities_json}}]
  const json = JSON.stringify(amenities);
  return json.slice(1, -1);
}

/**
 * Render a beach object into the HTML template for the given language.
 * All replacements are exact string matches (global replace via split/join).
 */
function render(beach, today, l) {
  const subregion = beach.subregion ? ` · ${escapeHtml(beach.subregion)}` : '';
  const gygUrl = GYG_URLS[beach.region] || GYG_URLS['Algarve'];

  let replacements;

  if (l === 'en') {
    // EN: use name_en, description_en, EN labels
    const nameEn = beach.name_en || beach.name_pt;
    const descEn = beach.description_en || beach.description_pt;

    replacements = {
      '{{slug}}':             beach.slug,
      '{{supabase_id}}':      beach.supabase_id,
      '{{name_en}}':          escapeHtml(nameEn),
      '{{name_en_json}}':     escapeJson(nameEn),
      '{{region}}':           escapeHtml(beach.region),
      '{{region_json}}':      escapeJson(beach.region),
      '{{subregion_display}}': subregion,
      '{{beach_type_en}}':    escapeHtml(beachTypeLabel(beach.beach_type, 'en')),
      '{{water_quality}}':    escapeHtml(beach.water_quality),
      '{{description_en}}':   escapeHtml(descEn),
      '{{description_en_json}}': escapeJson(descEn),
      '{{latitude}}':         String(beach.latitude),
      '{{longitude}}':        String(beach.longitude),
      '{{family_friendly_en}}': beach.family_friendly ? 'Yes' : 'No',
      '{{lifeguard_en}}':     beach.lifeguard ? 'Yes' : 'No',
      '{{webcam_available_en}}': beach.webcam_available ? 'Yes' : 'No',
      '{{amenities_json}}':   buildAmenities(beach, 'en'),
      '{{gyg_url}}':          gygUrl,
      '{{amazon_block}}':     AMAZON_BLOCK,
      '{{lastmod}}':          today
    };
  } else {
    // PT: original behavior
    const descJson = escapeJson(beach.description_pt);
    const nameJson = escapeJson(beach.name_pt);
    const regionJson = escapeJson(beach.region);

    replacements = {
      '{{slug}}':           beach.slug,
      '{{supabase_id}}':    beach.supabase_id,
      '{{name_pt}}':        escapeHtml(beach.name_pt),
      '{{name_en}}':        escapeHtml(beach.name_en || ''),
      '{{region}}':         escapeHtml(beach.region),
      '{{subregion_display}}': subregion,
      '{{beach_type_pt}}':  escapeHtml(beachTypeLabel(beach.beach_type, 'pt')),
      '{{water_quality}}':  escapeHtml(beach.water_quality),
      '{{description_pt}}': escapeHtml(beach.description_pt),
      '{{latitude}}':       String(beach.latitude),
      '{{longitude}}':      String(beach.longitude),
      '{{family_friendly}}': beach.family_friendly ? 'Sim' : 'Não',
      '{{lifeguard}}':      beach.lifeguard ? 'Sim' : 'Não',
      '{{webcam_available}}': beach.webcam_available ? 'Sim' : 'Não',
      '{{amenities_json}}': buildAmenities(beach, 'pt'),
      '{{gyg_url}}':        gygUrl,
      '{{amazon_block}}':   AMAZON_BLOCK,
      '{{lastmod}}':        today
    };
  }

  let html = TEMPLATE;
  for (const [key, value] of Object.entries(replacements)) {
    // global replace via split/join (avoids regex escaping issues with special chars in values)
    html = html.split(key).join(value);
  }
  return html;
}

// ── Main CLI ──────────────────────────────────────────────────────────────
const isDryRun = args.includes('--dry-run');
const today = new Date().toISOString().slice(0, 10);
const outDirLabel = lang === 'en' ? 'en/praias/' : 'praias/';

if (!DATA.beaches || !Array.isArray(DATA.beaches)) {
  console.error('[prerender] ERROR: data/beaches-master.json has no .beaches array');
  process.exit(1);
}

const top30 = selectTop30(DATA.beaches);
const regions = [...new Set(top30.map(b => b.region))];

console.log(`[prerender] Selected ${top30.length} beaches (lang: ${lang})`);
console.log(`[prerender] Regions (${regions.length}): ${regions.join(', ')}`);
console.log(`[prerender] Date: ${today}`);
console.log(`[prerender] Output: ${outDirLabel}`);
if (isDryRun) console.log('[prerender] DRY-RUN mode — no files written');
console.log('');

if (!isDryRun && !existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`[prerender] Created directory: ${outDirLabel}`);
}

let generated = 0;
for (const beach of top30) {
  const html = render(beach, today, lang);
  const outPath = join(OUT_DIR, `${beach.slug}.html`);

  // Sanity: confirm no unresolved placeholders remain
  const remaining = html.match(/\{\{[^}]+\}\}/g);
  if (remaining) {
    console.error(`[prerender] ERROR: unresolved placeholders in ${beach.slug}: ${remaining.join(', ')}`);
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`[dry-run] Would write: ${outDirLabel}${beach.slug}.html (${html.length} bytes) — ${beach.region}`);
  } else {
    writeFileSync(outPath, html, 'utf8');
    console.log(`[write] ${outDirLabel}${beach.slug}.html (${html.length} bytes) — ${beach.region}`);
  }
  generated++;
}

console.log('');
console.log(`[done] ${isDryRun ? 'Dry-run preview' : 'Generated'} ${generated} ${lang.toUpperCase()} static beach pages in ${outDirLabel}`);

// ── Print sitemap snippet for copy-paste ─────────────────────────────────
if (lang === 'en') {
  console.log('\n--- EN Sitemap snippet (add before </urlset> in sitemap.xml) ---');
  for (const beach of top30) {
    process.stdout.write(
      `  <url>\n    <loc>https://www.portalturismoportugal.com/en/praias/${beach.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
    );
  }
  console.log('--- End sitemap snippet ---');
} else {
  console.log('\n--- PT Sitemap snippet (add before </urlset> in sitemap.xml) ---');
  for (const beach of top30) {
    process.stdout.write(
      `  <url>\n    <loc>https://www.portalturismoportugal.com/praias/${beach.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
    );
  }
  console.log('--- End sitemap snippet ---');
}

// ── Print slug list for review ───────────────────────────────────────────
console.log('\n--- Slug list ---');
top30.forEach((b, i) => {
  console.log(`  ${String(i + 1).padStart(2, '0')}. ${b.slug.padEnd(40)} [${b.region}]`);
});
console.log('--- End slug list ---');

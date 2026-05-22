#!/usr/bin/env node
// Inject nav dropdown into HTML files (PT+EN+guias).
// Idempotent (inject mode): skips files that already have data-nav-dropdown.
// Update mode (--update): replaces old dropdown variants with new .pth-dd__* structure.
// Usage: node _scripts/inject-nav-dropdown.mjs [--dry-run] [--update]

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const DRY_RUN = process.argv.includes('--dry-run');
const UPDATE  = process.argv.includes('--update');
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

// ── Dropdown HTML templates — PTH-DD (validated 2026-05-22) ──────────────────

const PT_DROPDOWN = `    <div class="pth-dd" data-pth-dd data-nav-dropdown>
      <button type="button" class="pth-dd__trigger"
              aria-haspopup="menu" aria-expanded="false"
              aria-controls="pth-dd-menu">
        Parceiros Verificados <span class="pth-dd__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <div id="pth-dd-menu" class="pth-dd__menu" role="menu">
        <a href="/escolas-de-surf.html" class="pth-dd__featured" role="menuitem">
          <div class="pth-dd__featured-eyebrow">Verificado</div>
          <div class="pth-dd__featured-title">Escolas de Surf</div>
          <span class="pth-dd__featured-link">Ver todas &rarr;</span>
        </a>
        <div class="pth-dd__coming">
          <div class="pth-dd__coming-eyebrow">Em desenvolvimento</div>
          <ul class="pth-dd__coming-list">
            <li class="pth-dd__coming-item" title="Em breve">Pesca (Charters)</li>
            <li class="pth-dd__coming-item" title="Em breve">Restaurantes</li>
            <li class="pth-dd__coming-item" title="Em breve">Alojamento Local</li>
            <li class="pth-dd__coming-item" title="Em breve">Hot&eacute;is &amp; Pousadas</li>
            <li class="pth-dd__coming-item" title="Em breve">Turismo Rural</li>
            <li class="pth-dd__coming-item" title="Em breve">Experi&ecirc;ncias</li>
          </ul>
        </div>
      </div>
    </div>
`;

const EN_DROPDOWN = `    <div class="pth-dd" data-pth-dd data-nav-dropdown>
      <button type="button" class="pth-dd__trigger"
              aria-haspopup="menu" aria-expanded="false"
              aria-controls="pth-dd-menu">
        Verified Partners <span class="pth-dd__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <div id="pth-dd-menu" class="pth-dd__menu" role="menu">
        <a href="/en/surf-schools.html" class="pth-dd__featured" role="menuitem">
          <div class="pth-dd__featured-eyebrow">Verified</div>
          <div class="pth-dd__featured-title">Surf Schools</div>
          <span class="pth-dd__featured-link">View all &rarr;</span>
        </a>
        <div class="pth-dd__coming">
          <div class="pth-dd__coming-eyebrow">Coming next</div>
          <ul class="pth-dd__coming-list">
            <li class="pth-dd__coming-item" title="Coming soon">Fishing (Charters)</li>
            <li class="pth-dd__coming-item" title="Coming soon">Restaurants</li>
            <li class="pth-dd__coming-item" title="Coming soon">Local Accommodation</li>
            <li class="pth-dd__coming-item" title="Coming soon">Hotels &amp; Pousadas</li>
            <li class="pth-dd__coming-item" title="Coming soon">Rural Tourism</li>
            <li class="pth-dd__coming-item" title="Coming soon">Experiences</li>
          </ul>
        </div>
      </div>
    </div>
`;

// ── Anchor patterns (inject mode) ─────────────────────────────────────────────

const PT_ANCHOR_REL = '    <a href="parceiros.html" role="listitem">Parceiros</a>';
const PT_ANCHOR_ABS = '    <a href="/parceiros.html" role="listitem">Parceiros</a>';
const EN_ANCHOR     = '    <a href="/en/parceiros.html" role="listitem">Partners</a>';

const SCRIPT_TAG = '    <script src="/js/nav-dropdown.js" defer></script>';

// Old dropdown pattern (matches BOTH old variants for idempotent replace):
//   - nav-dropdown (Variante C magazine, .nav-dropdown__featured present)
//   - nav-dropdown (v1, .nav-dropdown__item--disabled)
//   - pth-dd (current validated variant — for idempotent re-runs)
// Two successive replacements handle both old class prefixes cleanly.
const OLD_DROPDOWN_RE_NAV = /    <div class="nav-dropdown[^"]*" data-nav-dropdown[^>]*>[\s\S]*?    <\/div>\n/;
const OLD_DROPDOWN_RE_PTH = /    <div class="pth-dd[^"]*" data-(?:pth-dd|nav-dropdown)[^>]*>[\s\S]*?    <\/div>\n/;

// ── File collection ────────────────────────────────────────────────────────────

function htmlInDir(dirRelative) {
  try {
    return readdirSync(resolve(ROOT, dirRelative))
      .filter(f => f.endsWith('.html'))
      .map(f => join(dirRelative, f).replace(/\\/g, '/'));
  } catch {
    return [];
  }
}

function getFiles() {
  const pt    = htmlInDir('.');
  const en    = htmlInDir('en');
  const guias = htmlInDir('guias');
  return { pt, en, guias };
}

// ── Process single file ────────────────────────────────────────────────────────

function processFile(relPath, lang) {
  const absPath = resolve(ROOT, relPath);
  const original = readFileSync(absPath, 'utf8');
  const newTemplate = (lang === 'en') ? EN_DROPDOWN : PT_DROPDOWN;

  // ── UPDATE MODE ───────────────────────────────────────────────────────────
  if (UPDATE) {
    // Already on new pth-dd__featured variant — skip (idempotent)
    if (original.includes('pth-dd__featured')) {
      return { status: 'skip', reason: 'already pth-dd__featured' };
    }
    // Has old Variante C magazine OR old v1 nav-dropdown structure
    if (original.includes('nav-dropdown__featured') || original.includes('nav-dropdown__item--disabled')) {
      if (!OLD_DROPDOWN_RE_NAV.test(original)) {
        return { status: 'warn', reason: 'old nav-dropdown pattern did not match regex' };
      }
      const updated = original.replace(OLD_DROPDOWN_RE_NAV, newTemplate);
      if (!DRY_RUN) writeFileSync(absPath, updated, 'utf8');
      return { status: 'updated', variant: 'nav-dropdown' };
    }
    // Has generic nav-dropdown (no __featured / no __item--disabled)
    if (original.includes('data-nav-dropdown') || original.includes('nav-dropdown')) {
      if (OLD_DROPDOWN_RE_NAV.test(original)) {
        const updated = original.replace(OLD_DROPDOWN_RE_NAV, newTemplate);
        if (!DRY_RUN) writeFileSync(absPath, updated, 'utf8');
        return { status: 'updated', variant: 'nav-dropdown-generic' };
      }
      return { status: 'warn', reason: 'has nav-dropdown but no regex match' };
    }
    return { status: 'skip', reason: 'no dropdown to update' };
  }

  // ── INJECT MODE (original behaviour) ─────────────────────────────────────
  if (original.includes('data-nav-dropdown') || original.includes('data-pth-dd')) {
    return { status: 'skip', reason: 'already has dropdown marker' };
  }

  let content = original;
  let injectedDropdown = false;
  let noAnchor = false;

  if (lang === 'pt') {
    if (content.includes(PT_ANCHOR_REL)) {
      content = content.replace(PT_ANCHOR_REL, PT_DROPDOWN + PT_ANCHOR_REL);
      injectedDropdown = true;
    } else if (content.includes(PT_ANCHOR_ABS)) {
      content = content.replace(PT_ANCHOR_ABS, PT_DROPDOWN + PT_ANCHOR_ABS);
      injectedDropdown = true;
    } else {
      noAnchor = true;
    }
  } else {
    if (content.includes(EN_ANCHOR)) {
      content = content.replace(EN_ANCHOR, EN_DROPDOWN + EN_ANCHOR);
      injectedDropdown = true;
    } else {
      noAnchor = true;
    }
  }

  if (noAnchor) return { status: 'warn', reason: 'anchor not found' };

  if (!content.includes('/js/nav-dropdown.js')) {
    content = content.replace('</body>', SCRIPT_TAG + '\n</body>');
  }

  if (!DRY_RUN) writeFileSync(absPath, content, 'utf8');
  return { status: 'injected', dropdown: injectedDropdown };
}

// ── Main ───────────────────────────────────────────────────────────────────────

const { pt, en, guias } = getFiles();
const allFiles = [
  ...pt.map(f => ({ path: f, lang: 'pt' })),
  ...en.map(f => ({ path: f, lang: 'en' })),
  ...guias.map(f => ({ path: f, lang: 'pt' })),
];

const mode = UPDATE ? 'UPDATE' : 'INJECT';
console.log(`\n${DRY_RUN ? '[DRY-RUN] ' : ''}[${mode}] Processing ${allFiles.length} files...\n`);

const results = { skip: [], injected: [], updated: [], warn: [] };

for (const { path: f, lang } of allFiles) {
  const r = processFile(f, lang);
  const bucket = r.status === 'updated' ? 'updated' : r.status;
  (results[bucket] = results[bucket] || []).push({ file: f, ...r });
  const icon = r.status === 'skip' ? '-' : r.status === 'warn' ? '!' : '+';
  if (r.status !== 'injected' && r.status !== 'updated' || DRY_RUN) {
    console.log(`  ${icon}  ${f}  [${r.status}]${r.reason ? ': ' + r.reason : ''}`);
  } else {
    process.stdout.write('.');
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`Total files:      ${allFiles.length}`);
console.log(`  PT root:        ${pt.length}`);
console.log(`  EN direct:      ${en.length}`);
console.log(`  guias/:         ${guias.length}`);
console.log(`Skipped (already pth-dd):  ${(results.skip || []).length}`);
if (UPDATE) {
  console.log(`Updated (was nav-dropdown): ${(results.updated || []).length}`);
} else {
  console.log(`Injected (was missing):    ${(results.injected || []).length}`);
}
console.log(`Warnings:                  ${(results.warn || []).length}`);

if ((results.warn || []).length > 0) {
  console.log('\n! Files with warnings:');
  results.warn.forEach(r => console.log(`    ${r.file}: ${r.reason}`));
}

if (DRY_RUN) {
  console.log('\n[DRY-RUN] No files written. Run without --dry-run to apply.');
}

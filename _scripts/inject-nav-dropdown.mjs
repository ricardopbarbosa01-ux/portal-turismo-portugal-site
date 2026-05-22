#!/usr/bin/env node
// Inject nav dropdown into 116 HTML files (PT+EN+guias).
// Idempotent (inject mode): skips files that already have data-nav-dropdown.
// Update mode (--update): replaces old dropdown with Variante C Magazine structure.
// Usage: node _scripts/inject-nav-dropdown.mjs [--dry-run] [--update]

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const DRY_RUN = process.argv.includes('--dry-run');
const UPDATE  = process.argv.includes('--update');
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

// ── Dropdown HTML templates — Variante C Magazine ─────────────────────────────

const PT_DROPDOWN = `    <div class="nav-dropdown" data-nav-dropdown>
      <button type="button" class="nav-link nav-dropdown__trigger"
              aria-haspopup="menu" aria-expanded="false" aria-controls="nav-verificados-menu">
        Parceiros Verificados <span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <div id="nav-verificados-menu" class="nav-dropdown__menu" role="menu">
        <a href="/escolas-de-surf.html" class="nav-dropdown__featured" role="menuitem">
          <div class="nav-dropdown__featured-eyebrow">Verificado</div>
          <div class="nav-dropdown__featured-title">Escolas de Surf</div>
          <span class="nav-dropdown__featured-link">Ver todas &rarr;</span>
        </a>
        <div class="nav-dropdown__coming">
          <div class="nav-dropdown__coming-eyebrow">Em desenvolvimento</div>
          <ul class="nav-dropdown__coming-list">
            <li class="nav-dropdown__coming-item" title="Em breve">Pesca (Charters)</li>
            <li class="nav-dropdown__coming-item" title="Em breve">Restaurantes</li>
            <li class="nav-dropdown__coming-item" title="Em breve">Alojamento Local</li>
            <li class="nav-dropdown__coming-item" title="Em breve">Hot&eacute;is &amp; Pousadas</li>
            <li class="nav-dropdown__coming-item" title="Em breve">Turismo Rural</li>
            <li class="nav-dropdown__coming-item" title="Em breve">Experi&ecirc;ncias</li>
          </ul>
        </div>
      </div>
    </div>
`;

const EN_DROPDOWN = `    <div class="nav-dropdown" data-nav-dropdown>
      <button type="button" class="nav-link nav-dropdown__trigger"
              aria-haspopup="menu" aria-expanded="false" aria-controls="nav-verificados-menu">
        Verified Partners <span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <div id="nav-verificados-menu" class="nav-dropdown__menu" role="menu">
        <a href="/en/surf-schools.html" class="nav-dropdown__featured" role="menuitem">
          <div class="nav-dropdown__featured-eyebrow">Verified</div>
          <div class="nav-dropdown__featured-title">Surf Schools</div>
          <span class="nav-dropdown__featured-link">View all &rarr;</span>
        </a>
        <div class="nav-dropdown__coming">
          <div class="nav-dropdown__coming-eyebrow">Coming next</div>
          <ul class="nav-dropdown__coming-list">
            <li class="nav-dropdown__coming-item" title="Coming soon">Fishing (Charters)</li>
            <li class="nav-dropdown__coming-item" title="Coming soon">Restaurants</li>
            <li class="nav-dropdown__coming-item" title="Coming soon">Local Accommodation</li>
            <li class="nav-dropdown__coming-item" title="Coming soon">Hotels &amp; Pousadas</li>
            <li class="nav-dropdown__coming-item" title="Coming soon">Rural Tourism</li>
            <li class="nav-dropdown__coming-item" title="Coming soon">Experiences</li>
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

// Old dropdown pattern (v1/v2) — uses <ul> + nav-dropdown__item--disabled
// The outer div has no nested </div> before its closing tag, so the non-greedy
// match safely stops at the first 4-space-indented </div>.
const OLD_DROPDOWN_RE = /    <div class="nav-dropdown" data-nav-dropdown>[\s\S]*?    <\/div>\n/;

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
    // Already Variante C — skip
    if (original.includes('nav-dropdown__featured')) {
      return { status: 'skip', reason: 'already Variante C' };
    }
    // Has old structure
    if (original.includes('nav-dropdown__item--disabled')) {
      if (!OLD_DROPDOWN_RE.test(original)) {
        return { status: 'warn', reason: 'old dropdown pattern did not match' };
      }
      const updated = original.replace(OLD_DROPDOWN_RE, newTemplate);
      if (!DRY_RUN) writeFileSync(absPath, updated, 'utf8');
      return { status: 'updated' };
    }
    // Has data-nav-dropdown but no --disabled (unexpected state)
    if (original.includes('data-nav-dropdown')) {
      return { status: 'warn', reason: 'has data-nav-dropdown but no old/new structure detected' };
    }
    return { status: 'skip', reason: 'no dropdown to update' };
  }

  // ── INJECT MODE (original behaviour) ─────────────────────────────────────
  if (original.includes('data-nav-dropdown')) {
    return { status: 'skip', reason: 'already has data-nav-dropdown' };
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
  const icon = r.status === 'skip' ? '⏭' : r.status === 'warn' ? '⚠️' : '✓';
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
console.log(`Skipped:          ${(results.skip || []).length}`);
if (UPDATE) {
  console.log(`Updated (V-C):    ${(results.updated || []).length}`);
} else {
  console.log(`Injected:         ${(results.injected || []).length}`);
}
console.log(`Warnings:         ${(results.warn || []).length}`);

if ((results.warn || []).length > 0) {
  console.log('\n⚠️  Files with warnings:');
  results.warn.forEach(r => console.log(`    ${r.file}: ${r.reason}`));
}

if (DRY_RUN) {
  console.log('\n[DRY-RUN] No files written. Run without --dry-run to apply.');
}

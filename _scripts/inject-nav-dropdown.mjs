#!/usr/bin/env node
// Inject nav dropdown into 116 HTML files (PT+EN+guias).
// Idempotent: skips files that already have data-nav-dropdown.
// Usage: node _scripts/inject-nav-dropdown.mjs [--dry-run]

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

// ── Dropdown HTML templates ────────────────────────────────────────────────────

const PT_DROPDOWN = `    <div class="nav-dropdown" data-nav-dropdown>
      <button
        type="button"
        class="nav-link nav-dropdown__trigger"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="nav-verificados-menu">
        Parceiros Verificados <span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <ul id="nav-verificados-menu" class="nav-dropdown__menu" role="menu">
        <li role="none"><a role="menuitem" href="/escolas-de-surf.html">Escolas de Surf</a></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Pesca (Charters &amp; Guias) <small>Em breve</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Restaurantes <small>Em breve</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Alojamento Local <small>Em breve</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Hot&eacute;is &amp; Pousadas <small>Em breve</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Turismo Rural (Quintas) <small>Em breve</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Em breve">Experi&ecirc;ncias (Tours &amp; Atividades) <small>Em breve</small></span></li>
      </ul>
    </div>
`;

const EN_DROPDOWN = `    <div class="nav-dropdown" data-nav-dropdown>
      <button
        type="button"
        class="nav-link nav-dropdown__trigger"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="nav-verificados-menu">
        Verified Partners <span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>
      </button>
      <ul id="nav-verificados-menu" class="nav-dropdown__menu" role="menu">
        <li role="none"><a role="menuitem" href="/en/surf-schools.html">Surf Schools</a></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Fishing (Charters &amp; Guides) <small>Coming soon</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Restaurants <small>Coming soon</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Local Accommodation <small>Coming soon</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Hotels &amp; Pousadas <small>Coming soon</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Rural Tourism (Quintas) <small>Coming soon</small></span></li>
        <li role="none"><span class="nav-dropdown__item--disabled" role="menuitem" aria-disabled="true" title="Coming soon">Experiences (Tours &amp; Activities) <small>Coming soon</small></span></li>
      </ul>
    </div>
`;

// ── Anchor patterns ────────────────────────────────────────────────────────────

const PT_ANCHOR_REL = '    <a href="parceiros.html" role="listitem">Parceiros</a>';
const PT_ANCHOR_ABS = '    <a href="/parceiros.html" role="listitem">Parceiros</a>';
const EN_ANCHOR     = '    <a href="/en/parceiros.html" role="listitem">Partners</a>';

const SCRIPT_TAG = '    <script src="/js/nav-dropdown.js" defer></script>';

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

  // Idempotence: already has dropdown
  if (original.includes('data-nav-dropdown')) {
    return { status: 'skip', reason: 'already has data-nav-dropdown' };
  }

  let content = original;
  let injectedDropdown = false;
  let injectedScript = false;
  let noAnchor = false;

  // Inject dropdown
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

  if (noAnchor) {
    return { status: 'warn', reason: 'anchor not found' };
  }

  // Inject script before </body> (idempotent)
  if (!content.includes('/js/nav-dropdown.js')) {
    content = content.replace('</body>', SCRIPT_TAG + '\n</body>');
    injectedScript = true;
  }

  if (!DRY_RUN) {
    writeFileSync(absPath, content, 'utf8');
  }

  return { status: 'injected', dropdown: injectedDropdown, script: injectedScript };
}

// ── Main ───────────────────────────────────────────────────────────────────────

const { pt, en, guias } = getFiles();
const allFiles = [
  ...pt.map(f => ({ path: f, lang: 'pt' })),
  ...en.map(f => ({ path: f, lang: 'en' })),
  ...guias.map(f => ({ path: f, lang: 'pt' })),
];

console.log(`\n${DRY_RUN ? '[DRY-RUN] ' : ''}Processing ${allFiles.length} files...\n`);

const results = { skip: [], injected: [], warn: [] };

for (const { path: f, lang } of allFiles) {
  const r = processFile(f, lang);
  results[r.status].push({ file: f, ...r });
  const icon = r.status === 'skip' ? '⏭' : r.status === 'warn' ? '⚠️' : '✓';
  if (r.status !== 'injected' || DRY_RUN) {
    console.log(`  ${icon}  ${f}  [${r.status}]${r.reason ? ': ' + r.reason : ''}`);
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`Total files:          ${allFiles.length}`);
console.log(`  PT root:            ${pt.length}`);
console.log(`  EN direct:          ${en.length}`);
console.log(`  guias/:             ${guias.length}`);
console.log(`Already has dropdown: ${results.skip.length} (SKIP)`);
console.log(`Injected:             ${results.injected.length}`);
console.log(`No anchor (WARN):     ${results.warn.length}`);

if (results.warn.length > 0) {
  console.log('\n⚠️  Files with no anchor (not touched):');
  results.warn.forEach(r => console.log(`    ${r.file}`));
}

if (DRY_RUN && results.injected.length > 0) {
  console.log('\n[DRY-RUN] No files written. Run without --dry-run to apply.');
}

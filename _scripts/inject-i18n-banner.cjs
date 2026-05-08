/**
 * inject-i18n-banner.cjs
 * Injects the i18n notice banner into EN content pages before their <main element.
 * Idempotent: skips files that already contain 'i18n-notice'.
 * Skips: login.html and media-kit-print.html (non-content pages).
 *
 * Usage: node _scripts/inject-i18n-banner.cjs
 */

'use strict';

const fs = require('fs');
const path = require('path');

const EN_DIR = path.join(__dirname, '..', 'en');
const SKIP_FILES = new Set(['login.html', 'media-kit-print.html']);

const BANNER_BLOCK = `<div class="i18n-notice" id="i18n-notice" role="status">
  <span>🇬🇧 <strong>English version</strong> — some beach details may appear in Portuguese while we complete translations.</span>
  <button class="i18n-notice-close" onclick="this.parentElement.remove();try{localStorage.setItem('i18n-notice-ok','1')}catch(e){}" aria-label="Dismiss">✕</button>
</div>
<script>try{if(localStorage.getItem('i18n-notice-ok'))document.getElementById('i18n-notice').style.display='none'}catch(e){}</script>`;

const files = fs.readdirSync(EN_DIR).filter(f => f.endsWith('.html'));

let modified = 0;
let skippedAlreadyHas = 0;
let skippedExcluded = 0;

for (const file of files) {
  if (SKIP_FILES.has(file)) {
    console.log(`  EXCLUDED: ${file}`);
    skippedExcluded++;
    continue;
  }

  const filePath = path.join(EN_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Idempotency check
  if (content.includes('i18n-notice')) {
    console.log(`  SKIPPED (already has banner): ${file}`);
    skippedAlreadyHas++;
    continue;
  }

  // Find <main and insert banner before it
  // Matches <main> <main  <main\t <main\n
  if (!/<main[\s>]/.test(content)) {
    console.log(`  WARNING: no <main found in ${file} — skipping`);
    skippedExcluded++;
    continue;
  }

  const newContent = content.replace(/(<main[\s>])/, BANNER_BLOCK + '\n$1');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  MODIFIED: ${file}`);
  modified++;
}

console.log('');
console.log(`Summary:`);
console.log(`  Modified:         ${modified}`);
console.log(`  Already had banner: ${skippedAlreadyHas}`);
console.log(`  Excluded:         ${skippedExcluded}`);
console.log(`  Total files:      ${files.length}`);

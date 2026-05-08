#!/usr/bin/env node
/**
 * Auto-tag beaches with activity categories based on description keywords.
 *
 * Categories: family, surf, fishing, wild_nature
 * Mode: --dry-run (default, generates HTML report) or --apply (writes to DB)
 *
 * Usage:
 *   node auto-tag-beaches.js              # dry run, generates report
 *   node auto-tag-beaches.js --apply      # apply tags (uses corrections file if present)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const APPLY = process.argv.includes('--apply');
const REPORT_PATH = resolve(__dirname, 'auto-tag-report.html');
const CORRECTIONS_PATH = resolve(__dirname, 'auto-tag-corrections.json');

// =============================================
// TAGGING RULES
// =============================================

const RULES = {
  family: {
    label: 'Famílias',
    positive: [
      /\bfam[ií]l[iy]a/i,
      /\bcrian[çc]a/i,
      /\babrigada/i,
      /\b[áa]guas?\s+calmas?\b/i,
      /\b[áa]guas?\s+rasas?\b/i,
      /\blaguna\b/i,
      /\bpiscinas?\s+naturais\b/i,
      /\bsem\s+ondas\b/i,
      /\bondas?\s+suaves?\b/i,
      /\btranquila\b/i,
      /\bprotegida\b/i,
    ],
    negative: [
      /fal[ée]sia[s]?\s+perigosa[s]?/i,
      /correntes?\s+perigosas?/i,
      /n[ãa]o\s+recomendada\s+para\s+crian[çc]as/i,
    ],
  },
  surf: {
    label: 'Surf',
    positive: [
      /\bsurf\b(?!\s*shop)/i,
      /\bonda[s]?\s+consistentes?\b/i,
      /\bbodyboard\b/i,
      /\bwindsurf\b/i,
      /\bkitesurf\b/i,
      /\bspot\s+de\s+surf\b/i,
      /\bondula[çc][ãa]o\b/i,
      /\bswells?\b/i,
    ],
    negative: [
      /loja\s+de\s+surf/i,
      /aulas?\s+de\s+surf\s+perto/i,
    ],
  },
  fishing: {
    label: 'Pesca',
    positive: [
      /\bpesca\s+(?:desportiva|recreativa|à\s+linha|de\s+cana)\b/i,
      /\bpescadores?\s+(?:locais|frequentam|costumam)\b/i,
      /\bzona\s+de\s+pesca\b/i,
      /\bpesca\s+à\s+linha\b/i,
      /\bpesca\s+desde\b/i,
      /\bpesca\s+(?:é|e)\s+(?:praticada|comum|frequente)\b/i,
      /\bpracticam\s+pesca\b/i,
      /\bhabitual(?:mente)?\s+para\s+pesca\b/i,
    ],
    negative: [
      /\baldeia\s+de\s+pescadores\b/i,
      /\bantigos?\s+pescadores?\b/i,
      /\btradi[çc][ãa]o\s+piscat[óo]ria\b/i,
    ],
  },
  wild_nature: {
    label: 'Natureza selvagem',
    positive: [
      /\breserva\s+(?:natural|biol[óo]gica)\b/i,
      /\bparque\s+natural\b/i,
      /\bselvagem\b/i,
      /\bisolada\b/i,
      /\bvirgem\b/i,
      /\binacess[íi]vel\b/i,
      /\bdeserta\b/i,
      /\bsem\s+infraestrutura\b/i,
      /\bfal[ée]sias?\s+imponentes?\b/i,
      /\bdunas?\s+protegidas?\b/i,
    ],
    negative: [
      /pr[óo]xima\s+da\s+cidade/i,
      /muito\s+frequentada/i,
      /\blotada\b/i,
    ],
  },
};

const TAG_KEYS = Object.keys(RULES);

// =============================================
// MATCHING LOGIC
// =============================================

function matchTags(description) {
  if (!description || typeof description !== 'string') return { matched: [], matchDetails: {} };

  const matched = [];
  const matchDetails = {};

  for (const [key, rule] of Object.entries(RULES)) {
    const positiveMatches = rule.positive.filter(rx => rx.test(description));
    const negativeMatches = rule.negative.filter(rx => rx.test(description));

    if (positiveMatches.length > 0 && negativeMatches.length === 0) {
      matched.push(key);
      matchDetails[key] = {
        matched: true,
        positive: positiveMatches.map(rx => rx.source),
        negative: [],
      };
    } else if (positiveMatches.length > 0 && negativeMatches.length > 0) {
      matchDetails[key] = {
        matched: false,
        positive: positiveMatches.map(rx => rx.source),
        negative: negativeMatches.map(rx => rx.source),
        reason: 'positive matched but negative override applied',
      };
    }
  }

  return { matched, matchDetails };
}

// =============================================
// FETCH BEACHES
// =============================================

async function fetchBeaches() {
  const { data, error } = await supabase
    .from('beaches')
    .select('id, name, region, description, tags')
    .eq('is_active', true)
    .neq('region', 'Hero')
    .order('region')
    .order('name');

  if (error) {
    console.error('Error fetching beaches:', error);
    process.exit(1);
  }

  console.log(`Fetched ${data.length} active beaches (excluding Hero placeholders)`);
  return data;
}

// =============================================
// LOAD CORRECTIONS
// =============================================

function loadCorrections() {
  if (!existsSync(CORRECTIONS_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CORRECTIONS_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to parse corrections file:', e.message);
    return null;
  }
}

// =============================================
// HTML REPORT GENERATION
// =============================================

function generateHTMLReport(results) {
  const totalBeaches = results.length;
  const stats = {
    family: results.filter(r => r.proposedTags.includes('family')).length,
    surf: results.filter(r => r.proposedTags.includes('surf')).length,
    fishing: results.filter(r => r.proposedTags.includes('fishing')).length,
    wild_nature: results.filter(r => r.proposedTags.includes('wild_nature')).length,
    untagged: results.filter(r => r.proposedTags.length === 0).length,
  };

  const tagBadge = (key, active) => {
    const labels = { family: 'Famílias', surf: 'Surf', fishing: 'Pesca', wild_nature: 'Nat. selvagem' };
    const colors = { family: '#E07A26', surf: '#0B1B2B', fishing: '#6B7A3F', wild_nature: '#C9A24B' };
    const bg = active ? colors[key] : '#e5e5e5';
    const text = active ? '#fff' : '#999';
    return `<span class="badge" data-key="${key}" data-active="${active}" style="background:${bg};color:${text};">${labels[key]}</span>`;
  };

  const rows = results.map(r => {
    const hasConflict = Object.values(r.matchDetails || {}).some(v => !v.matched && v.reason);
    const conflictNotes = Object.entries(r.matchDetails || {})
      .filter(([, v]) => !v.matched && v.reason)
      .map(([k, v]) => `<small style="color:#999;">⚠️ ${k}: ${v.reason}</small>`)
      .join('<br>');

    const desc = (r.description || '').substring(0, 220);
    const descTrunc = r.description && r.description.length > 220 ? desc + '…' : desc;

    return `<tr data-beach-id="${r.id}" data-has-conflict="${hasConflict}" class="${r.proposedTags.length === 0 ? 'untagged' : ''}">
      <td><span class="region">${r.region || '—'}</span></td>
      <td><span class="beach-name">${r.name}</span></td>
      <td><span class="description">${descTrunc}</span></td>
      <td>${TAG_KEYS.map(key => tagBadge(key, r.proposedTags.includes(key))).join('')}</td>
      <td>${r.notes || ''}${conflictNotes}</td>
    </tr>`;
  }).join('\n');

  const initialMap = JSON.stringify(
    results.reduce((acc, r) => { acc[r.id] = r.proposedTags; return acc; }, {})
  );

  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<title>Auto-tag Report — Portugal Travel Hub</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1400px; margin: 0 auto; padding: 24px; color: #0B1B2B; background: #F2E8D5; }
  h1 { font-weight: 800; font-size: 28px; margin-bottom: 4px; }
  .meta { color: #6B7A3F; font-size: 13px; margin-bottom: 24px; }
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat { background: #fff; padding: 16px; border-radius: 4px 14px 4px 14px; text-align: center; }
  .stat .num { font-weight: 800; font-size: 32px; }
  .stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7A3F; margin-top: 4px; }
  .controls { background: #0B1B2B; color: #F2E8D5; padding: 16px 20px; border-radius: 4px 14px 4px 14px; margin-bottom: 20px; font-size: 13px; line-height: 1.7; }
  .controls h2 { margin: 0 0 6px; font-size: 15px; }
  .filter-bar { background: #fff; padding: 12px 16px; border-radius: 4px 14px 4px 14px; margin-bottom: 16px; display: flex; gap: 24px; font-size: 13px; align-items: center; }
  .filter-bar label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 4px 14px 4px 14px; overflow: hidden; }
  th { background: #0B1B2B; color: #F2E8D5; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 10px 8px; border-bottom: 1px solid #f0ebe0; vertical-align: top; font-size: 12px; }
  tr.untagged td:first-child { border-left: 3px solid #e55; }
  tr:hover { background: #faf6ed; }
  .beach-name { font-weight: 600; font-size: 13px; }
  .region { color: #6B7A3F; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  .description { color: #555; line-height: 1.5; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 500; margin: 2px 2px 2px 0; cursor: pointer; user-select: none; transition: transform 0.1s, opacity 0.1s; }
  .badge:hover { transform: translateY(-1px); opacity: 0.88; }
  h2.section { margin-top: 32px; font-size: 16px; }
  textarea#corrections { width: 100%; height: 180px; font-family: monospace; font-size: 12px; margin-top: 8px; padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; }
  .copy-btn { margin-top: 8px; padding: 8px 18px; background: #0B1B2B; color: #F2E8D5; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .copy-btn:active { opacity: 0.8; }
</style>
</head>
<body>
<h1>Auto-tag Report — Portugal Travel Hub</h1>
<p class="meta">Generated ${new Date().toISOString()} · ${totalBeaches} praias activas</p>

<div class="stats">
  <div class="stat"><div class="num">${stats.family}</div><div class="lbl">Famílias</div></div>
  <div class="stat"><div class="num">${stats.surf}</div><div class="lbl">Surf</div></div>
  <div class="stat"><div class="num">${stats.fishing}</div><div class="lbl">Pesca</div></div>
  <div class="stat"><div class="num">${stats.wild_nature}</div><div class="lbl">Nat. selvagem</div></div>
  <div class="stat"><div class="num" style="color:#c55;">${stats.untagged}</div><div class="lbl">Sem tags</div></div>
</div>

<div class="controls">
  <h2>Como rever este report</h2>
  1. Verifica cada praia — os badges coloridos são as tags propostas.<br>
  2. Clica num badge para <strong>activar</strong> (colorido) ou <strong>desactivar</strong> (cinzento) uma tag.<br>
  3. O JSON de correcções (em baixo) actualiza automaticamente.<br>
  4. Quando terminares: copia o JSON → guarda em <code>_scripts/auto-tag-corrections.json</code> → diz "aplica tags".<br>
  5. Praias com borda vermelha = sem nenhuma tag proposta — revê-as primeiro.
</div>

<div class="filter-bar">
  <label><input type="checkbox" id="filter-untagged"> Mostrar só sem tags (${stats.untagged})</label>
  <label><input type="checkbox" id="filter-conflicts"> Mostrar só com conflitos</label>
  <span id="count-display" style="margin-left:auto;color:#6B7A3F;font-size:12px;">A mostrar ${totalBeaches} praias</span>
</div>

<table id="beaches-table">
  <thead>
    <tr>
      <th style="width:100px;">Região</th>
      <th style="width:160px;">Praia</th>
      <th>Descrição</th>
      <th style="width:220px;">Tags propostas</th>
      <th style="width:140px;">Notas</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<h2 class="section">Correcções JSON</h2>
<p style="font-size:12px;color:#666;">Só praias com alterações aparecem aqui. Se não fizeste nenhuma correcção, o JSON fica vazio <code>{}</code> — nesse caso o script aplica as tags propostas tal como estão.</p>
<textarea id="corrections" readonly placeholder="{}"></textarea>
<button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('corrections').value).then(()=>this.textContent='Copiado!').catch(()=>this.textContent='Falhou')">Copiar JSON</button>

<script>
const initial = ${initialMap};
const current = JSON.parse(JSON.stringify(initial));

function updateCorrections() {
  const diffs = {};
  for (const id of Object.keys(initial)) {
    const a = (initial[id] || []).slice().sort().join(',');
    const b = (current[id] || []).slice().sort().join(',');
    if (a !== b) diffs[id] = current[id];
  }
  document.getElementById('corrections').value = Object.keys(diffs).length ? JSON.stringify(diffs, null, 2) : '{}';
}

const COLORS = { family: '#E07A26', surf: '#0B1B2B', fishing: '#6B7A3F', wild_nature: '#C9A24B' };

document.querySelectorAll('.badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const beachId = badge.closest('tr').dataset.beachId;
    const key = badge.dataset.key;
    const nowActive = badge.dataset.active !== 'true';
    badge.dataset.active = nowActive;
    badge.style.background = nowActive ? COLORS[key] : '#e5e5e5';
    badge.style.color = nowActive ? '#fff' : '#999';
    if (!current[beachId]) current[beachId] = [];
    if (nowActive) { if (!current[beachId].includes(key)) current[beachId].push(key); }
    else { current[beachId] = current[beachId].filter(t => t !== key); }
    const row = badge.closest('tr');
    const anyActive = Array.from(row.querySelectorAll('.badge')).some(b => b.dataset.active === 'true');
    row.classList.toggle('untagged', !anyActive);
    updateCorrections();
  });
});

function applyFilters() {
  const showUntagged = document.getElementById('filter-untagged').checked;
  const showConflicts = document.getElementById('filter-conflicts').checked;
  let visible = 0;
  document.querySelectorAll('#beaches-table tbody tr').forEach(tr => {
    const isUntagged = tr.classList.contains('untagged');
    const hasConflict = tr.dataset.hasConflict === 'true';
    let show = true;
    if (showUntagged && !isUntagged) show = false;
    if (showConflicts && !hasConflict) show = false;
    tr.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('count-display').textContent = 'A mostrar ' + visible + ' praias';
}

document.getElementById('filter-untagged').addEventListener('change', applyFilters);
document.getElementById('filter-conflicts').addEventListener('change', applyFilters);

updateCorrections();
</script>
</body>
</html>`;
}

// =============================================
// MAIN
// =============================================

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);

  const beaches = await fetchBeaches();

  const results = beaches.map(b => {
    const { matched, matchDetails } = matchTags(b.description);
    return {
      id: b.id,
      name: b.name,
      region: b.region,
      description: b.description,
      currentTags: b.tags || [],
      proposedTags: matched,
      matchDetails,
      notes: matched.length === 0 ? 'Sem tag detectada — rever manualmente' : '',
    };
  });

  if (!APPLY) {
    const html = generateHTMLReport(results);
    writeFileSync(REPORT_PATH, html, 'utf8');
    console.log(`\n✅ Report HTML gerado: ${REPORT_PATH}`);
    console.log('\nEstatísticas:');
    console.log(`  Famílias:        ${results.filter(r => r.proposedTags.includes('family')).length}`);
    console.log(`  Surf:            ${results.filter(r => r.proposedTags.includes('surf')).length}`);
    console.log(`  Pesca:           ${results.filter(r => r.proposedTags.includes('fishing')).length}`);
    console.log(`  Nat. selvagem:   ${results.filter(r => r.proposedTags.includes('wild_nature')).length}`);
    console.log(`  Sem tags:        ${results.filter(r => r.proposedTags.length === 0).length}`);
    console.log(`\nAbra o report: file:///${REPORT_PATH.replace(/\\/g, '/')}`);
    console.log('\nPróximos passos:');
    console.log('  1. Reveja tags no report (badges clicáveis)');
    console.log('  2. Copie JSON de correcções → guarde em _scripts/auto-tag-corrections.json');
    console.log('  3. Corra: node _scripts/auto-tag-beaches.js --apply');
    return;
  }

  // APPLY mode
  const corrections = loadCorrections();
  console.log(corrections
    ? `Loaded ${Object.keys(corrections).length} corrections from ${CORRECTIONS_PATH}`
    : 'No corrections file — applying proposed tags as-is'
  );

  let updated = 0;
  let failed = 0;

  for (const r of results) {
    const finalTags = (corrections && corrections[r.id] !== undefined)
      ? corrections[r.id]
      : r.proposedTags;

    const { error } = await supabase
      .from('beaches')
      .update({ tags: finalTags })
      .eq('id', r.id);

    if (error) {
      console.error(`❌ Failed to update ${r.name}: ${error.message}`);
      failed++;
    } else {
      process.stdout.write('.');
      updated++;
    }

    await new Promise(resolve => setTimeout(resolve, 80));
  }

  console.log(`\n\n✅ Updated: ${updated}`);
  if (failed > 0) console.log(`❌ Failed:  ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

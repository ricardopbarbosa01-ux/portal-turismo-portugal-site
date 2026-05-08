/**
 * _scripts/build-editorial-rank-proposal.cjs
 *
 * Hotfix 3 Bloco B-1 — Proposta editorial_rank 25 praias âncora + 5 buffer
 *
 * Lê tabela beaches (SELECT only — NUNCA escreve na BD), score-ranqueia
 * praias ativas pela curadoria editorial 2026-05-06 e gera
 * _scripts/editorial-rank-proposal.md para revisão de Ricardo antes de
 * B-2 aplicar editorial_rank à BD.
 *
 * Usage (run from Portal-turismo-site/):
 *   node _scripts/build-editorial-rank-proposal.cjs
 *
 * Extensão .cjs porque _scripts/package.json declara "type":"module" e
 * o código usa CommonJS require().
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const path = require('path');
const fs   = require('fs');
const { createClient } = require('@supabase/supabase-js');

// ─── Env validation ─────────────────────────────────────────────────────────

const SUPABASE_URL       = process.env.SUPABASE_URL;
const SUPABASE_KEY       = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing env vars — ensure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Editorial constants ─────────────────────────────────────────────────────

/**
 * CURATED_WORKSHEET — UUIDs das 21 praias identificadas na Fase 6A
 * (curadoria-2026-05-06.md) como prioritárias para curadoria de imagem.
 * Presença aqui dá +3 pontos ao score editorial (curadoria prioritária).
 */
const CURATED_WORKSHEET = new Set([
  '66ee7f6b-018b-408b-8d48-c58d2f73bf8d', // Praia da Marinha
  'd3bb1bb1-4e97-424d-9267-710673662975', // Praia de Benagil
  '23467c12-84bc-4590-a3a8-32412c15fcde', // Praia de Carvoeiro
  '010ffc15-3125-4156-aa4f-54b6198ae8e3', // Praia de Alvor (a)
  '925ac239-db1f-432b-98ee-7a308ae9a6b8', // Praia de Alvor (b)
  'fede421d-0f75-46f7-9248-9a374bc63c4c', // Praia de Cascais
  '49839927-ee16-498b-80a8-f029627fd4c5', // Praia da Costa de Caparica
  '513d687d-b8f9-4d87-b5a7-c6de1d7d695c', // Praia Grande
  'd81736c8-0e7d-4d98-b369-377998fc5c2f', // Praia das Maçãs
  '3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7', // Praia dos Galapinhos
  'f893e0a8-9f2e-4533-9093-001877541cf1', // Praia de São João do Estoril
  '0f616614-30d1-488a-986a-acd1caebbe6c', // Praia de Supertubos
  'b5d5f332-d553-49d9-ad92-77d658de945f', // Praia da Murtinheira
  'ffe1a91f-de57-4ff0-9ad5-d32951851730', // Praia de Peniche
  '74421a75-f67c-45d5-928f-b7fae44adc33', // Praia do Norte
  'f7fa6d81-2872-4971-be81-42464b11ac9f', // Praia das Caxinas
  '10f7f046-fb30-493e-acf0-bf6b2a57858b', // Praia do Cabedelo
  '43290bbc-db7f-4b1e-9cb5-a51b644c0ca6', // Vila Praia de Âncora
  'dd37d1cd-8ecc-45af-b8d2-3ceabf881969', // Praia de Ofir
  'dee27f4d-ec13-43b4-a618-4ac272d22cf2', // Praia de São Torpes
  '2dd735c3-9317-45bb-aed7-c3832af7653d', // Praia de Vila Nova de Milfontes
  '0b9d2380-38cf-437d-a4e3-4b68158ba2a4', // Praia de Tróia
]);

/**
 * NATIONAL_ICONS — nomes de praias reconhecidas como ícones nacionais
 * ou internacionalmente famosas (Nazaré big wave, Ericeira surf reserve,
 * Guincho windy icon, Adraga hidden gem, Marinha Algarve #1 TripAdvisor,
 * Benagil cave, Comporta luxury, Ursa secret, Arrabida UNESCO).
 * Presença aqui dá +4 pontos ao score editorial (prestígio icónico).
 */
const NATIONAL_ICONS = new Set([
  'Praia da Nazaré',
  'Praia de Ericeira',
  'Praia do Guincho',
  'Praia de Adraga',
  'Praia da Marinha',
  'Praia de Benagil',
  'Praia da Comporta',
  'Praia da Ursa',
  'Portinho da Arrábida',
  'Praia de Supertubos',
  'Praia de Cascais',
  'Praia de Carcavelos',
  'Praia da Costa de Caparica',
  'Praia da Arrifana',
  'Praia da Bordeira',
  'Praia de Odeceixe',
  'Praia de Porto Santo',
  'Jardim do Mar',
  'Praia da Falésia',
  'Praia de Sagres',
  'Praia de Dona Ana',
  'Praia da Rocha',
]);

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Calcula o score editorial de uma praia.
 *
 * Critérios (máx. ~20 pontos):
 *   +4  Ícone nacional (NATIONAL_ICONS)
 *   +3  Curadoria prioritária (CURATED_WORKSHEET)
 *   +3  Imagem curada manualmente (image_curated_url != null)
 *   +2  Tag surf (surf_spot editorial relevance)
 *   +2  Tag wild_nature (unicidade paisagística)
 *   +1  Tag family (apelo mainstream)
 *   +1  Tag fishing (autenticidade local)
 *   +2  WSL na BD (competição surf reconhecida)
 *   +2  UNESCO na BD (patrimnião natural)
 *   +1  Bandeira Azul (qualidade da água / certificação)
 *   +1  Descrição editorial ≥ 300 chars (contexto para utilizador)
 *   +1  Descrição editorial ≥ 600 chars (profundidade editorial extra)
 */
function scoreBeach(beach) {
  let score = 0;
  const reasons = [];

  const tagSourcesStr = JSON.stringify(beach.tag_sources || {}).toLowerCase();
  const tags = beach.tags || [];

  if (NATIONAL_ICONS.has(beach.name)) {
    score += 4;
    reasons.push('ícone nacional (+4)');
  }
  if (CURATED_WORKSHEET.has(beach.id)) {
    score += 3;
    reasons.push('worksheet curadoria (+3)');
  }
  if (beach.image_curated_url) {
    score += 3;
    reasons.push('imagem curada (+3)');
  }
  if (tags.includes('surf')) {
    score += 2;
    reasons.push('tag surf (+2)');
  }
  if (tags.includes('wild_nature')) {
    score += 2;
    reasons.push('tag wild_nature (+2)');
  }
  if (tags.includes('family')) {
    score += 1;
    reasons.push('tag family (+1)');
  }
  if (tags.includes('fishing')) {
    score += 1;
    reasons.push('tag fishing (+1)');
  }
  if (tagSourcesStr.includes('wsl')) {
    score += 2;
    reasons.push('WSL (+2)');
  }
  if (tagSourcesStr.includes('unesco')) {
    score += 2;
    reasons.push('UNESCO (+2)');
  }
  if (tagSourcesStr.includes('bandeira azul')) {
    score += 1;
    reasons.push('Bandeira Azul (+1)');
  }
  const descLen = (beach.description || '').length;
  if (descLen >= 300) {
    score += 1;
    reasons.push('desc≥300 (+1)');
  }
  if (descLen >= 600) {
    score += 1;
    reasons.push('desc≥600 (+1)');
  }

  return { score, reasons };
}

// ─── Markdown generation ─────────────────────────────────────────────────────

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function boolIcon(v) {
  return v ? '✅' : '—';
}

function generateMarkdown(beaches, generated) {
  const top30 = beaches.slice(0, 30);
  const top25 = beaches.slice(0, 25);
  const buffer = beaches.slice(25, 30);

  // ── Regional distribution ───────────────────────────────────────────────
  const regionCount = {};
  top25.forEach(b => {
    regionCount[b.region] = (regionCount[b.region] || 0) + 1;
  });

  // ── Build markdown ───────────────────────────────────────────────────────
  const lines = [];

  lines.push('# Editorial Rank Proposal — 25 praias âncora');
  lines.push('');
  lines.push('> **Branch:** `feature/beach-tagging`');
  lines.push(`> **Gerado:** ${generated}`);
  lines.push(`> **Praias analisadas:** ${beaches.length} praias ativas (excl. region=Hero)`);
  lines.push('> **Decisão pendente:** Ricardo revê e aprova/ajusta antes de B-2 aplicar editorial_rank à BD.');
  lines.push('> **READ-ONLY:** nenhuma escrita foi aplicada à BD nesta tarefa.');
  lines.push('');

  // ── Top 30 table ─────────────────────────────────────────────────────────
  lines.push('## Top 30 propostas');
  lines.push('');
  lines.push('Rank 1-25 = âncoras propostas. Rank 26-30 = buffer/substitutos.');
  lines.push('');
  lines.push('| Rank | Nome | Região | Score | Ícone | Worksheet | Curada | WSL | UNESCO | BA |');
  lines.push('|------|------|--------|-------|-------|-----------|--------|-----|--------|-----|');

  top30.forEach((b, idx) => {
    const rank = idx + 1;
    const sep = rank === 25 ? '' : '';
    const isIcon    = NATIONAL_ICONS.has(b.name) ? '✅' : '—';
    const isWS      = CURATED_WORKSHEET.has(b.id) ? '✅' : '—';
    const isCurated = b.image_curated_url ? '✅' : '—';
    const tsStr     = JSON.stringify(b.tag_sources || {}).toLowerCase();
    const isWSL     = tsStr.includes('wsl') ? '✅' : '—';
    const isUNESCO  = tsStr.includes('unesco') ? '✅' : '—';
    const isBA      = tsStr.includes('bandeira azul') ? '✅' : '—';
    const rankStr   = rank <= 25 ? `**${rank}**` : rank.toString();
    lines.push(`| ${rankStr} | ${b.name} | ${b.region} | ${b._score} | ${isIcon} | ${isWS} | ${isCurated} | ${isWSL} | ${isUNESCO} | ${isBA} |`);
  });

  lines.push('');
  lines.push('_Scores calculados com o critério editorial de 2026-05-08 (ver script `build-editorial-rank-proposal.cjs`)._');
  lines.push('');

  // ── Per-beach detail ──────────────────────────────────────────────────────
  lines.push('## Detalhe por praia (auditoria completa)');
  lines.push('');

  top30.forEach((b, idx) => {
    const rank = idx + 1;
    const label = rank <= 25 ? `Rank ${rank} (âncora)` : `Rank ${rank} (buffer)`;
    lines.push(`### ${rank}. ${b.name} — ${label}`);
    lines.push('');
    lines.push(`- **UUID:** \`${b.id}\``);
    lines.push(`- **Região:** ${b.region}${b.subregion ? ' / ' + b.subregion : ''}`);
    lines.push(`- **Score:** ${b._score} pts — ${b._reasons.join(', ')}`);
    lines.push(`- **Tags:** ${(b.tags || []).join(', ') || '—'}`);
    lines.push(`- **Imagem curada:** ${b.image_curated_url ? b.image_curated_url : '—'}`);
    const tsStr = JSON.stringify(b.tag_sources || {}).toLowerCase();
    lines.push(`- **WSL:** ${boolIcon(tsStr.includes('wsl'))} | **UNESCO:** ${boolIcon(tsStr.includes('unesco'))} | **Bandeira Azul:** ${boolIcon(tsStr.includes('bandeira azul'))}`);
    lines.push(`- **Ícone nacional:** ${boolIcon(NATIONAL_ICONS.has(b.name))} | **Worksheet curadoria:** ${boolIcon(CURATED_WORKSHEET.has(b.id))}`);
    const descPreview = truncate(b.description, 200);
    lines.push(`- **Descrição (preview):** ${descPreview || '—'}`);
    lines.push('');
  });

  // ── Estatísticas ──────────────────────────────────────────────────────────
  lines.push('## Estatísticas');
  lines.push('');
  lines.push('### Distribuição regional (top 25)');
  lines.push('');
  lines.push('| Região | Praias |');
  lines.push('|--------|--------|');
  Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      lines.push(`| ${region} | ${count} |`);
    });
  lines.push('');

  lines.push('### Atributos presentes (top 25)');
  lines.push('');
  const withCurated  = top25.filter(b => b.image_curated_url).length;
  const withWSL      = top25.filter(b => JSON.stringify(b.tag_sources||{}).toLowerCase().includes('wsl')).length;
  const withUNESCO   = top25.filter(b => JSON.stringify(b.tag_sources||{}).toLowerCase().includes('unesco')).length;
  const withBA       = top25.filter(b => JSON.stringify(b.tag_sources||{}).toLowerCase().includes('bandeira azul')).length;
  const withSurf     = top25.filter(b => (b.tags||[]).includes('surf')).length;
  const withWild     = top25.filter(b => (b.tags||[]).includes('wild_nature')).length;
  const withFamily   = top25.filter(b => (b.tags||[]).includes('family')).length;
  const withIcons    = top25.filter(b => NATIONAL_ICONS.has(b.name)).length;
  const withWS       = top25.filter(b => CURATED_WORKSHEET.has(b.id)).length;
  lines.push(`| Atributo | Praias | % |`);
  lines.push(`|----------|--------|---|`);
  lines.push(`| Ícones nacionais | ${withIcons} | ${Math.round(withIcons/25*100)}% |`);
  lines.push(`| Worksheet curadoria | ${withWS} | ${Math.round(withWS/25*100)}% |`);
  lines.push(`| Imagem curada manualmente | ${withCurated} | ${Math.round(withCurated/25*100)}% |`);
  lines.push(`| WSL | ${withWSL} | ${Math.round(withWSL/25*100)}% |`);
  lines.push(`| UNESCO | ${withUNESCO} | ${Math.round(withUNESCO/25*100)}% |`);
  lines.push(`| Bandeira Azul | ${withBA} | ${Math.round(withBA/25*100)}% |`);
  lines.push(`| Tag surf | ${withSurf} | ${Math.round(withSurf/25*100)}% |`);
  lines.push(`| Tag wild_nature | ${withWild} | ${Math.round(withWild/25*100)}% |`);
  lines.push(`| Tag family | ${withFamily} | ${Math.round(withFamily/25*100)}% |`);
  lines.push('');

  lines.push('### Score distribution (top 30)');
  lines.push('');
  lines.push(`- Máximo: ${top30[0]._score} pts (${top30[0].name})`);
  lines.push(`- Posição 25: ${top25[top25.length - 1]._score} pts (${top25[top25.length - 1].name})`);
  lines.push(`- Posição 30: ${top30[top30.length - 1]._score} pts (${top30[top30.length - 1].name})`);
  const avg = Math.round(top25.reduce((acc, b) => acc + b._score, 0) / top25.length * 10) / 10;
  lines.push(`- Média top 25: ${avg} pts`);
  lines.push('');

  // ── Próximo passo ─────────────────────────────────────────────────────────
  lines.push('## Próximo passo');
  lines.push('');
  lines.push('**B-2 (pendente aprovação de Ricardo):**');
  lines.push('');
  lines.push('1. Ricardo revê esta proposta — ajusta ranks, troca praias se necessário.');
  lines.push('2. Depois de aprovação, B-2 aplica `editorial_rank` 1-25 na BD:');
  lines.push('');
  lines.push('```sql');
  lines.push('-- Exemplo B-2 (NÃO CORRER AINDA — aguardar aprovação)');
  top25.forEach((b, idx) => {
    lines.push(`UPDATE beaches SET editorial_rank = ${idx + 1} WHERE id = '${b.id}'; -- ${b.name}`);
  });
  lines.push('```');
  lines.push('');
  lines.push('3. Após B-2: `beaches.html` e outros card renders ordenam por `editorial_rank` ASC (NULLs last).');
  lines.push('');
  lines.push('---');
  lines.push(`_Gerado por \`_scripts/build-editorial-rank-proposal.cjs\` em ${generated}_`);
  lines.push(`_Branch: \`feature/beach-tagging\`_`);

  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('=== build-editorial-rank-proposal.cjs ===');
  console.log('Branch: feature/beach-tagging | READ-ONLY');
  console.log('');

  // Fetch beaches
  const { data: beaches, error } = await supabase
    .from('beaches')
    .select('id, name, region, subregion, tags, tag_sources, image_curated_url, description, is_surf_spot, beach_type, water_quality')
    .eq('is_active', true)
    .neq('region', 'Hero')
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Supabase error:', error.message);
    process.exit(1);
  }

  console.log(`Analyzing ${beaches.length} beaches for editorial ranking...`);
  console.log('');

  // Score each beach
  const scored = beaches.map(b => {
    const { score, reasons } = scoreBeach(b);
    return { ...b, _score: score, _reasons: reasons };
  });

  // Sort: score desc, then name asc for deterministic tie-breaking
  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return a.name.localeCompare(b.name);
  });

  // Print top 30 to stdout
  console.log('Top 25 propostas âncora:');
  console.log('─'.repeat(60));
  scored.slice(0, 25).forEach((b, idx) => {
    console.log(`  ${String(idx + 1).padStart(2)}. ${b.name.padEnd(40)} ${b.region.padEnd(16)} score: ${b._score}`);
  });
  console.log('');
  console.log('Buffer 26-30:');
  console.log('─'.repeat(60));
  scored.slice(25, 30).forEach((b, idx) => {
    console.log(`  ${String(idx + 26).padStart(2)}. ${b.name.padEnd(40)} ${b.region.padEnd(16)} score: ${b._score}`);
  });
  console.log('');

  // Generate markdown
  const generated = new Date().toISOString();
  const markdown  = generateMarkdown(scored, generated);

  // Write output
  const outputPath = path.resolve(__dirname, 'editorial-rank-proposal.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`✅ Wrote ${outputPath}`);
  console.log(`   ${markdown.length} chars`);
  console.log('');
  console.log('Next step: Ricardo revê editorial-rank-proposal.md, aprova/ajusta,');
  console.log('           depois B-2 aplica editorial_rank à BD.');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

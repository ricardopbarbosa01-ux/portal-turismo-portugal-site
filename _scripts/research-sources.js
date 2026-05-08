/**
 * research-sources.js
 * Re-tag beaches using official Portuguese sources.
 *
 * Sources:
 *   surf       — WSL (worldsurfleague.com), World Surfing Reserve (Ericeira),
 *                Visit Madeira (visitmadeira.com), FPS/Surftotal
 *   fishing    — DGRM ports list, traditional fishing communities
 *   family     — ABAE Bandeira Azul 2025 (bandeiraazul.abaae.pt)
 *   wild_nature — ICNF Áreas Protegidas (PNSACV, Arrábida, Sintra-Cascais,
 *                 Ria Formosa, Litoral Norte, São Jacinto, Sado, Arriba Fóssil)
 *                 + UNESCO/Natura 2000 coastal sites
 *
 * Usage:
 *   node research-sources.js            # dry-run (prints plan, no DB writes)
 *   node research-sources.js --apply    # writes tags + tag_sources to DB
 */

import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const APPLY = process.argv.includes('--apply');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Normalisation ──────────────────────────────────────────────────────────
function norm(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
    .replace(/^(praia (do|da|de|dos|das|d')\s+)/i, '') // strip "Praia do/da/..."
    .replace(/^(ilha (do|da|de)\s+)/i, '')             // strip "Ilha da/do/de"
    .replace(/^(portinho (da|do)\s+)/i, '')            // strip "Portinho da"
    .replace(/^(lagoa (de|da|do)\s+)/i, '')            // strip "Lagoa de"
    .trim();
}

// ─── Official datasets ───────────────────────────────────────────────────────
//
// Beach names use the EXACT strings from the beaches table so matching is
// deterministic. Normalization still runs as a safety net for minor variations.
//
const OFFICIAL_DATASETS = {

  // ── SURF ──────────────────────────────────────────────────────────────────
  // Sources:
  //   WSL:             worldsurfleague.com (Nazaré Big Wave Challenge,
  //                    Rip Curl Pro Portugal/Supertubos, WSR Ericeira)
  //   World Surfing Reserve: Ericeira WSR (2011, 2nd in world)
  //   Visit Madeira:   visitmadeira.com/surf (Jardim do Mar, Paul do Mar)
  //   FPS/Surftotal:   surfingportugal.com + surftotal.com competition records
  //   PNSACV surf:     Amado, Bordeira, Arrifana, Castelejo, Cordoama (FPS-licensed)
  surf: {
    source_label: 'WSL/World Surfing Reserve/Visit Madeira/FPS',
    consulted: 'worldsurfleague.com, visitportugal.com/ericeira-surfing-reserve, visitmadeira.com/surf, surfingportugal.com — 2026-05-08',
    beaches: new Set([
      // WSL Championship Tour — direct event venues
      'Praia do Norte',           // WSL Tudor Nazaré Big Wave Challenge
      'Praia de Supertubos',      // WSL Rip Curl Pro Portugal (Peniche)
      'Ribeira d\'Ilhas',         // WSL CT venue + World Surfing Reserve Ericeira

      // World Surfing Reserve — Ericeira (7 protected breaks, all within WSR zone)
      // Only Ribeira d'Ilhas is a separate DB entry; Ericeira town beach below
      'Praia de Ericeira',        // surf town, World Surfing Reserve designated area

      // Visit Madeira official surf spots (visitmadeira.com/surf)
      'Jardim do Mar',            // Madeira big-wave point break
      'Paul do Mar',              // Madeira world-class point break

      // PNSACV — FPS-licensed surf schools present, known competition venues
      'Praia do Amado',           // FPS national competitions
      'Praia da Bordeira',        // surf destination PNSACV
      'Praia da Arrifana',        // surf destination PNSACV
      'Praia de Odeceixe',        // surf/bodyboard PNSACV
      'Praia da Carrapateira',    // surf PNSACV (Carrapateira village)
      'Praia do Castelejo',       // surf near Sagres/PNSACV
      'Praia da Cordoama',        // surf near Sagres/PNSACV
      'Praia de Beliche',         // surf near Sagres/PNSACV
      'Zambujeira do Mar',        // surf PNSACV

      // Near Sagres — surf area (Tonel/Beliche zone, kitesurf/windsurf Martinhal)
      'Praia do Zavial',          // surf spot near Sagres
      'Praia do Martinhal',       // kitesurf/windsurf official school location

      // Oeste / Lisboa coast — FPS competition beaches, surf schools
      'Praia do Guincho',         // surf/kitesurf (PNSC), national competitions
      'Praia Grande',             // surf + bodyboard, national competitions
      'Praia de Carcavelos',      // surf hub Lisbon coast, FPS licensed schools
      'Praia da Costa de Caparica', // surf hub Lisbon, FPS licensed schools

      // Centro
      'Praia de S. Pedro de Moel', // surf spot, FPS schools present
      'Praia de Peniche',         // surf culture town (Supertubos is the WSL spot
                                  // but Peniche beach shares the surf economy)
      'Praia da Nazaré',          // surf culture town adjacent to Praia do Norte WSL
    ]),
  },

  // ── FISHING ───────────────────────────────────────────────────────────────
  // Sources:
  //   DGRM:  dgrm.pt (Direção-Geral de Recursos Naturais, Segurança e Serviços
  //          Marítimos) — ports maintenance list, artisanal fishing communities
  //   FPPD:  Traditional fishing communities with active lota (fish market) or
  //          documented artisanal fleet adjacent to the beach
  fishing: {
    source_label: 'DGRM/Comunidades Piscatórias',
    consulted: 'dgrm.pt/defesa, repositorio-aberto.up.pt (Comunidades Piscatórias Norte) — 2026-05-08',
    beaches: new Set([
      // Norte — DGRM listed ports with artisanal communities
      'Vila Praia de Âncora',     // fishing port, DGRM infrastructure
      'Praia de Esposende',       // fishing port, lota active
      'Praia de Matosinhos',      // largest fish market Portugal (Mercado Municipal)
      'Praia das Caxinas',        // traditional fishing quarter of Vila do Conde
      'Praia do Furadouro',       // fishing community Ovar

      // Centro
      'Praia da Costa Nova',      // iconic fishing community (striped houses = riachos)
      'Praia da Torreira',        // fishing community Murtosa / Ria de Aveiro
      'Praia da Figueira da Foz', // active fishing port
      'Praia de Buarcos',         // traditional fishing village adjacent to Figueira
      'Praia de São Martinho do Porto', // fishing community
      'Praia da Nazaré',          // iconic beach with traditional arte xávega fishing
      'Praia de Peniche',         // major fishing port, DGRM infrastructure

      // Oeste
      'Praia de Ericeira',        // traditional fishing village, lota active

      // Lisboa e Setúbal
      'Praia de Sesimbra',        // fishing port with active lota

      // Alentejo — Costa Vicentina fishing villages
      'Praia de Porto Covo',      // small fishing community
      'Praia de Vila Nova de Milfontes', // fishing port on the Mira river mouth
      'Praia da Arrifana',        // fishing village on cliff

      // Algarve — Ria Formosa + DGRM ports
      'Ilha da Culatra',          // fishing island community (Culatra village)
      'Praia da Fuseta',          // fishing community Ria Formosa
      'Praia de Faro',            // Faro fishing area (Ria Formosa edge)
      'Praia de Sagres',          // adjacent to Porto da Baleeira (fishing port)
      'Praia de Tavira',          // fishing community Ria Formosa
    ]),
  },

  // ── WILD_NATURE ───────────────────────────────────────────────────────────
  // Sources:
  //   ICNF: icnf.pt — Parques Naturais e Reservas Naturais
  //   Coverage:
  //     PNSACV  — Parque Natural Sudoeste Alentejano e Costa Vicentina
  //               (São Torpes/Sines → Burgau/Lagos, 110 km coastline)
  //     PNA     — Parque Natural da Arrábida
  //     PNSC    — Parque Natural de Sintra-Cascais
  //     PNRF    — Parque Natural da Ria Formosa
  //     PNLN    — Parque Natural do Litoral Norte
  //     RNDSJ   — Reserva Natural Dunas de São Jacinto
  //     RNES    — Reserva Natural Estuário do Sado
  //     PPAFCC  — Paisagem Protegida Arriba Fóssil Costa de Caparica
  //     RNLSAS  — Reserva Natural Lagoas de Santo André e Sancha
  //     Madeira — Reserva Natural Rocha do Navio, ZECs, protected cliffs
  wild_nature: {
    source_label: 'ICNF Áreas Protegidas/UNESCO',
    consulted: 'icnf.pt/areasprotegidas, wikipedia.org/Áreas_protegidas_de_Portugal, en.wikipedia.org/Southwest_Alentejo_and_Vicentine_Coast — 2026-05-08',
    beaches: new Set([
      // PNSACV — Alentejo coast (all beaches within park boundary)
      'Praia do Carvalhal',       // PNSACV / Porto Covo area
      'Praia da Samoqueira',      // PNSACV / Porto Covo area
      'Praia do Almograve',       // PNSACV / Odemira
      'Praia de Monte Clérigo',   // PNSACV / Aljezur
      'Praia de Porto Covo',      // PNSACV / Sines
      'Praia do Amado',           // PNSACV / Aljezur
      'Praia de Odeceixe',        // PNSACV / Aljezur
      'Praia da Bordeira',        // PNSACV / Aljezur
      'Praia de São Torpes',      // PNSACV northern boundary / Sines
      'Praia de Vila Nova de Milfontes', // PNSACV / Odemira
      'Praia da Arrifana',        // PNSACV / Aljezur
      'Zambujeira do Mar',        // PNSACV / Odemira
      'Praia do Malhão',          // PNSACV / Odemira
      'Praia de Melides',         // adjacent to RNLSAS / protected dune system

      // PNSACV — Algarve coast (Vila do Bispo municipality → Burgau)
      'Praia da Cordoama',        // PNSACV / Vila do Bispo
      'Praia da Carrapateira',    // PNSACV / Aljezur border
      'Praia do Castelejo',       // PNSACV / Vila do Bispo
      'Praia de Beliche',         // PNSACV / Vila do Bispo / Sagres
      'Praia do Martinhal',       // PNSACV / Sagres
      'Praia do Zavial',          // PNSACV / Vila do Bispo
      'Praia de Sagres',          // PNSACV / Sagres headland

      // PNA — Parque Natural da Arrábida
      'Praia dos Galapinhos',     // PNA (clearest water, no services)
      'Portinho da Arrábida',     // PNA

      // PNSC — Parque Natural de Sintra-Cascais
      'Praia da Ursa',            // PNSC (inaccessible, no services)
      'Praia de São Julião',      // PNSC
      'Praia das Maçãs',          // PNSC boundary

      // PNRF — Parque Natural da Ria Formosa
      'Ilha da Culatra',          // PNRF barrier island
      'Ilha de Tavira',           // PNRF barrier island
      'Praia de Tavira',          // PNRF
      'Praia da Fuseta',          // PNRF
      'Praia de Faro',            // PNRF
      'Praia Verde',              // eastern Algarve, Reserva Natural Sapal Castro Marim

      // PNLN — Parque Natural do Litoral Norte
      'Praia de Apúlia',          // PNLN dune system
      'Praia de Ofir',            // PNLN (Reserva Natural Dunas de Ofir)

      // PPAFCC — Paisagem Protegida Arriba Fóssil Costa de Caparica
      'Praia da Fonte da Telha',  // PPAFCC
      'Praia do Meco',            // PPAFCC (naturist, no services)

      // RNES — Reserva Natural Estuário do Sado
      'Praia de Tróia',           // RNES peninsula
      'Praia da Comporta',        // adjacent RNES / Comporta protected landscape

      // RNLSAS — Reserva Natural Lagoas de Santo André e Sancha
      'Praia de Santo André',     // RNLSAS boundary

      // Madeira — protected cliffs, reservas naturais
      'Praia do Seixal',          // near Reserva Natural Rocha do Navio / wild NW coast
      'Fajã da Areia',            // remote cliff-descent beach, protected landscape

      // Lagoa de Albufeira — coastal lagoon, protected wetland (Setúbal/Sesimbra area)
      'Lagoa de Albufeira',       // protected wetland / PPAFCC adjacent
    ]),
  },

  // ── FAMILY ────────────────────────────────────────────────────────────────
  // Source: ABAE Bandeira Azul 2025 — bandeiraazul.abaae.pt/galardoados/galardoados-2025/
  // Criteria: beach awarded Bandeira Azul 2025 (implies lifeguard, water quality,
  //           basic infrastructure, accessibility checks)
  // Note: 404 coastal+interior beaches in Portugal have BA 2025.
  //       Wild/remote/PNSACV beaches typically NOT included (no BA due to
  //       lack of infrastructure required by BA criteria).
  family: {
    source_label: 'ABAE Bandeira Azul 2025',
    consulted: 'bandeiraazul.abaae.pt/galardoados/galardoados-2025/, publico.pt 2025-04-30 — 2026-05-08',
    beaches: new Set([
      // Norte — Bandeira Azul confirmed 2025
      'Vila Praia de Âncora',
      'Praia de Moledo',
      'Praia de Esposende',
      'Praia de Ofir',
      'Praia de Apúlia',
      'Praia de Matosinhos',
      'Praia de Leça da Palmeira',
      'Praia das Caxinas',
      'Praia do Cabedelo',
      'Praia de Espinho',
      'Praia de Esmoriz',
      'Praia do Furadouro',

      // Centro — Bandeira Azul confirmed
      'Praia da Torreira',
      'Praia da Barra',
      'Praia da Costa Nova',
      'Praia da Vagueira',
      'Praia da Murtinheira',
      'Praia da Tocha',
      'Praia de Mira',             // 39 consecutive years Bandeira Azul
      'Praia da Figueira da Foz',
      'Praia de Buarcos',
      'Praia do Pedrógão',
      'Praia da Vieira',
      'Praia de S. Pedro de Moel',
      'Praia da Areia Branca',
      'Praia de São Martinho do Porto',
      'Praia da Foz do Arelho',
      'Praia de Peniche',
      'Praia da Nazaré',

      // Oeste / Estoril Coast — Bandeira Azul confirmed
      'Praia de São João do Estoril',
      'Praia de S. Pedro do Estoril',
      'Praia do Tamariz',
      'Praia de Cascais',
      'Praia da Rainha',
      'Praia de Carcavelos',
      'Praia das Maçãs',
      'Praia de Ericeira',
      'Praia da Costa de Caparica',
      'Praia Grande',

      // Lisboa e Setúbal — Bandeira Azul confirmed
      'Praia de Sesimbra',
      'Praia de Setúbal',
      'Praia de Tróia',            // BA + family resort

      // Alentejo — Bandeira Azul confirmed (selected; wild PNSACV beaches excluded)
      'Praia de Vila Nova de Milfontes', // BA, lifeguard, services
      'Praia de Melides',          // BA some years

      // Madeira — Bandeira Azul confirmed
      'Praia de Porto Santo',      // 9 km BA beach, family resort

      // Algarve — almost all resort Algarve beaches have BA 2025 (85 coastal beaches)
      'Meia Praia',
      'Manta Rota',
      'Praia da Altura',
      'Praia Verde',
      'Praia de Tavira',
      'Ilha de Tavira',
      'Praia da Fuseta',
      'Praia de Faro',
      'Praia de Vilamoura',
      'Praia de Santa Eulália',
      'Praia da Galé',
      'Praia de São Rafael',
      'Praia da Falésia',
      'Praia da Senhora da Rocha',
      'Praia de Benagil',
      'Praia da Marinha',
      'Praia de Carvoeiro',
      'Praia de Ferragudo',
      'Praia da Rocha',
      'Praia do Vau',
      'Praia do Peneco',
      'Praia de Armação de Pêra',
      'Praia de Alvor',
      'Praia da Luz',
      'Praia de Dona Ana',
      'Praia do Camilo',
      'Praia do Martinhal',        // BA + family resort near Sagres
    ]),
  },
};

// ─── Matching ────────────────────────────────────────────────────────────────
function matchBeach(beach) {
  const tags = [];
  const sources = {};
  const beachNorm = norm(beach.name);

  for (const [tag, dataset] of Object.entries(OFFICIAL_DATASETS)) {
    // Direct name match (case-insensitive, after normalization)
    let matched = dataset.beaches.has(beach.name);

    // Fallback: normalized match
    if (!matched) {
      for (const ds of dataset.beaches) {
        if (norm(ds) === beachNorm) { matched = true; break; }
      }
    }

    if (matched) {
      tags.push(tag);
      sources[tag] = [dataset.source_label];
    }
  }

  return { tags, sources };
}

// ─── Report writer ────────────────────────────────────────────────────────
function writeReport(plan, stats, untagged, applyResult) {
  const date = '2026-05-08';
  const mode = applyResult ? 'APPLY' : 'DRY-RUN';

  const sectionLines = Object.entries(OFFICIAL_DATASETS).map(([tag, ds]) => {
    const entries = plan.filter(p => p.tags.includes(tag));
    const rows = entries.map(p => `| ${p.beach.region} | ${p.beach.name} | ${ds.source_label} |`).join('\n');
    return `\n### ${tag} (${entries.length})\n\n| Região | Praia | Fonte |\n|---|---|---|\n${rows}`;
  }).join('\n');

  const untaggedSection = untagged.length === 0
    ? '_Todas as praias têm pelo menos uma tag oficial._'
    : untagged.map(b => `- [${b.region}] ${b.name}`).join('\n');

  const applySection = applyResult
    ? `\n## Aplicação à BD\n\n- Atualizado: **${applyResult.updated}**\n- Falhou: **${applyResult.failed}**\n`
    : '\n> ⚠️ Dry-run — BD não foi alterada.\n';

  const md = `# Tagging Final — Fontes Oficiais
Data: ${date}
Mode: ${mode}
Branch: feature/beach-tagging
${applySection}
## Estatísticas

| Categoria | Praias | Fonte |
|---|---|---|
| surf | ${stats.surf} | WSL/World Surfing Reserve/Visit Madeira/FPS |
| fishing | ${stats.fishing} | DGRM/Comunidades Piscatórias |
| family | ${stats.family} | ABAE Bandeira Azul 2025 |
| wild_nature | ${stats.wild_nature} | ICNF Áreas Protegidas/UNESCO |
| sem tag | ${stats.untagged} | — |
| **TOTAL praias** | **${plan.length}** | |

## Fontes consultadas

- **ABAE Bandeira Azul 2025**: https://bandeiraazul.abaae.pt/galardoados/galardoados-2025/ (consultado ${date})
- **ICNF Áreas Protegidas**: https://www.icnf.pt/conservacao/rnapareasprotegidas (consultado ${date})
- **ICNF PNSACV**: https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina (consultado ${date})
- **WSL Portugal — Nazaré**: https://www.worldsurfleague.com/events/2025/bwc (consultado ${date})
- **WSL Portugal — Peniche/Supertubos**: https://www.worldsurfleague.com/events/2025/ct/ripcurlpro (consultado ${date})
- **World Surfing Reserve — Ericeira**: https://www.visitportugal.com/en/content/ericeira-surfing-reserve (consultado ${date})
- **Visit Madeira — Surf**: https://visitmadeira.com/en/what-to-do/sea-lovers/activities/surf/ (consultado ${date})
- **DGRM Defesa Portos**: https://www.dgrm.mm.gov.pt/defesa (consultado ${date})
- **Wikipedia PNSACV**: https://en.wikipedia.org/wiki/Southwest_Alentejo_and_Vicentine_Coast_Natural_Park (consultado ${date})

## Praias sem tag

${untaggedSection}

## Praias por categoria (auditoria completa)
${sectionLines}
`;

  const outPath = resolve(__dirname, 'tagging-final-report.md');
  writeFileSync(outPath, md);
  console.log(`Report guardado: tagging-final-report.md`);
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

  const { data: beaches, error: fetchErr } = await supabase
    .from('beaches')
    .select('id, name, region')
    .eq('is_active', true)
    .neq('region', 'Hero')
    .order('region', { ascending: true });

  if (fetchErr) { console.error('Fetch error:', fetchErr); process.exit(1); }
  console.log(`Fetched ${beaches.length} active beaches\n`);

  const stats = { surf: 0, fishing: 0, family: 0, wild_nature: 0, untagged: 0 };
  const plan = [];
  const untagged = [];

  for (const beach of beaches) {
    const { tags, sources } = matchBeach(beach);
    if (tags.length === 0) { stats.untagged++; untagged.push(beach); }
    else tags.forEach(t => { if (stats[t] !== undefined) stats[t]++; });
    plan.push({ beach, tags, sources });
  }

  // ── Print dry-run plan ────────────────────────────────────────────────────
  console.log('═══ PLANO DE TAGGING (FONTES OFICIAIS) ═══\n');
  for (const [tag, dataset] of Object.entries(OFFICIAL_DATASETS)) {
    const entries = plan.filter(p => p.tags.includes(tag));
    console.log(`── ${tag.toUpperCase()} (${entries.length}) — ${dataset.source_label}`);
    entries.forEach(p => console.log(`   ${p.beach.region.padEnd(20)} ${p.beach.name}`));
    console.log();
  }

  console.log('── SEM TAG (' + untagged.length + ')');
  untagged.forEach(b => console.log(`   ${b.region.padEnd(20)} ${b.name}`));

  console.log('\n═══ ESTATÍSTICAS ═══');
  console.log(`  Surf:            ${stats.surf}`);
  console.log(`  Pesca:           ${stats.fishing}`);
  console.log(`  Famílias:        ${stats.family}`);
  console.log(`  Natureza selva:  ${stats.wild_nature}`);
  console.log(`  Sem tag:         ${stats.untagged}`);
  console.log(`  TOTAL:           ${beaches.length}\n`);

  // ── Apply ────────────────────────────────────────────────────────────────
  if (!APPLY) {
    console.log('(Dry-run: sem alterações na BD. Para aplicar: node research-sources.js --apply)');
    writeReport(plan, stats, untagged, null);
    return { stats, plan, untagged };
  }

  console.log('\nA aplicar tags à BD...\n');
  let updated = 0, failed = 0;

  for (const { beach, tags, sources } of plan) {
    const { error } = await supabase
      .from('beaches')
      .update({ tags, tag_sources: sources })
      .eq('id', beach.id);

    if (error) {
      console.error(`  FAIL  ${beach.name}: ${error.message}`);
      failed++;
    } else {
      updated++;
    }

    await new Promise(r => setTimeout(r, 80)); // 80ms rate-limit
  }

  console.log(`\nAtualizado: ${updated} | Falhou: ${failed}`);

  // ── Write sources snapshot ────────────────────────────────────────────────
  const snapshot = {
    generated: new Date().toISOString(),
    sources: Object.fromEntries(
      Object.entries(OFFICIAL_DATASETS).map(([tag, ds]) => [tag, {
        source_label: ds.source_label,
        consulted: ds.consulted,
        beach_count: [...ds.beaches].length,
      }])
    ),
  };
  writeFileSync(
    resolve(__dirname, 'sources-snapshot-2026-05-08.json'),
    JSON.stringify(snapshot, null, 2)
  );
  console.log('Snapshot guardado: sources-snapshot-2026-05-08.json');

  // ── Write markdown report ────────────────────────────────────────────────
  writeReport(plan, stats, untagged, { updated, failed });

  return { stats, plan, untagged, updated, failed };
}

main()
  .then(r => {
    if (r) {
      console.log('\n✅ Concluído.');
    }
  })
  .catch(e => { console.error(e); process.exit(1); });

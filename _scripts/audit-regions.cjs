require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Concelhos / locality → região correcta segundo NUTS II
const LOCALITY_TO_REGION = {
  // Algarve
  'aljezur': 'Algarve', 'lagos': 'Algarve', 'portimão': 'Algarve',
  'lagoa': 'Algarve', 'silves': 'Algarve', 'albufeira': 'Algarve',
  'loulé': 'Algarve', 'faro': 'Algarve', 'olhão': 'Algarve',
  'tavira': 'Algarve', 'vrsa': 'Algarve', 'castro marim': 'Algarve',
  'sagres': 'Algarve', 'vila do bispo': 'Algarve', 'monchique': 'Algarve',
  'arrifana': 'Algarve', 'bordeira': 'Algarve', 'amado': 'Algarve',
  'odeceixe': 'Algarve', 'castelejo': 'Algarve', 'cordoama': 'Algarve',
  'beliche': 'Algarve', 'tonel': 'Algarve', 'martinhal': 'Algarve',
  'marinha': 'Algarve', 'benagil': 'Algarve', 'carvoeiro': 'Algarve',
  'falésia': 'Algarve', 'rocha': 'Algarve', 'camilo': 'Algarve',
  'dona ana': 'Algarve',

  // Alentejo
  'odemira': 'Alentejo', 'milfontes': 'Alentejo',
  'zambujeira': 'Alentejo', 'sines': 'Alentejo',
  'são torpes': 'Alentejo', 'porto covo': 'Alentejo',
  'almograve': 'Alentejo', 'comporta': 'Alentejo',
  'melides': 'Alentejo', 'tróia': 'Alentejo',
  'galé': 'Alentejo', 'amoreira': 'Alentejo',

  // Lisboa e Setúbal
  'cascais': 'Lisboa e Setúbal', 'estoril': 'Lisboa e Setúbal',
  'guincho': 'Lisboa e Setúbal', 'carcavelos': 'Lisboa e Setúbal',
  'caparica': 'Lisboa e Setúbal', 'fonte da telha': 'Lisboa e Setúbal',
  'sesimbra': 'Lisboa e Setúbal', 'arrábida': 'Lisboa e Setúbal',
  'galapinhos': 'Lisboa e Setúbal', 'galapos': 'Lisboa e Setúbal',
  'figueirinha': 'Lisboa e Setúbal', 'portinho': 'Lisboa e Setúbal',
  'oeiras': 'Lisboa e Setúbal',

  // Oeste
  'ericeira': 'Oeste', 'mafra': 'Oeste', 'sintra': 'Oeste',
  'cabo da roca': 'Oeste', 'praia grande': 'Oeste',
  'maçãs': 'Oeste', 'adraga': 'Oeste', 'ursa': 'Oeste',
  'magoito': 'Oeste', 'baleal': 'Oeste',
  'peniche': 'Oeste', 'supertubos': 'Oeste',
  'foz do arelho': 'Oeste', 'são martinho': 'Oeste',
  'lourinhã': 'Oeste', 'porto novo': 'Oeste',

  // Centro
  'nazaré': 'Centro', 'são pedro de moel': 'Centro',
  'figueira da foz': 'Centro', 'cabedelo': 'Centro',
  'aveiro': 'Centro', 'costa nova': 'Centro',
  'são jacinto': 'Centro', 'mira': 'Centro',
  'tocha': 'Centro', 'murtinheira': 'Centro',
  'quiaios': 'Centro', 'são pedro': 'Centro',

  // Norte
  'matosinhos': 'Norte', 'foz do douro': 'Norte',
  'leça': 'Norte', 'póvoa do varzim': 'Norte',
  'vila do conde': 'Norte', 'esposende': 'Norte',
  'ofir': 'Norte', 'apúlia': 'Norte',
  'viana do castelo': 'Norte', 'âncora': 'Norte',
  'caminha': 'Norte', 'moledo': 'Norte',
  'caxinas': 'Norte', 'esmoriz': 'Norte',
  'espinho': 'Norte', 'miramar': 'Norte',

  // Madeira
  'madeira': 'Madeira', 'porto santo': 'Madeira',
  'machico': 'Madeira', 'funchal': 'Madeira',
  'jardim do mar': 'Madeira', 'paúl do mar': 'Madeira',
  'calheta': 'Madeira', 'seixal': 'Madeira',
  'porto moniz': 'Madeira', 'garajau': 'Madeira',
};

async function main() {
  const { data: beaches, error } = await supabase
    .from('beaches')
    .select('id, name, region, description')
    .eq('is_active', true)
    .neq('region', 'Hero');

  if (error) {
    console.error('Erro ao buscar praias:', error.message);
    process.exit(1);
  }

  const mismatches = [];

  for (const beach of beaches) {
    const nameLower = beach.name.toLowerCase();
    const descLower = (beach.description || '').toLowerCase();
    const combined = nameLower + ' ' + descLower;

    let suggestedRegion = null;
    let matchedKey = null;

    for (const [key, region] of Object.entries(LOCALITY_TO_REGION)) {
      if (combined.includes(key)) {
        suggestedRegion = region;
        matchedKey = key;
        break;
      }
    }

    if (suggestedRegion && suggestedRegion !== beach.region) {
      mismatches.push({
        id: beach.id,
        name: beach.name,
        currentRegion: beach.region,
        suggestedRegion,
        matchedKey,
      });
    }
  }

  console.log(`\n=== AUDITORIA DE REGIÕES ===`);
  console.log(`Total praias: ${beaches.length}`);
  console.log(`Mismatches potenciais: ${mismatches.length}\n`);

  if (mismatches.length === 0) {
    console.log('✅ Todas as regiões parecem correctas');
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.resolve(__dirname, 'region-audit-report.json'),
      JSON.stringify([], null, 2)
    );
    return;
  }

  console.log('Praias com região potencialmente incorrecta:');
  console.log('─'.repeat(100));
  for (const m of mismatches) {
    console.log(`  ${m.name}`);
    console.log(`    Actual: ${m.currentRegion}  →  Sugerido: ${m.suggestedRegion}  (matched: "${m.matchedKey}")`);
  }

  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.resolve(__dirname, 'region-audit-report.json'),
    JSON.stringify(mismatches, null, 2)
  );
  console.log(`\n✅ Report salvo em region-audit-report.json`);
}

main().catch(e => { console.error(e); process.exit(1); });

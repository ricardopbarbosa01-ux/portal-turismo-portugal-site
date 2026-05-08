require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Top 25 aprovado pelo Ricardo (Bloco B-1.5)
const TOP_25 = [
  { rank: 1,  name: 'Praia da Ursa' },
  { rank: 2,  name: 'Praia da Arrifana' },
  { rank: 3,  name: 'Praia de Odeceixe' },
  { rank: 4,  name: 'Praia da Bordeira' },
  { rank: 5,  name: 'Praia da Nazaré' },
  { rank: 6,  name: 'Praia das Maçãs' },
  { rank: 7,  name: 'Praia de Carcavelos' },
  { rank: 8,  name: 'Praia de Cascais' },
  { rank: 9,  name: 'Praia Grande' },
  { rank: 10, name: 'Praia da Marinha' },
  { rank: 11, name: 'Praia de Benagil' },
  { rank: 12, name: 'Praia de Ofir' },
  { rank: 13, name: 'Praia do Guincho' },
  { rank: 14, name: 'Zambujeira do Mar' },
  { rank: 15, name: 'Jardim do Mar' },
  { rank: 16, name: 'Praia do Amado' },
  { rank: 17, name: 'Praia da Cordoama' },
  { rank: 18, name: 'Praia da Falésia' },
  { rank: 19, name: 'Praia da Rocha' },
  { rank: 20, name: 'Praia de São Torpes' },
  { rank: 21, name: 'Praia do Zavial' },
  { rank: 22, name: 'Ilha de Tavira' },
  { rank: 23, name: 'Praia das Caxinas' },
  { rank: 24, name: 'Praia de Carvoeiro' },
  { rank: 25, name: 'Praia de Porto Santo' },
];

async function main() {
  console.log(`Applying editorial_rank to ${TOP_25.length} beaches...\n`);

  let updated = 0, failed = 0, notFound = 0;

  for (const entry of TOP_25) {
    const { data, error: selectErr } = await supabase
      .from('beaches')
      .select('id, name, region')
      .eq('is_active', true)
      .ilike('name', entry.name);

    if (selectErr) {
      console.error(`❌ ${entry.name}: ${selectErr.message}`);
      failed++;
      continue;
    }

    if (!data || data.length === 0) {
      console.error(`⚠️  ${entry.name}: not found in DB`);
      notFound++;
      continue;
    }

    if (data.length > 1) {
      console.warn(`⚠️  ${entry.name}: ${data.length} matches found, using first (${data[0].region})`);
    }

    const beach = data[0];
    const { error: updateErr } = await supabase
      .from('beaches')
      .update({ editorial_rank: entry.rank })
      .eq('id', beach.id);

    if (updateErr) {
      console.error(`❌ ${entry.name}: ${updateErr.message}`);
      failed++;
    } else {
      console.log(`✅ Rank ${String(entry.rank).padStart(2, '0')}: ${beach.name} (${beach.region})`);
      updated++;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`Updated:   ${updated}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Failed:    ${failed}`);
  console.log(`═══════════════════════════════════════════`);

  if (notFound > 0) {
    console.log(`\n⚠️  ${notFound} praias não foram encontradas — verificar nomes exactos na BD`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

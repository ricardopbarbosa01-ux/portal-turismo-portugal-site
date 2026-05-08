require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const reportPath = path.resolve(__dirname, 'region-audit-report.json');
  if (!fs.existsSync(reportPath)) {
    console.log('No region-audit-report.json found. Run audit-regions.cjs first.');
    return;
  }

  const mismatches = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (mismatches.length === 0) {
    console.log('No mismatches to fix.');
    return;
  }

  console.log(`Applying ${mismatches.length} region corrections...\n`);

  let updated = 0, failed = 0;
  for (const m of mismatches) {
    const { error } = await supabase
      .from('beaches')
      .update({ region: m.suggestedRegion })
      .eq('id', m.id);

    if (error) {
      console.error(`❌ ${m.name}: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ ${m.name}: ${m.currentRegion} → ${m.suggestedRegion}`);
      updated++;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nUpdated: ${updated}  Failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });

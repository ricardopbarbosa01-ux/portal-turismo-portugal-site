// Audit script — finds the 10 priority beaches and shows current state
// Run: node _scripts/audit-beaches.js

const SUPABASE_URL = 'https://glupdjvdvunogkqgxoui.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw';

const PRIORITY = [
  'Nazaré', 'Guincho', 'Comporta', 'Marinha', 'Sagres',
  'São Rafael', 'Vau', 'Furnas', 'Porto Moniz', 'Milfontes'
];

async function main() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/beaches?select=*&order=name&limit=3`,
    { headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY } }
  );
  const all = await res.json();

  if (!Array.isArray(all)) { console.error('Error:', all); process.exit(1); }
  // Print schema of first record
  if (all.length > 0) {
    console.log('SCHEMA (first record keys):', Object.keys(all[0]).join(', '));
    console.log('\nFirst record sample:');
    console.log(JSON.stringify(all[0], null, 2));
  }
}
main().catch(console.error);

/**
 * test-worldtides.js — validação local da API WorldTides
 * Usa uma única praia (Nazaré) para verificar que a key funciona.
 *
 * Uso:
 *   WORLDTIDES_KEY=<a-tua-key> node _scripts/test-worldtides.js
 *
 * Ou editar WT_KEY abaixo para teste pontual (não commitar com key real).
 */

const WT_KEY = process.env.WORLDTIDES_KEY || 'COLOCA_AQUI_A_TUA_KEY';

// Nazaré como praia de teste
const LAT = 39.6016;
const LON = -9.0748;

async function main() {
  const url = new URL('https://www.worldtides.info/api/v3');
  url.searchParams.set('extremes', '');
  url.searchParams.set('lat',  String(LAT));
  url.searchParams.set('lon',  String(LON));
  url.searchParams.set('days', '3');
  url.searchParams.set('key',  WT_KEY);

  console.log('[test] GET', url.toString().replace(WT_KEY, '***'));

  const res = await fetch(url.toString());
  const json = await res.json();

  if (!res.ok || json.error) {
    console.error('[ERRO]', json);
    process.exit(1);
  }

  console.log('\n[OK] Status:', json.status);
  console.log('[OK] Extremes encontrados:', json.extremes?.length ?? 0);
  console.log('\nPrimeiras 4 marés:');
  (json.extremes || []).slice(0, 4).forEach(e => {
    console.log(`  ${e.date} ${e.time}  ${e.type.padEnd(4)}  ${e.height.toFixed(2)} m`);
  });

  console.log('\n[OK] API WorldTides funciona. Pronto para Fase A.');
}

main().catch(e => { console.error(e); process.exit(1); });

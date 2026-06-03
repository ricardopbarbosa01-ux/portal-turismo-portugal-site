import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: beaches } = await supabase
    .from('beaches')
    .select('name, region, description')
    .eq('is_active', true)
    .neq('region', 'Hero');

  console.log(`Analyzing ${beaches.length} beaches\n`);

  const lexicon = {
    fishing: {
      keywords: ['pesca', 'pescador', 'pescadores', 'pesqueiro', 'pesqueira', 'piscatório', 'piscatória',
        'cana', 'anzol', 'rede', 'redes', 'lota', 'isco', 'sargo', 'robalo', 'dourada', 'safio',
        'corvina', 'porto de pesca', 'embarcação', 'embarcações', 'barco de pesca'],
    },
    wild_nature: {
      keywords: ['selvagem', 'selvagens', 'isolada', 'isoladas', 'remota', 'remotas', 'deserta',
        'desertas', 'recanto', 'recôndita', 'esquecida', 'virgem', 'virgens', 'intocada',
        'reserva', 'parque natural', 'protegida', 'protegidas', 'preservada', 'falésia',
        'falésias', 'arriba', 'arribas', 'gruta', 'grutas', 'pouco conhecida', 'pouco frequentada',
        'sossegada', 'sossegadas', 'natureza', 'duna', 'dunas', 'agreste', 'agrestes',
        'difícil acesso', 'inacessível', 'sem infraestrutura', 'sem infra-estrutura', 'sem apoio de praia',
        'lagoa', 'pinhal', 'biodiversidade', 'fauna', 'flora', 'aves', 'natura 2000', 'quietude',
        'quieto', 'quieta', 'escondida', 'escondidas', 'fora do roteiro', 'rústica', 'rústicas'],
    },
    surf: {
      keywords: ['surf', 'surfista', 'surfistas', 'onda', 'ondas', 'bodyboard', 'windsurf', 'kitesurf',
        'swell', 'swells', 'ondulação', 'point break', 'beach break', 'reef break', 'consistente',
        'consistentes', 'tubo', 'tubos', 'offshore', 'onshore', 'rebentação', 'crista',
        'potente', 'forte ondulação', 'surf spot', 'waveski', 'longboard'],
    },
    family: {
      keywords: ['família', 'famílias', 'criança', 'crianças', 'menino', 'meninos', 'abrigada',
        'abrigadas', 'calma', 'calmas', 'rasa', 'rasas', 'laguna', 'lagunas', 'piscina natural',
        'piscinas naturais', 'sem ondas', 'ondas suaves', 'segura', 'seguras', 'tranquila',
        'tranquilas', 'nadador-salvador', 'salva-vidas', 'parque infantil', 'balneário',
        'sombreiros', 'sombreiros', 'esplanada', 'apoio de praia', 'concessão balnear',
        'acessível', 'acessíveis', 'facilmente', 'estacionamento', 'rampa', 'corrimão',
        'fácil acesso', 'banho seguro'],
    },
  };

  for (const [cat, { keywords }] of Object.entries(lexicon)) {
    console.log(`\n=== ${cat.toUpperCase()} ===`);
    const counts = {};
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[ ]/g, '\\s+');
      let rx;
      try {
        rx = new RegExp(`${escaped}`, 'gi');
      } catch {
        continue;
      }
      let total = 0;
      const beachesWithIt = new Set();
      for (const b of beaches) {
        if (!b.description) continue;
        const m = b.description.match(rx);
        if (m) { total += m.length; beachesWithIt.add(b.name); }
      }
      if (total > 0) counts[kw] = { occurrences: total, beaches: beachesWithIt.size };
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1].beaches - a[1].beaches);
    for (const [kw, data] of sorted) {
      console.log(`  "${kw}": ${data.beaches} praias (${data.occurrences} occ)`);
    }
    if (sorted.length === 0) console.log('  (nenhum hit)');
  }

  // Full context for top keywords per category to spot false positives
  console.log('\n\n=== CONTEXTO: "pesca" nas descrições ===');
  for (const b of beaches) {
    if (!b.description) continue;
    const idx = b.description.toLowerCase().indexOf('pesca');
    if (idx === -1) continue;
    const start = Math.max(0, idx - 60);
    const end = Math.min(b.description.length, idx + 100);
    console.log(`  [${b.region}] ${b.name}:`);
    console.log(`    "...${b.description.substring(start, end)}..."`);
  }

  console.log('\n\n=== CONTEXTO: "selvagem" nas descrições ===');
  for (const b of beaches) {
    if (!b.description) continue;
    const idx = b.description.toLowerCase().indexOf('selvagem');
    if (idx === -1) continue;
    const start = Math.max(0, idx - 40);
    const end = Math.min(b.description.length, idx + 80);
    console.log(`  [${b.region}] ${b.name}:`);
    console.log(`    "...${b.description.substring(start, end)}..."`);
  }

  console.log('\n\n=== ZERO SINAIS — praias sem keywords óbvias ===');
  const generic = beaches.filter(b => {
    if (!b.description) return false;
    const d = b.description.toLowerCase();
    return ![/pesca|pescador/, /surf|onda|swell|bodyboard/, /família|criança|abrigada|laguna|calma|rasa|segura/, /selvagem|reserva|isolada|falésia|natural|escondida|tranquila|sossegada/].some(rx => rx.test(d));
  });
  console.log(`${generic.length} praias com zero sinais:`);
  for (const b of generic) {
    console.log(`  [${b.region}] ${b.name}`);
    console.log(`    "${b.description.substring(0, 180)}..."`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

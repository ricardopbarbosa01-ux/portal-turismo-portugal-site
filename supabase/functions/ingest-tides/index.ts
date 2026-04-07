/**
 * ingest-tides — Supabase Edge Function
 *
 * Chama a WorldTides API para cada praia com coordenadas,
 * guarda os próximos 7 dias de marés na tabela `tides`.
 *
 * Trigger: cron externo (cron-job.org) ou pg_cron → POST /functions/v1/ingest-tides
 *   com header Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Secrets necessários (Supabase → Settings → Edge Functions → Secrets):
 *   WORLDTIDES_KEY  — chave da WorldTides API (worldtides.info)
 *
 * Sem deploy automático. Sem execução local.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WT_KEY       = Deno.env.get('WORLDTIDES_KEY')!;

const DAYS_AHEAD = 7;       // janela de ingestão
const BATCH_SIZE = 5;       // praias por lote (evita rate-limit)
const DELAY_MS   = 600;     // ms entre lotes

const db = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Beach {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface WTExtreme {
  dt: number;       // unix timestamp UTC
  date: string;     // ISO 8601
  time: string;     // "HH:MM"
  height: number;
  type: 'High' | 'Low';
}

interface TideRow {
  beach_id: string;
  date: string;
  time: string;
  height_m: number;
  type: 'high' | 'low';
  source: string;
  fetched_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchTidesForBeach(beach: Beach): Promise<TideRow[]> {
  const url = new URL('https://www.worldtides.info/api/v3');
  url.searchParams.set('extremes', '');
  url.searchParams.set('lat',  String(beach.latitude));
  url.searchParams.set('lon',  String(beach.longitude));
  url.searchParams.set('days', String(DAYS_AHEAD));
  url.searchParams.set('key',  WT_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`[WT] ${beach.name}: HTTP ${res.status}`);
    return [];
  }

  const json = await res.json();

  if (!json.extremes || !Array.isArray(json.extremes)) {
    console.warn(`[WT] ${beach.name}: sem extremes`);
    return [];
  }

  const now = new Date().toISOString();

  return (json.extremes as WTExtreme[]).map(e => ({
    beach_id:   beach.id,
    date:       e.date.slice(0, 10),   // YYYY-MM-DD
    time:       e.time.slice(0, 5) + ':00',  // HH:MM:SS
    height_m:   Math.round(e.height * 100) / 100,
    type:       e.type.toLowerCase() as 'high' | 'low',
    source:     'worldtides',
    fetched_at: now,
  }));
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Buscar todas as praias com coordenadas
    const { data: beaches, error: beachErr } = await db
      .from('beaches')
      .select('id, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (beachErr) throw beachErr;

    console.log(`[ingest-tides] ${beaches!.length} praias com coordenadas`);

    let inserted = 0;
    let skipped  = 0;
    const errors: string[] = [];

    // 2. Processar em lotes
    for (let i = 0; i < beaches!.length; i += BATCH_SIZE) {
      const batch = (beaches as Beach[]).slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (beach) => {
        try {
          const rows = await fetchTidesForBeach(beach);
          if (!rows.length) { skipped++; return; }

          // Upsert — ignora duplicados (UNIQUE beach_id, date, time)
          const { error: upsertErr } = await db
            .from('tides')
            .upsert(rows, { onConflict: 'beach_id,date,time', ignoreDuplicates: true });

          if (upsertErr) {
            errors.push(`${beach.name}: ${upsertErr.message}`);
          } else {
            inserted += rows.length;
            console.log(`[OK] ${beach.name}: ${rows.length} marés`);
          }
        } catch (e) {
          errors.push(`${beach.name}: ${(e as Error).message}`);
        }
      }));

      if (i + BATCH_SIZE < beaches!.length) await sleep(DELAY_MS);
    }

    // 3. Limpar marés antigas (>3 dias passados)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);
    await db.from('tides').delete().lt('date', cutoff.toISOString().slice(0, 10));

    const result = {
      ok: true,
      beaches_processed: beaches!.length,
      tide_rows_inserted: inserted,
      skipped,
      errors,
    };

    console.log('[ingest-tides] done:', result);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('[ingest-tides] fatal:', e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

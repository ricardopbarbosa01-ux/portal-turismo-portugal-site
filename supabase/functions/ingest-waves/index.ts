/**
 * ingest-waves — Supabase Edge Function  [FASE B — NÃO ACTIVAR AINDA]
 *
 * Chama a Open-Meteo Marine API (100% gratuita, sem API key)
 * para cada praia com coordenadas. Guarda estado do mar na tabela `waves`.
 *
 * Open-Meteo Marine: https://marine-api.open-meteo.com/v1/marine
 * Variáveis: wave_height, wave_direction, wave_period, swell_wave_height
 *
 * Trigger: cron externo → POST /functions/v1/ingest-waves
 *
 * Sem deploy automático. Sem execução local.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const db = createClient(SUPABASE_URL, SERVICE_KEY);

interface Beach {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface WaveRow {
  beach_id:        string;
  datetime:        string;   // ISO 8601 UTC
  wave_height_m:   number | null;
  wave_period_s:   number | null;
  wave_direction:  number | null;
  swell_height_m:  number | null;
  source:          string;
  fetched_at:      string;
}

async function fetchWavesForBeach(beach: Beach): Promise<WaveRow[]> {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude',  String(beach.latitude));
  url.searchParams.set('longitude', String(beach.longitude));
  url.searchParams.set('hourly',    [
    'wave_height',
    'wave_direction',
    'wave_period',
    'swell_wave_height',
  ].join(','));
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'UTC');

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`[OM] ${beach.name}: HTTP ${res.status}`);
    return [];
  }

  const json = await res.json();
  const h = json.hourly;
  if (!h || !h.time) return [];

  const now = new Date().toISOString();

  return (h.time as string[]).map((dt: string, i: number) => ({
    beach_id:       beach.id,
    datetime:       dt + ':00Z',
    wave_height_m:  h.wave_height?.[i]  ?? null,
    wave_period_s:  h.wave_period?.[i]  ?? null,
    wave_direction: h.wave_direction?.[i] ?? null,
    swell_height_m: h.swell_wave_height?.[i] ?? null,
    source:         'open-meteo-marine',
    fetched_at:     now,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { data: beaches, error: beachErr } = await db
      .from('beaches')
      .select('id, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (beachErr) throw beachErr;

    let inserted = 0;
    const errors: string[] = [];

    for (const beach of beaches as Beach[]) {
      try {
        const rows = await fetchWavesForBeach(beach);
        if (!rows.length) continue;

        const { error } = await db
          .from('waves')
          .upsert(rows, { onConflict: 'beach_id,datetime', ignoreDuplicates: true });

        if (error) errors.push(`${beach.name}: ${error.message}`);
        else { inserted += rows.length; }
      } catch (e) {
        errors.push(`${beach.name}: ${(e as Error).message}`);
      }
      // Open-Meteo não precisa de rate-limit (é gratuito e generoso)
    }

    // Limpar previsões antigas
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    await db.from('waves').delete().lt('datetime', cutoff.toISOString());

    return new Response(JSON.stringify({ ok: true, inserted, errors }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set([
  'https://www.portalturismoportugal.com',
  'http://localhost:8080',
])

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY') ?? ''

// In-memory rate limit: IP → { count, windowStart }
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.portalturismoportugal.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  let query: string
  try {
    const body = await req.json()
    query = String(body?.query ?? '').trim().slice(0, 100)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if (!query) {
    return new Response(JSON.stringify({ error: 'query is required' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  console.log('[pexels-search] query:', query, 'ip:', ip)

  const db = createClient(SUPABASE_URL, SERVICE_ROLE)

  // Check cache
  const { data: cached } = await db
    .from('image_cache')
    .select('url, photographer')
    .eq('query', query)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (cached) {
    console.log('[pexels-search] cache hit:', query)
    return new Response(JSON.stringify({ url: cached.url, photographer: cached.photographer, source: 'pexels' }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Fetch from Pexels
  if (!PEXELS_API_KEY) {
    console.error('[pexels-search] PEXELS_API_KEY not configured')
    return new Response(JSON.stringify({ error: 'Image service not configured' }), {
      status: 503, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  let url: string
  let photographer: string
  try {
    const encodedQuery = encodeURIComponent(query)
    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    )
    if (!pexelsRes.ok) throw new Error(`Pexels HTTP ${pexelsRes.status}`)
    const pexelsData = await pexelsRes.json()
    const photo = pexelsData?.photos?.[0]
    if (!photo) throw new Error('No photos returned')
    url = photo.src.large
    photographer = photo.photographer ?? 'Unknown'
  } catch (err) {
    console.error('[pexels-search] Pexels fetch error:', err)
    return new Response(JSON.stringify({ error: 'Image lookup failed' }), {
      status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Write to cache (upsert — handles repeated queries)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await db.from('image_cache').upsert({ query, url, photographer, source: 'pexels', expires_at: expiresAt })

  console.log('[pexels-search] cache miss — fetched from Pexels:', query, '->', url)

  return new Response(JSON.stringify({ url, photographer, source: 'pexels' }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  })
})

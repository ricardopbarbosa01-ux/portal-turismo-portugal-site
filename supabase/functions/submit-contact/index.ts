import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': 'https://www.portalturismoportugal.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, apikey'
}

const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY') ?? ''
// Lote H2 (09/10/2026): aviso por email. Antes a funcao so gravava em contact_messages -> nada chegava a caixa de correio.
// Usa o mesmo Resend das outras funcoes (send-partner-alert). Destino: secret CONTACT_NOTIFY_TO (se existir) ou ola@.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_TO = (Deno.env.get('CONTACT_NOTIFY_TO') ?? 'ola@portalturismoportugal.com').split(',').map(s => s.trim()).filter(Boolean)
const FROM = 'Portal Turismo Portugal <ola@portalturismoportugal.com>'

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c])
}

async function notify(fields: Record<string, unknown>): Promise<void> {
  if (!RESEND_API_KEY) { console.error('RESEND_API_KEY nao configurada: mensagem gravada mas sem email'); return }
  const rows = Object.entries(fields)
    .filter(([k]) => !['message'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px">
<h2 style="color:#0a3d6b;margin:0 0 12px">Nova mensagem do formulario de contacto</h2>
<p style="white-space:pre-wrap;background:#f6f3ec;border-radius:8px;padding:14px;margin:0 0 16px">${esc(fields.message)}</p>
<table style="font-size:13px;border-collapse:collapse">${rows}</table>
<p style="font-size:12px;color:#888;margin-top:16px">Responder a este email responde diretamente ao visitante. Copia guardada na tabela contact_messages (Supabase).</p></div>`
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000)
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: ctl.signal,
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: NOTIFY_TO, reply_to: String(fields.email || ''),
        subject: `Contacto: ${String(fields.subject || 'sem assunto').slice(0, 60)} — ${String(fields.name || '').slice(0, 40)}`,
        html
      })
    })
    if (!r.ok) console.error('Resend falhou:', r.status, await r.text())
  } catch (e) { console.error('Resend erro:', e) } finally { clearTimeout(t) }
}
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.error('CRITICAL: TURNSTILE_SECRET_KEY not configured')
    return false
  }
  if (!token) return false

  const formData = new FormData()
  formData.append('secret', TURNSTILE_SECRET)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  return data.success === true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const body = await req.json()
    const { turnstileToken, ...fields } = body

    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || ''

    if (!await verifyTurnstile(turnstileToken, ip)) {
      return new Response(JSON.stringify({ error: 'Captcha verification failed' }), {
        status: 403, headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }

    const required = ['name', 'email', 'subject', 'message']
    for (const k of required) {
      if (!fields[k] || typeof fields[k] !== 'string' || !fields[k].trim()) {
        return new Response(JSON.stringify({ error: 'Missing required field: ' + k }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        })
      }
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE)

    const { error } = await supabaseAdmin.from('contact_messages').insert([fields])

    if (error) throw error

    await notify(fields) // falha no email nao bloqueia: a mensagem ja esta gravada

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error('submit-contact error:', e)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }
})

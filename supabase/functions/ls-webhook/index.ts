// Security: webhook signature is REQUIRED.
// Both empty secret and missing signature header reject the request (fail-closed).
// Fix applied 2026-04-29 — addresses audit finding (Vector A + Vector B bypass).
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

async function verifySignature(body: string, sig: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    console.error('CRITICAL: LEMONSQUEEZY_WEBHOOK_SECRET not configured — rejecting all webhooks')
    return false
  }
  if (!sig) return false
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const sigBytes = new Uint8Array(sig.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body))
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('x-signature') ?? ''

  if (!await verifySignature(body, sig)) {
    return new Response('Invalid signature', { status: 401 })
  }

  let event: any
  try { event = JSON.parse(body) } catch { return new Response('Bad JSON', { status: 400 }) }

  const eventName = event.meta?.event_name ?? ''
  const allowed = [
    'subscription_created',
    'subscription_updated',
    'subscription_payment_success',
    'subscription_cancelled',
    'subscription_expired',
  ]
  if (!allowed.includes(eventName)) return new Response('Ignored', { status: 200 })

  const attrs = event.data?.attributes ?? {}
  const email = attrs.user_email ?? attrs.customer_email ?? ''
  const status = attrs.status ?? null
  const endsAt = attrs.ends_at ?? attrs.renews_at ?? null
  const subscriptionId = String(event.data?.id ?? '')
  const customerId = String(attrs.customer_id ?? '')

  // Determinar plano com base no evento e status
  let plan: 'pro' | 'free' | null = null
  if (eventName === 'subscription_created' || eventName === 'subscription_payment_success') {
    plan = 'pro'
  } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    plan = 'free'
  } else if (eventName === 'subscription_updated') {
    if (!status) {
      console.log(`ls-webhook: event=${eventName} status=undefined → skipping (no plan change)`)
      return new Response('OK', { status: 200 })
    }
    const freeStatuses = ['cancelled', 'expired', 'past_due', 'unpaid', 'paused']
    plan = freeStatuses.includes(status) ? 'free' : status === 'active' ? 'pro' : null
    if (plan === null) {
      console.log(`ls-webhook: event=${eventName} status=${status} → unrecognised status, skipping`)
      return new Response('OK', { status: 200 })
    }
  }

  if (!email) return new Response('No email in payload', { status: 400 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Encontrar user pelo email (case-insensitive, sem carregar todos os users)
  const emailLower = email.toLowerCase().trim()
  const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 })

  // Fallback: procurar em todas as páginas se necessário
  let user = users?.find((u: any) => u.email?.toLowerCase() === emailLower)

  if (!user) {
    // Tentar pesquisa directa via SQL como fallback
    const { data: directUser } = await supabase
      .from('auth.users')
      .select('id, email')
      .ilike('email', emailLower)
      .single()

    if (directUser) {
      // Encontrou via SQL, buscar o user completo
      const { data: { user: fullUser } } = await supabase.auth.admin.getUserById(directUser.id)
      user = fullUser
    }
  }

  if (!user) {
    console.warn('ls-webhook: user not found for email', emailLower)
    return new Response('User not found', { status: 404 })
  }

  console.log(`ls-webhook: event=${eventName} status=${status} → plan=${plan}`)

  // Actualizar app_metadata (seguro — não editável pelo cliente)
  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { plan }
  })

  // Escrever na tabela profiles
  await supabase.from('profiles').upsert({
    id: user.id,
    plan,
    plan_expires_at: endsAt,
    ls_subscription_id: subscriptionId,
    ls_customer_id: customerId,
    updated_at: new Date().toISOString()
  })

  return new Response('OK', { status: 200 })
})

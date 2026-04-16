import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

async function verifySignature(body: string, sig: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !sig) return true
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
  const allowed = ['subscription_created', 'subscription_updated', 'subscription_payment_success']
  if (!allowed.includes(eventName)) return new Response('Ignored', { status: 200 })

  const attrs = event.data?.attributes ?? {}
  const email = attrs.user_email ?? attrs.customer_email ?? ''
  const status = attrs.status ?? 'active'
  const endsAt = attrs.ends_at ?? attrs.renews_at ?? null
  const subscriptionId = String(event.data?.id ?? '')
  const customerId = String(attrs.customer_id ?? '')
  const isPro = status === 'active'

  if (!email) return new Response('No email in payload', { status: 400 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Encontrar user pelo email
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const user = users?.find((u: any) => u.email === email)

  if (!user) {
    console.warn('ls-webhook: user not found for email', email)
    return new Response('User not found', { status: 404 })
  }

  // Actualizar app_metadata (seguro — não editável pelo cliente)
  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { plan: isPro ? 'pro' : 'free' }
  })

  // Escrever na tabela profiles
  await supabase.from('profiles').upsert({
    id: user.id,
    plan: isPro ? 'pro' : 'free',
    plan_expires_at: endsAt,
    ls_subscription_id: subscriptionId,
    ls_customer_id: customerId,
    updated_at: new Date().toISOString()
  })

  console.log('ls-webhook: updated user', email, 'plan =', isPro ? 'pro' : 'free')
  return new Response('OK', { status: 200 })
})

/**
 * ls-webhook — LemonSqueezy Webhook Handler
 *
 * Receives purchase/subscription events from LemonSqueezy,
 * validates the HMAC-SHA256 signature, finds the buyer in Supabase Auth,
 * and marks user_metadata.role = "pro".
 *
 * Events handled:
 *   order_created                  — one-time purchase confirmed
 *   subscription_created           — new subscription activated
 *   subscription_payment_success   — recurring payment succeeded
 *
 * Secrets required (Supabase Dashboard → Edge Functions → Secrets):
 *   LS_WEBHOOK_SECRET          — LemonSqueezy → Settings → Webhooks → Signing Secret
 *   SUPABASE_SERVICE_ROLE_KEY  — Supabase → Settings → API → service_role key
 *
 * Deploy (from project root):
 *   npx supabase functions deploy ls-webhook --no-verify-jwt
 *
 * Webhook URL to paste in LemonSqueezy:
 *   https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/ls-webhook
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LS_SECRET    = Deno.env.get('LS_WEBHOOK_SECRET')!;

/** Events that trigger a Pro activation */
const ACTIVATION_EVENTS = new Set([
  'order_created',
  'subscription_created',
  'subscription_payment_success',
]);

// ── Signature validation ───────────────────────────────────────────────────────
// LemonSqueezy signs the raw body with HMAC-SHA-256 using the webhook signing secret.
// Header: X-Signature (lowercase hex digest)
async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(mac))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ── Main handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 1. Read raw body (must be before any .json() call)
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';

  // 2. Validate signature
  if (!LS_SECRET || !signature) {
    console.error('ls-webhook: missing LS_WEBHOOK_SECRET or X-Signature header');
    return new Response('Forbidden', { status: 403 });
  }
  const valid = await verifySignature(rawBody, signature, LS_SECRET);
  if (!valid) {
    console.error('ls-webhook: invalid signature — possible spoofed request');
    return new Response('Invalid signature', { status: 400 });
  }

  // 3. Parse payload
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? '';

  // 4. Skip events we don't handle — always return 200 so LS doesn't retry
  if (!ACTIVATION_EVENTS.has(eventName)) {
    console.log(`ls-webhook: ignoring event "${eventName}"`);
    return new Response('OK', { status: 200 });
  }

  // 5. Extract buyer email from LemonSqueezy payload
  //    Location: data.attributes.user_email (orders & subscriptions)
  const email: string | undefined =
    payload?.data?.attributes?.user_email ??
    payload?.data?.attributes?.customer_email;

  if (!email) {
    console.error(`ls-webhook: no buyer email in payload for event "${eventName}"`);
    return new Response('OK', { status: 200 }); // malformed event — don't trigger retry
  }

  // 6. Find Supabase user by email via Admin REST API
  //    Using the REST endpoint directly is more efficient than listUsers() for large user bases
  const searchRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
    }
  );

  if (!searchRes.ok) {
    console.error(`ls-webhook: auth admin search failed — HTTP ${searchRes.status}`);
    return new Response('Internal Error', { status: 500 }); // 5xx → LS will retry
  }

  const searchData = await searchRes.json();
  const user = searchData?.users?.[0];

  if (!user) {
    // User bought without creating a portal account first.
    // Logged for manual follow-up — don't 5xx so LS doesn't retry forever.
    console.warn(`ls-webhook: no Supabase user for email "${email}" (event: ${eventName}) — manual activation may be needed`);
    return new Response('OK', { status: 200 });
  }

  // 7. Update user_metadata: preserve existing fields, add Pro fields
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,       // preserve existing metadata (full_name, etc.)
      role: 'pro',
      pro_status: 'active',
      pro_source: 'lemonsqueezy',
      pro_activated_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error(`ls-webhook: failed to update user ${user.id} — ${error.message}`);
    return new Response('Internal Error', { status: 500 }); // 5xx → LS retries
  }

  console.log(`ls-webhook: ✓ user ${user.id} (${email}) activated Pro via "${eventName}"`);
  return new Response('OK', { status: 200 });
});

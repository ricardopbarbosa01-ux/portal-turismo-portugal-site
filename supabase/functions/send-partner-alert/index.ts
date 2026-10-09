import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': 'https://www.portalturismoportugal.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'Portal Turismo Portugal <ola@portalturismoportugal.com>'
const ADMIN_EMAIL = 'ola@portalturismoportugal.com'

// Escapa texto vindo do formulário antes de o pôr no HTML dos emails
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const raw = await req.json()
  const email = String(raw.email ?? '').trim()
  const [negocio, contacto, tipo, plano, regiao, localizacao, mensagem] = [raw.negocio, raw.contacto, raw.tipo, raw.plano, raw.regiao, raw.localizacao, raw.mensagem].map(esc)
  if (!email) return new Response('No email', { status: 400, headers: CORS })

  // Email de confirmação para o parceiro
  const partnerHtml = `
<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#1B3A6B;padding:32px 40px;text-align:center">
      <h1 style="color:#C9A84C;margin:0;font-size:24px">Portal Turismo Portugal</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1B3A6B;margin:0 0 16px">Pedido recebido! 🤝</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 24px">
        Recebemos o pedido de parceria do <strong>${negocio}</strong>.
        Vamos analisar o pedido e responder por email em até 5 dias úteis, com a proposta.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:0 0 24px">
        <p style="margin:0 0 12px;font-weight:600;color:#1B3A6B">O que acontece a seguir:</p>
        <ol style="margin:0;padding:0 0 0 20px;color:#444;line-height:2;font-size:14px">
          <li>Analisamos o pedido e montamos a pré-visualização</li>
          <li>Enviamos a proposta por email</li>
          <li>Se aceitar, publicamos e os primeiros 30 dias são grátis</li>
        </ol>
      </div>
    </div>
    <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px;margin:0">© 2026 Portal Turismo Portugal</p>
    </div>
  </div>
</body>
</html>`

  // Notificação interna
  const adminHtml = `<h3>Novo lead de parceiro</h3>
<p><b>Negócio:</b> ${negocio}<br><b>Contacto:</b> ${contacto}<br>
<b>Email:</b> ${email}<br><b>Tipo:</b> ${tipo}<br>
<b>Plano:</b> ${plano}<br><b>Região:</b> ${regiao}<br><b>Localidade:</b> ${localizacao}</p>
<p><b>Mensagem:</b><br>${mensagem}</p>
<p><a href="https://www.portalturismoportugal.com/dashboard.html">Ver no dashboard</a></p>`

  await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], subject: `Pedido de parceria recebido — ${raw.negocio ?? ''}`, html: partnerHtml })
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject: `Novo parceiro — ${raw.negocio ?? ''} (${raw.plano ?? ''})`, html: adminHtml })
    })
  ])

  return new Response('OK', { status: 200, headers: CORS })
})

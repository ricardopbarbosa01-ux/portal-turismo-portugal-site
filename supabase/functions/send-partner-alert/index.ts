import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'Portugal Travel Hub <ola@portalturismoportugal.com>'
const ADMIN_EMAIL = 'parceiros@portalturismoportugal.com'

serve(async (req) => {
  const { negocio, contacto, email, tipo, plano, regiao, mensagem } = await req.json()
  if (!email) return new Response('No email', { status: 400 })

  // Email de confirmação para o parceiro
  const partnerHtml = `
<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#1B3A6B;padding:32px 40px;text-align:center">
      <h1 style="color:#C9A84C;margin:0;font-size:24px">Portugal Travel Hub</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1B3A6B;margin:0 0 16px">Pedido recebido! 🤝</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 24px">
        Recebemos o pedido de parceria do <strong>${negocio}</strong>.
        A nossa equipa vai analisar o perfil e contactar-te em até 48 horas.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:0 0 24px">
        <p style="margin:0 0 12px;font-weight:600;color:#1B3A6B">O que acontece a seguir:</p>
        <ol style="margin:0;padding:0 0 0 20px;color:#444;line-height:2;font-size:14px">
          <li>A equipa analisa o perfil do negócio</li>
          <li>Enviamos uma proposta personalizada</li>
          <li>Activação da presença no portal em 5 dias úteis</li>
        </ol>
      </div>
    </div>
    <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px;margin:0">© 2026 Portugal Travel Hub</p>
    </div>
  </div>
</body>
</html>`

  // Notificação interna
  const adminHtml = `<h3>Novo lead de parceiro</h3>
<p><b>Negócio:</b> ${negocio}<br><b>Contacto:</b> ${contacto}<br>
<b>Email:</b> ${email}<br><b>Tipo:</b> ${tipo}<br>
<b>Plano:</b> ${plano}<br><b>Região:</b> ${regiao}</p>
<p><b>Mensagem:</b><br>${mensagem}</p>
<p><a href="https://www.portalturismoportugal.com/dashboard.html">Ver no dashboard</a></p>`

  await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], subject: `Pedido de parceria recebido — ${negocio}`, html: partnerHtml })
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject: `Novo parceiro — ${negocio} (${plano})`, html: adminHtml })
    })
  ])

  return new Response('OK', { status: 200 })
})

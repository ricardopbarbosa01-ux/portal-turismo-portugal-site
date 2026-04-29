import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': 'https://www.portalturismoportugal.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'Portugal Travel Hub <ola@portalturismoportugal.com>'
const ADMIN_EMAIL = 'parceiros@portalturismoportugal.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const { nome, email, regiao, data_inicio, data_fim, orcamento, interesses } = await req.json()
  if (!email) return new Response('No email', { status: 400, headers: CORS })

  const interessesStr = Array.isArray(interesses) ? interesses.join(', ') : (interesses || 'Não especificado')
  const firstName = nome?.split(' ')[0] || 'Explorador'

  // Email para o utilizador
  const userHtml = `
<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#1B3A6B;padding:32px 40px;text-align:center">
      <h1 style="color:#C9A84C;margin:0;font-size:24px">Portugal Travel Hub</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1B3A6B;margin:0 0 16px">Pedido recebido, ${firstName}! 🗓️</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 24px">
        Recebemos o teu pedido de planeamento. A nossa equipa vai preparar
        um plano personalizado e enviá-lo em até 24 horas.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:0 0 24px">
        <p style="margin:0 0 12px;font-weight:600;color:#1B3A6B">Resumo do teu pedido:</p>
        <table style="width:100%;border-collapse:collapse;color:#444;font-size:14px">
          <tr><td style="padding:6px 0;color:#999">Região</td><td style="padding:6px 0">${regiao || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#999">Datas</td><td style="padding:6px 0">${data_inicio || '—'} → ${data_fim || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#999">Orçamento</td><td style="padding:6px 0">${orcamento || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#999">Interesses</td><td style="padding:6px 0">${interessesStr}</td></tr>
        </table>
      </div>
      <p style="color:#666;font-size:14px">Tens dúvidas? Responde a este email.</p>
    </div>
    <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px;margin:0">© 2026 Portugal Travel Hub</p>
    </div>
  </div>
</body>
</html>`

  // Notificação interna
  const adminHtml = `<h3>Novo pedido de planeamento</h3>
<p><b>Nome:</b> ${nome}<br><b>Email:</b> ${email}<br>
<b>Região:</b> ${regiao}<br><b>Datas:</b> ${data_inicio} → ${data_fim}<br>
<b>Orçamento:</b> ${orcamento}<br><b>Interesses:</b> ${interessesStr}</p>
<p><a href="https://www.portalturismoportugal.com/dashboard.html">Ver no dashboard</a></p>`

  await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], subject: 'O teu plano está a ser preparado 🗓️', html: userHtml })
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject: `Novo pedido de planeamento — ${nome}`, html: adminHtml })
    })
  ])

  return new Response('OK', { status: 200, headers: CORS })
})

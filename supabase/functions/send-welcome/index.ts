import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'Portugal Travel Hub <ola@portalturismoportugal.com>'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const { email, name } = await req.json()
  if (!email) return new Response('No email', { status: 400, headers: CORS })

  const firstName = name?.split(' ')[0] || 'Explorador'

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#1B3A6B;padding:32px 40px;text-align:center">
      <h1 style="color:#C9A84C;margin:0;font-size:24px">Portugal Travel Hub</h1>
      <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px">O oceano na palma da mão</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1B3A6B;margin:0 0 16px">Bem-vindo, ${firstName}! 🌊</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 24px">
        A tua conta está activa. Já podes explorar 110 praias, condições de surf,
        spots de pesca e webcams ao vivo de toda a costa portuguesa.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:0 0 24px">
        <p style="margin:0 0 12px;font-weight:600;color:#1B3A6B">O que podes fazer agora:</p>
        <ul style="margin:0;padding:0 0 0 20px;color:#444;line-height:2">
          <li>🏖️ <a href="https://www.portalturismoportugal.com/beaches.html" style="color:#1B3A6B">Explorar praias</a> por região e qualidade da água</li>
          <li>🏄 <a href="https://www.portalturismoportugal.com/surf.html" style="color:#1B3A6B">Ver condições de surf</a> nos 25 melhores spots</li>
          <li>🗓️ <a href="https://www.portalturismoportugal.com/planear.html" style="color:#1B3A6B">Planear a tua escapada</a> costeira</li>
        </ul>
      </div>
      <div style="text-align:center;margin:32px 0">
        <a href="https://www.portalturismoportugal.com/precos.html"
           style="background:#C9A84C;color:#1B3A6B;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Activar Pro — €4,99/mês
        </a>
        <p style="color:#999;font-size:12px;margin:12px 0 0">Alertas em tempo real, webcams HD e previsões de 10 dias</p>
      </div>
    </div>
    <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px;margin:0">
        © 2026 Portugal Travel Hub ·
        <a href="https://www.portalturismoportugal.com" style="color:#999">portalturismoportugal.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: `Bem-vindo ao Portugal Travel Hub, ${firstName}! 🌊`,
      html
    })
  })

  const data = await res.json()
  console.log('send-welcome:', res.status, email, data)
  return new Response(JSON.stringify(data), { status: res.ok ? 200 : 500, headers: CORS })
})

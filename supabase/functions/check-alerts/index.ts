import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY          = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FROM = 'Portugal Travel Hub <alertas@portalturismoportugal.com>'

const CONDITION_LABELS: Record<string, string> = {
  wave_height: 'Ondas',
  wind_speed:  'Vento',
  temperature: 'Temperatura',
}
const OPERATOR_LABELS: Record<string, string> = {
  above: 'acima de',
  below: 'abaixo de',
}

function fetchWithTimeout(url: string, ms = 5000, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(tid))
}

interface Alert {
  id: string
  user_id: string
  beach_id: string
  beach_name: string
  condition: 'wave_height' | 'wind_speed' | 'temperature'
  operator: 'above' | 'below'
  threshold: number
  unit: string
  last_triggered_at: string | null
  beaches: { latitude: number; longitude: number }
}

interface MarineCurrent {
  wave_height?: number
}
interface WeatherCurrent {
  wind_speed_10m?: number
  temperature_2m?: number
}

function getCurrentValue(alert: Alert, marine: MarineCurrent, weather: WeatherCurrent): number | null {
  if (alert.condition === 'wave_height') return marine.wave_height ?? null
  if (alert.condition === 'wind_speed')  return weather.wind_speed_10m ?? null
  if (alert.condition === 'temperature') return weather.temperature_2m ?? null
  return null
}

function conditionMet(operator: string, current: number, threshold: number): boolean {
  return operator === 'above' ? current > threshold : current < threshold
}

serve(async () => {
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

  // 1. Fetch all active alerts not triggered in the last 6 hours
  const { data: alerts, error: alertsError } = await db
    .from('alerts')
    .select('*, beaches!inner(latitude, longitude)')
    .eq('active', true)
    .or(`last_triggered_at.is.null,last_triggered_at.lt.${sixHoursAgo}`)

  if (alertsError) {
    console.error('[check-alerts] Failed to fetch alerts:', alertsError)
    return new Response(JSON.stringify({ error: alertsError.message }), { status: 500 })
  }

  if (!alerts || alerts.length === 0) {
    console.log('[check-alerts] No active alerts to check')
    return new Response(JSON.stringify({ triggered: 0, checked: 0, errors: [] }), { status: 200 })
  }

  // 2. Group alerts by unique coordinates to avoid duplicate API calls
  const coordMap = new Map<string, { latitude: number; longitude: number; alerts: Alert[] }>()
  for (const alert of alerts as Alert[]) {
    const lat = alert.beaches.latitude
    const lng = alert.beaches.longitude
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    if (!coordMap.has(key)) coordMap.set(key, { latitude: lat, longitude: lng, alerts: [] })
    coordMap.get(key)!.alerts.push(alert)
  }

  let triggered = 0
  let checked = 0
  const errors: string[] = []
  const now = new Date()
  const nowLabel = now.toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon'
  })

  // 3. Process each unique coordinate group
  for (const [, group] of coordMap) {
    const { latitude, longitude, alerts: groupAlerts } = group

    let marine: MarineCurrent = {}
    let weather: WeatherCurrent = {}

    // Fetch marine + weather in parallel
    try {
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height&timezone=Europe/Lisbon`
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_speed_10m,temperature_2m&timezone=Europe/Lisbon`

      const [marineRes, weatherRes] = await Promise.allSettled([
        fetchWithTimeout(marineUrl),
        fetchWithTimeout(weatherUrl),
      ])

      if (marineRes.status === 'fulfilled' && marineRes.value.ok) {
        const marineJson = await marineRes.value.json()
        marine = marineJson.current ?? {}
      } else {
        errors.push(`Marine API failed for ${latitude},${longitude}`)
      }

      if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
        const weatherJson = await weatherRes.value.json()
        weather = weatherJson.current ?? {}
      } else {
        errors.push(`Weather API failed for ${latitude},${longitude}`)
      }
    } catch (err) {
      errors.push(`API fetch error for ${latitude},${longitude}: ${String(err)}`)
      continue // skip this group, move to next coordinates
    }

    // 4. Check each alert in this group
    for (const alert of groupAlerts) {
      checked++
      const current = getCurrentValue(alert, marine, weather)
      if (current === null) continue
      if (!conditionMet(alert.operator, current, alert.threshold)) continue

      // Condition met — get user email
      let userEmail: string | null = null
      try {
        const { data: { user }, error: userError } = await db.auth.admin.getUserById(alert.user_id)
        if (userError || !user?.email) {
          errors.push(`Could not get email for user ${alert.user_id}`)
          continue
        }
        userEmail = user.email
      } catch (err) {
        errors.push(`Auth lookup failed for user ${alert.user_id}: ${String(err)}`)
        continue
      }

      const condLabel = CONDITION_LABELS[alert.condition] ?? alert.condition
      const opLabel   = OPERATOR_LABELS[alert.operator]   ?? alert.operator
      const subject   = `🔔 Alerta: ${condLabel} ${opLabel} ${alert.threshold}${alert.unit} em ${alert.beach_name}`
      const currentFormatted = alert.condition === 'wave_height'
        ? current.toFixed(1)
        : String(Math.round(current))

      const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#1B3A6B;padding:24px 20px;text-align:center">
      <h1 style="color:#C9A84C;margin:0;font-size:24px">Portugal Travel Hub</h1>
      <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px">Alerta de condições</p>
    </div>
    <div style="padding:24px 20px">
      <h2 style="color:#1B3A6B;margin:0 0 8px">O seu alerta foi ativado! 🔔</h2>
      <p style="color:#444;font-size:15px;margin:0 0 24px">
        As condições que definiu em <strong>${alert.beach_name}</strong> foram atingidas.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:16px 20px;margin:0 0 24px">
        <div style="padding:10px 0;border-bottom:1px solid #eee">
          <div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Condição</div>
          <div style="color:#1B3A6B;font-weight:600;font-size:15px">${condLabel} ${opLabel} ${alert.threshold}${alert.unit}</div>
        </div>
        <div style="padding:10px 0;border-bottom:1px solid #eee">
          <div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Valor actual</div>
          <div style="color:#1B3A6B;font-weight:600;font-size:15px">${currentFormatted}${alert.unit}</div>
        </div>
        <div style="padding:10px 0;border-bottom:1px solid #eee">
          <div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Praia</div>
          <div style="color:#444;font-size:15px">${alert.beach_name}</div>
        </div>
        <div style="padding:10px 0">
          <div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Data/hora</div>
          <div style="color:#444;font-size:15px">${nowLabel}</div>
        </div>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="https://www.portalturismoportugal.com/beach.html?id=${alert.beach_id}"
           style="background:#C9A84C;color:#1B3A6B;display:inline-block;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;width:auto;max-width:100%;box-sizing:border-box">
          Ver condições da praia →
        </a>
      </div>
      <p style="color:#999;font-size:12px;margin:0;text-align:center">
        Para gerir os seus alertas, visite a página da praia no portal.
      </p>
    </div>
    <div style="background:#f8f9fa;padding:16px 20px;text-align:center;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px;margin:0">
        © 2026 Portugal Travel Hub ·
        <a href="https://www.portalturismoportugal.com" style="color:#999">portalturismoportugal.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

      // Send email
      try {
        const resendRes = await fetchWithTimeout('https://api.resend.com/emails', 5000, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from: FROM, to: [userEmail], subject, html }),
        })
        if (!resendRes.ok) {
          const errBody = await resendRes.text()
          errors.push(`Resend failed for alert ${alert.id}: ${resendRes.status} ${errBody}`)
          continue
        }
        console.log(`[check-alerts] Email sent for alert ${alert.id} → ${userEmail}`)
      } catch (err) {
        errors.push(`Email send error for alert ${alert.id}: ${String(err)}`)
        continue
      }

      // Update last_triggered_at
      const { error: updateError } = await db
        .from('alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id)

      if (updateError) {
        errors.push(`Failed to update last_triggered_at for alert ${alert.id}: ${updateError.message}`)
      }

      triggered++
    }
  }

  console.log(`[check-alerts] Done — checked: ${checked}, triggered: ${triggered}, errors: ${errors.length}`)
  return new Response(
    JSON.stringify({ triggered, checked, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})

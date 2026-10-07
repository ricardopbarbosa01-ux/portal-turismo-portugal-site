# serve-local.ps1 - Portal Turismo Portugal
# Serve o site LOCALMENTE igual a producao (mesmos _headers/CSP, _redirects e URLs limpas)
# usando a mesma copia publica que o deploy.ps1 prepara (..\pth-dist). NAO publica nada.
# Uso:  .\serve-local.ps1            -> http://localhost:8788/planear-v3
#       .\serve-local.ps1 -Lan       -> tambem acessivel no telemovel (mesma rede Wi-Fi)
#       .\serve-local.ps1 -Port 9000
param([int]$Port = 8788, [switch]$Lan)
$ErrorActionPreference = 'Stop'

& (Join-Path $PSScriptRoot 'deploy.ps1') -DryRun
if ($LASTEXITCODE -ne 0) { Write-Host "Falhou a preparar a copia publica." -ForegroundColor Red; exit 1 }

$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'pth-dist'
$ip = '127.0.0.1'
if ($Lan) { $ip = '0.0.0.0' }

Write-Host ""
Write-Host "Planeador v3:    http://localhost:$Port/planear-v3" -ForegroundColor Green
Write-Host "Link partilhado: http://localhost:$Port/planear-v3?plano=1&i=surf&r=oeste&n=2&o=moderado" -ForegroundColor Green
Write-Host "Planear atual:   http://localhost:$Port/planear" -ForegroundColor Green
if ($Lan) {
  $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress
  foreach ($a in $ips) { Write-Host "No telemovel:    http://${a}:$Port/planear-v3" -ForegroundColor Cyan }
  Write-Host "(se nao abrir no telemovel, permita o Node.js na Firewall do Windows - redes privadas)" -ForegroundColor Yellow
}
Write-Host "Ctrl+C para parar." -ForegroundColor DarkGray
Write-Host ""
npx wrangler pages dev $dist --port $Port --ip $ip

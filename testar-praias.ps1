# testar-praias.ps1 - Portal Turismo Portugal
# Testar as praias novas (lotes B2+B3, ainda INATIVAS na BD) antes do deploy e da ativacao.
# Usa a mesma copia publica do deploy (..\pth-dist) e injeta SO nessa copia um script de teste
# (_scripts\teste-praias-inativas.js) que mostra as praias inativas e usa as fotos locais.
# O repo nao e alterado. O proximo .\deploy.ps1 refaz a copia e apaga o script de teste.
# Uso:  .\testar-praias.ps1            -> http://localhost:8788/beaches  (computador)
#       .\testar-praias.ps1 -Lan       -> tambem no telemovel, mesma rede Wi-Fi
#       .\testar-praias.ps1 -Preview   -> link https de pre-visualizacao no Cloudflare (producao nao muda)
param([int]$Port = 8788, [switch]$Lan, [switch]$Preview)
$ErrorActionPreference = 'Stop'

& (Join-Path $PSScriptRoot 'deploy.ps1') -DryRun
if ($LASTEXITCODE -ne 0) { Write-Host "Falhou a preparar a copia publica." -ForegroundColor Red; exit 1 }
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'pth-dist'

Copy-Item (Join-Path $PSScriptRoot '_scripts\teste-praias-inativas.js') (Join-Path $dist 'js\_teste-praias-inativas.js') -Force
$utf8 = New-Object System.Text.UTF8Encoding($false)
$tag = '<script src="/js/_teste-praias-inativas.js"></script>'
foreach ($p in @('beaches.html','en\beaches.html','beach.html','en\beach.html','webcams.html','en\webcams.html')) {
  $f = Join-Path $dist $p
  $html = [IO.File]::ReadAllText($f, $utf8)
  if ($html.Contains($tag)) { continue }
  $i = $html.IndexOf('<head>')
  if ($i -lt 0) { Write-Host "Sem <head> em $p" -ForegroundColor Red; exit 1 }
  $html = $html.Insert($i + 6, "`n" + $tag)
  [IO.File]::WriteAllText($f, $html, $utf8)
}
Write-Host "Modo teste injetado em 6 paginas (so na copia de teste)." -ForegroundColor Yellow

if ($Preview) {
  npx wrangler pages deploy $dist --project-name portal-turismo-portugal-site --branch teste-praias --commit-dirty=true
  Write-Host ""
  Write-Host "Abra: https://teste-praias.portal-turismo-portugal-site.pages.dev/beaches" -ForegroundColor Green
  exit 0
}

$ip = '127.0.0.1'; if ($Lan) { $ip = '0.0.0.0' }
Write-Host ""
Write-Host "Praias:   http://localhost:$Port/beaches" -ForegroundColor Green
Write-Host "Ingles:   http://localhost:$Port/en/beaches" -ForegroundColor Green
Write-Host "Webcams:  http://localhost:$Port/webcams" -ForegroundColor Green
if ($Lan) {
  $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress
  foreach ($a in $ips) { Write-Host "No telemovel: http://${a}:$Port/beaches" -ForegroundColor Cyan }
  Write-Host "(se nao abrir no telemovel, permita o Node.js na Firewall do Windows - redes privadas)" -ForegroundColor Yellow
}
Write-Host "Ctrl+C para parar." -ForegroundColor DarkGray
npx wrangler pages dev $dist --port $Port --ip $ip

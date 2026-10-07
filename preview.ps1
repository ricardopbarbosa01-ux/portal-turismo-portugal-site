# preview.ps1 - Portal Turismo Portugal
# Publica uma PRE-VISUALIZACAO (preview) no Cloudflare Pages com link https proprio,
# para testar no telemovel. NAO mexe no site em producao (www.portalturismoportugal.com).
# Uso:  .\preview.ps1                      -> ramo "teste-planeador"
#       .\preview.ps1 -Branch outro-teste
param([string]$Branch = 'teste-planeador')
$ErrorActionPreference = 'Stop'

if ($Branch -in @('main','master','production')) { Write-Host "Use um nome de ramo de teste, nao '$Branch'." -ForegroundColor Red; exit 1 }

& (Join-Path $PSScriptRoot 'deploy.ps1') -DryRun
if ($LASTEXITCODE -ne 0) { Write-Host "Falhou a preparar a copia publica." -ForegroundColor Red; exit 1 }

$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'pth-dist'
Write-Host ""
Write-Host "A publicar PRE-VISUALIZACAO no ramo '$Branch' (producao nao e alterada)..." -ForegroundColor Cyan
npx wrangler pages deploy $dist --project-name portal-turismo-portugal-site --branch $Branch --commit-dirty=true
Write-Host ""
Write-Host "Abra no telemovel o link 'alias' que o Wrangler mostrou acima e acrescente /planear-v3" -ForegroundColor Green
Write-Host "(normalmente: https://$Branch.portal-turismo-portugal-site.pages.dev/planear-v3)" -ForegroundColor Green

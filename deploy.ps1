# deploy.ps1 - Portal Turismo Portugal
# Copia SO os ficheiros publicos para uma pasta limpa fora do repo e faz deploy dessa pasta.
# Motivo: o repo tem >20 000 ficheiros (node_modules, .agents, .claude, _scripts...) e o Cloudflare Pages
# recusa deploys com mais de 20 000 ficheiros. Bonus: .env, docs internos e scripts deixam de ser enviados.
# Uso:  .\deploy.ps1          -> copia + mostra contagem + pede confirmacao + deploy
#       .\deploy.ps1 -DryRun  -> so copia e mostra contagem (nao faz deploy)
param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$src  = $PSScriptRoot
$dist = Join-Path (Split-Path $src -Parent) 'pth-dist'

$excludeDirs = @(
  'node_modules','.git','.agents','.claude','.claude-flow','.codegraph','.planning','.playwright-mcp',
  '.swarm','.wrangler','Claude outputs','Neida','_audit','_data','_diag','_mockups','_planning',
  '_scripts','docs','graphify-out','performance-reports','playwright-report','playwright',
  'test-results','tests','supabase'
)
$excludeFiles = @(
  '.env','.env.*','.mcp.json','.gitignore*','*.md','package.json','package-lock.json','skills-lock.json',
  'smoke-results.json','*.py','*.ps1','*.zip','_tmp_server.*','audit*.js','*.log'
)

Write-Host "Origem: $src"
Write-Host "Destino: $dist"
robocopy $src $dist /MIR /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS /NP /R:1 /W:1 | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Host "ERRO no robocopy (codigo $LASTEXITCODE)" -ForegroundColor Red; exit 1 }

$count = (Get-ChildItem $dist -Recurse -File | Measure-Object).Count
Write-Host "Ficheiros a enviar: $count (limite Cloudflare: 20000)" -ForegroundColor Cyan
foreach ($must in @('index.html','_headers','_redirects','js\affiliate.js','css\style.css','en\index.html')) {
  if (-not (Test-Path (Join-Path $dist $must))) { Write-Host "FALTA ficheiro essencial: $must" -ForegroundColor Red; exit 1 }
}
foreach ($bad in @('.env','.mcp.json','CLAUDE.md','docs','node_modules')) {
  if (Test-Path (Join-Path $dist $bad)) { Write-Host "ERRO: $bad nao devia estar no deploy" -ForegroundColor Red; exit 1 }
}
if ($count -ge 20000) { Write-Host "Ainda acima do limite. Nao faco deploy." -ForegroundColor Red; exit 1 }
if ($DryRun) { Write-Host "DryRun: nada foi publicado." -ForegroundColor Yellow; exit 0 }

$ok = Read-Host "Publicar agora? (s/n)"
if ($ok -ne 's') { Write-Host "Cancelado."; exit 0 }
npx wrangler pages deploy $dist --project-name portal-turismo-portugal-site --commit-dirty=true

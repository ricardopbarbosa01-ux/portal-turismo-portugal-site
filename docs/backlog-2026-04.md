# Backlog Tecnico — Abril 2026

## Pendencias surf.html / pesca.html (nao tocar nesta sessao)

| Ficheiro | Linha | Problema |
|----------|-------|---------|
| pesca.html | 158 | `.pesca-hero-wave` sem `z-index:2` (onda pode ficar atras do overlay) |
| pesca.html | 146 | `.pesca-hero::before` sem `z-index:0` (stacking implicito, fragil) |
| pesca.html | 411 | `.pesca-hero-2col` z-index:1 igual ao overlay (fragil, depende da ordem DOM) |
| pesca.html | 182 | `.tipo-tab` min-height:34px — abaixo de WCAG 2.5.5 (minimo 44px) |
| pesca.html | 189 | `.chip` min-height:34px — idem MOBILE-07 |
| surf.html | 562 | Video hero via Pexels CDN externo (vs local em beaches.html) |
| pesca.html | 594 | Video hero via Pexels CDN externo (vs local em beaches.html) |

---

## CSP / Seguranca — Abril 2026 (sprint 4, post-R2)

### [BACKLOG] Migrar hero video `index.html` + `en/index.html` de Pexels para R2
- **Estimativa**: 30–45 min
- **Contexto**: `index.html:985` e `en/index.html:985` ainda carregam de `videos.pexels.com`. Todas as outras paginas ja migradas para `cdn.portalturismoportugal.com`. Quando feito, remover tambem: preconnect `videos.pexels.com` (index.html:70 e en/index.html:70) e `videos.pexels.com` de `media-src` no `_headers`.
- **Ficheiros**: `index.html`, `en/index.html`, `_headers`

### [BACKLOG] Adicionar `Strict-Transport-Security` ao `_headers`
- **Estimativa**: 5 min
- **Contexto**: HSTS nao configurado explicitamente. Cloudflare Pages aplica via edge, mas ter explícito e mais seguro.
- **Valor**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Ficheiros**: `_headers`

### [BACKLOG] Avaliar `Cache-Control` manual por tipo de asset
- **Estimativa**: 1–2 h
- **Contexto**: `_headers` nao tem regras de `Cache-Control`. CSS/JS versionados podem ter `max-age` longo; HTML deve ser `no-cache`. Actualmente depende dos defaults Cloudflare.
- **Ficheiros**: `_headers`

### [BACKLOG] Review de `'unsafe-eval'` em `script-src`
- **Estimativa**: 2–4 h (investigacao + testes)
- **Contexto**: GSAP 3.12.5 usa `eval()` internamente. Investigar se build sem eval e possivel ou migrar para versao local com SRI hash.
- **Ficheiros**: todos os HTML com GSAP, `_headers`

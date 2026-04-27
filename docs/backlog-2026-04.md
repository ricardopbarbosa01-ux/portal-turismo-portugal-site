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

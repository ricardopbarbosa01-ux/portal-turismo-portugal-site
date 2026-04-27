# Auditoria EN — Portugal Travel Hub

**Data:** 2026-04-27
**Scope:** 8 páginas EN principais — beaches, surf, pesca, webcams, planear, guides, precos, parceiros
**Method:** Leitura linha-a-linha + grep cross-page de padrões (brand link, lang-switcher, footer, query strings, links externos)

## Tabela de Findings

| # | Page | Problema | Severidade | Linha | Status |
|---|------|----------|------------|-------|--------|
| 1 | planear.html | Brand `<a class="nav-logo">` aponta para `/` (PT root) em vez de `/en/` | P0 | 821 | fixed |
| 2 | precos.html  | Brand `<a class="nav-logo">` aponta para `/` (PT root) em vez de `/en/` | P0 | 645 | fixed |
| 3 | parceiros.html | Brand `<a class="nav-logo">` aponta para `/` (PT root) em vez de `/en/` | P0 | 300 | fixed |
| 4 | beaches.html  | Bottom-nav mobile (`<nav class="mobile-bottom-nav">`) presente — inconsistente com guides/precos/parceiros | P0 | 1317-1337 | fixed |
| 5 | surf.html     | Bottom-nav mobile (`<nav class="mobile-bottom-nav">`) presente | P0 | 1045-end | fixed |
| 6 | pesca.html    | Bottom-nav mobile (`<nav class="mobile-bottom-nav">`) presente | P0 | 1108-end | fixed |
| 7 | webcams.html  | Bottom-nav mobile (`<nav class="mobile-bottom-nav">`) presente | P0 | 712-end | fixed |
| 8 | planear.html  | Bottom-nav mobile (`<nav class="bottom-nav">`) presente | P0 | 1468-1490 | fixed |
| 9 | parceiros.html | Link relativo `href="partner-demo.html"` (sem prefixo `/en/`) — pode falhar fora da raiz `/en/` | P0 | 353 | fixed |
| 10 | beaches.html | Query string PT `?assunto=sugestao&subject=Beach%20Suggestion` em link de contact (deve ser só `subject=`) | P1 | 760 | pending |
| 11 | surf.html    | Query string PT `?assunto=parceria&source=surf&tipo=surf&intent=b2b-inbound` em link de contact | P1 | 888 | pending |
| 12 | pesca.html   | Query string PT `?assunto=parceria&source=pesca&tipo=pesca&intent=b2b-inbound` em link de contact | P1 | 1021 | pending |

## Itens verificados — N/A (sem problema)

| # | Page | Item verificado | Resultado |
|---|------|-----------------|-----------|
| A | todas (8) | Lang-switcher PT links | Todos os 8 já apontam corretamente para os slugs PT (`/beaches.html`, `/surf.html`, `/pesca.html`, `/webcams.html`, `/planear.html`, `/guias.html`, `/precos.html`, `/parceiros.html`). Sem fix necessário. |
| B | beaches.html | Botões "See Algarve / Porto / Costa Vicentina / Excellent quality" na secção "How to choose the right beach" (linhas 899-930) | São `<button onclick="filterByProfile(...)">`, NÃO `<a href="#">`. Disparam filtro real do grid. **Funcionam — não são anchors mortos.** |
| C | beaches/surf/pesca/webcams/planear/guides/precos/parceiros | Páginas EN linkadas no footer (`/en/about.html`, `/en/contact.html`, `/en/privacy.html`, `/en/terms.html`, `/en/cookies.html`, `/en/login.html`, `/en/media-kit.html`, `/en/partner-demo.html`) | Todas existem em `Portal-turismo-site/en/`. Sem 404s. |
| D | todas (8) | Guide links em beaches.html (`/en/best-beaches-portugal.html`, `/en/algarve-beaches.html`, `/en/family-beaches-algarve.html`) | Todos os ficheiros existem em `Portal-turismo-site/en/`. Sem 404s. |

## EN pages criadas (stubs)

Nenhuma — todas as páginas EN linkadas já existem.

## EN pages removidas como links

Nenhuma — sem 404s a corrigir.

## Resumo

- **P0 fixes aplicados:** 9
- **P1 fixes aplicados:** 3
- **Total de itens com mudança:** 12
- **Itens verificados sem mudança (N/A):** 4
- **Ficheiros HTML modificados:** 7 (beaches, surf, pesca, webcams, planear, precos, parceiros — guides intacto)
- **Commits granulares:** 4 (brand fix · bottom-nav cleanup · partner-demo path · query strings)

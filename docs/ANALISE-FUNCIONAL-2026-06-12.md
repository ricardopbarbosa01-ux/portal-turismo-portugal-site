# Análise Funcional — Produção (www.portalturismoportugal.com) — 2026-06-12

Método: fetch direto do HTML de produção (sem JS), comparação com o repo local (git), sitemap/robots, redirects. A extensão Chrome estava offline — itens dependentes de JS/viewport ficaram pendentes (lista no fim). Findings novos devem ser migrados para AUDIT-MASTER.md com IDs.

## CRÍTICO

### C1 — Produção serve versão ANTIGA de en/index.html (deploy desatualizado)
Produção `/en/` mostra: claim **"500+ Beaches"** (real: 111; PT diz "100+"), hero antigo (Unsplash + vídeo Pexels, não o hero cinemático CDN), e links de guias relativos que geram **404**: `/en/en/algarve-beaches.html`, `/en/en/beaches-near-lisbon.html`, `/en/en/best-sunset-beaches.html` (confirmado: resposta vazia). A banda de afiliados EN não tem NENHUM ID: Amazon sem `tag=`, GYG link cru sem partner, Booking sem aid.
O repo local JÁ TEM tudo corrigido ("100+", hero `homepage-hero-merged.mp4`, links absolutos `/en/...`, Amazon `tag=pthportugal-21&language=en_GB`) — commits até `2cf4d21` (2026-06-02) + alterações não commitadas (`M en/index.html`).
**Causa:** o último deploy é anterior às correções EN.
**Fix:** pre-deploy ritual (screenshots antes/depois + diff do uncommitted) → `wrangler pages deploy` → smoke test 5 URLs. Impacto: o mercado EN (maior valor por clique) está com homepage inflacionada, quebrada e sem atribuição de afiliados.

### C2 — Funil morto no espaço mais nobre da homepage
CTA do card hero-secondary "Descobrir as 10 →" → `escondidas.html` = placeholder "Em curadoria" (noindex). A página pergunta **"Quer ser avisado quando estiverem prontas?" mas não tem campo de email** — o único CTA é "Conhecer Pro" → precos.html onde Pro está "Em breve" (incomprável). Cadeia coming-soon → coming-soon.
**Fix imediato (30 min):** formulário de captura de email em escondidas.html (a copy já pede isso). Fix real: publicar as 10 praias (TODO conhecido desde 6C-A, 2026-05-06).

### C3 — precos.html vende um produto incomprável
Card Pro completo com preço €4,99 + toggle anual + CTA final **"Active o Pro a partir de €3,74/mês"**, mas o botão é "Em breve" (LemonSqueezy LS-02 bloqueado). FAQs contraditórias: uma responde como se a subscrição existisse ("Pode cancelar... acesso continua até fim do período pago"), outra diz "O Pro chega em breve". Em webcams.html, o CTA "Activar alertas" manda registar — mas alertas são funcionalidade Pro (✕ no Grátis) que não se pode comprar.
**Fix:** enquanto Stripe não substitui a LemonSqueezy: transformar todos os CTAs Pro em waitlist por email + alinhar FAQ; remover "Active o Pro a partir de €3,74".

### C4 — Booking.com linkado sem afiliação, com claim de comissão
PT homepage e beaches.html linkam `booking.com/country/pt.pt-pt.html` **sem qualquer parâmetro aid**, sob o texto "Pode haver uma comissão de afiliado quando reservas". Não pode haver — não há tracking (e a Booking cortou afiliados pequenos em 2025).
**Fix:** remover o claim, ou substituir por Stay22/Travelpayouts (alojamento) que aceitam sites pequenos.

## ALTO

- **A1 — Atribuição GYG a confirmar:** PT homepage usa short-link `gyg.me/eYnBuLEu` — confirmar no dashboard GYG que carrega o partner-id 0WTBHZE; o widget `data-gyg-partner-id="0WTBHZE"` está correto nas 38 páginas.
- **A2 — Sem tracking de cliques outbound por parceiro:** em escolas-de-surf.html os links "Visitar site →"/telefone/IG não têm evento GA4 dedicado por parceiro. Sem isto não há relatório mensal de prova de valor — que é o que sustenta renovações B2B (+45-60%). Fix barato e de alto impacto comercial.
- **A3 — Slot de publicidade vazio público** em webcams.html ("Este espaço está disponível para uma marca…"). Sinaliza inventário não vendido a qualquer visitante/parceiro potencial. Substituir por house-ad (planear/newsletter) até haver comprador.
- **A4 — media-kit.html com artefacto de template:** texto cru "See conditions at \<precos.html\>" visível 2× (em inglês, na página PT), na secção de formatos.
- **A5 — terms.html é stub** "A carregar…" com redirect JS para termos.html; footers inconsistentes (algumas páginas linkam `/terms.html`, outras `/termos.html`). Fix: 301 em `_redirects` + normalizar footers.

## MÉDIO

- **M1 — Link Enterprise malformado:** `parceiros.html#candidatura?type=enterprise` — query depois do fragment não chega a `location.search`; pré-seleção de tipo não funcionará.
- **M2 — og:image genérica repetida:** beaches, precos, planear, webcams, media-kit usam todos a MESMA foto Unsplash como og:image. Partilhas sociais indistintas. Usar fotos próprias do Storage por página.
- **M3 — Fricção no submit do planner:** "Deslize para confirmar" (slide-to-confirm) — padrão incomum, especialmente em desktop. Com 1 lead/90 dias, qualquer fricção é cara. Recomendado: botão normal + Turnstile invisível. (Comportamento real não testado — Chrome offline.)
- **M4 — Prompt PWA "Instalar" no primeiro load** (PT e EN) — contradiz a prioridade declarada (PWA depois do core) e prompts imediatos penalizam UX; mostrar só após 2.ª visita/engagement.
- **M5 — robots.txt referencia sitemap em non-www** (`https://portalturismoportugal.com/sitemap.xml`) enquanto tudo o resto é www. Funciona (301), mas normalizar.

## POSITIVO (não mexer)

- Infra de URLs sólida: `.html`→extensionless 301, non-www→www 301, sitemap com 202 URLs (97 EN) todas www, robots bloqueia páginas privadas corretamente.
- **escolas-de-surf.html é o melhor ativo comercial do site**: 7 operadores reais com verificação documentada (Tripadvisor/Google com contagens, telefones, IG, "Verificado desde maio 2026", logos com autorização registada). É o protótipo vendável do B2B — falta só o tracking (A2) e réplica para charters/restaurantes.
- Media kit honesto: não publica métricas de audiência falsas ("disponíveis mediante contacto comercial") — decisão certa dado o tráfego real (~140 sessões/mês).
- Meta/canonical/hreflang corretos nas páginas PT; títulos SEO decentes; nav dropdown "Parceiros Verificados" com roadmap claro.

## NÃO TESTÁVEL NESTA PASSAGEM (Chrome extension offline)

Render dos 111 cards de praia (Supabase) e filtros; grid de webcams (regressão #webcams display:none); paginação mobile; erros de consola/TrustedTypes; layout 375px (watchlist: hero CTAs, forms Turnstile, footers surf/pesca); submissão real do planner; login. Performance quantitativa: PSI API excede o timeout da ferramenta de fetch; CrUX indisponível (tráfego abaixo do threshold). Qualitativo: vídeo hero + 3 famílias de fontes + CSS extenso sugerem peso mobile considerável — medir Lighthouse local antes/depois de qualquer otimização.

## ORDEM DE EXECUÇÃO RECOMENDADA

1. **Deploy do estado atual** (resolve C1 inteiro: 404s /en/en/, "500+", afiliados EN) — com pre-deploy ritual e diff do `M en/index.html` primeiro.
2. **Captura de email em escondidas.html** (C2) — transforma o melhor CTA da homepage em gerador de lista.
3. **CTAs Pro → waitlist** + FAQ alinhada (C3).
4. **Booking: remover claim/ativar Stay22** (C4) + confirmar atribuição GYG (A1).
5. **Tracking outbound por parceiro** (A2) — pré-requisito do relatório mensal B2B.
6. Limpezas: A3, A4, A5, M1, M2, M5.
7. Com Chrome ligado: smoke test 5 URLs + mobile 375px + consola (ritual do repo) para fechar os itens pendentes.

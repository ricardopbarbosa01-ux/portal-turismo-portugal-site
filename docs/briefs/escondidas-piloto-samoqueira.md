# Brief Claude Code -- Piloto "10 Praias Escondidas" (Praia da Samoqueira)

> Estado: PILOTO (1 praia, PT+EN). Construir, o Ricardo aprova, so depois escalar as 10.
> Principio inviolavel: este conteudo sustenta a promessa "verificado, nunca leiloado". NADA inventado. Sem texto fabricado, sem imagens AI de praias reais, sem afirmar visitas que nao aconteceram.

## 0. Objetivo
Criar 1 pagina editorial excelente (PT+EN) sobre uma praia portuguesa genuinamente pouco conhecida, com SEO real, foto licenciada com atribuicao, e copy honesta. Serve de MODELO para as outras 9.

## 1. Honestidade -- regras inegociaveis
- Proibido: imagens AI de praias reais; texto inventado sobre acessos/condicoes; afirmar "visitamos/fotografamos" se nao aconteceu.
- Copy honesta: enquadramento e "curadoria editorial a partir de fontes verificaveis", NAO "um residente foi la fotografar". Foto de terceiros => identificar autor + licenca (padrao figcaption ja existe em beach.html/beaches.html).
- Reframe obrigatorio de escondidas.html (hoje diz "Cada uma vai ser visitada, fotografada e documentada por residentes locais -- antes de a publicarmos."): substituir por verdadeiro, ex.:
  "Selecionamos praias menos conhecidas a partir de fontes verificaveis -- qualidade da agua (APA), cartografia oficial e fotografia licenciada -- com expectativas honestas sobre acesso e condicoes. Fotos de terceiros estao sempre identificadas."
- "Nao aparecem em listas de top 50" pode manter-se se for verdade (Samoqueira nao aparece). "Verificadas por residentes" => suavizar para "Selecionadas com criterio editorial" enquanto nao houver verificacao presencial real.

## 2. Conteudo do piloto -- Praia da Samoqueira (FACTOS VERIFICADOS)
Fontes: visitportugal.com (oficial), playocean.net, travel-in-portugal.com, tripadvisor. Confirmar cada facto antes de publicar; nao acrescentar dados nao verificados.
- Onde: ~2,5 km a norte de Porto Covo, concelho de Sines, Costa Alentejana. Dentro do Parque Natural do Sudoeste Alentejano e Costa Vicentina. Regiao no site: Alentejo.
- Caracter: pequena enseada com formacoes rochosas dramaticas (rochas em "chapeu"), piscinas naturais de mare baixa, pequenas grutas exploraveis na mare baixa, lagoa protegida. Bom snorkeling nas pools.
- Acesso: parque de estacionamento no topo; escadaria talhada na rocha ate a areia. Facil de carro.
- Apoios: minimos. Nadador-salvador nos meses quentes. SEM balnearios/chuveiros (dizer claramente).
- Dica honesta: verificar a mare -- pools, grutas e "chapeus" dependem da mare baixa. Levar agua/sombra. Costa ventosa.
- Porque e "escondida": ofuscada pelas praias principais de Porto Covo e pelas do Algarve; conhecida por locais e caminhantes da Rota Vicentina. Nao aparece em listas top-50.

## 3. Imagem (parar no primeiro que funcione)
1. Foto propria do Ricardo (se tiver) -- melhor.
2. Wikimedia Commons da Samoqueira CC BY / CC BY-SA / PD -- usar image-fetch-store/Storage; atribuicao obrigatoria (autor exato + licenca + link).
3. Pexels (paisagem real da praia/Costa Alentejana) com atribuicao -- fallback.
4. NUNCA gerar imagem AI desta praia. Sem foto real adequada => gradiente/ilustracao abstrata neutra (nao fotorrealista) + nota ao Ricardo.

## 4. SEO (real keyword intent)
- Slug PT: /escondidas/praia-da-samoqueira.html · EN: /en/hidden-beaches/praia-da-samoqueira.html (confirmar convencao com hub).
- Title PT: "Praia da Samoqueira (Porto Covo) -- Piscinas Naturais, Acesso e Mares · Portugal Travel Hub"
- Meta desc PT (<160): intencao de decisao -- como chegar, piscinas de mare, o que esperar, apoios.
- EN equivalente, hreflang reciproco PT<->EN + x-default, canonical proprio.
- Schema.org Beach/TouristAttraction com geo, containedInPlace (Porto Covo, Sines), image, name, description. JSON-LD valido.
- OG/Twitter proprios (NAO a Unsplash generica -- usar a foto real desta praia).
- Conteudo unico e substancial (nao template trocado): acesso, mares, seguranca, epoca, snorkeling, o que NAO esperar. Isto evita a politica "scaled content abuse" do Google.

## 4.5. Direcao de arte PREMIUM-EDITORIAL (nao "simples", mas on-brand e rapido)

Objetivo: revista de viagens de qualidade (National Geographic / Conde Nast), NAO landing de SaaS. O "premium" vem de fotografia + tipografia + espaco + motion contido -- nao de gradientes animados.

### Layout (desktop + mobile-first)
- HERO full-bleed com a foto real da praia (object-fit:cover, min-height: 78vh desktop / 70dvh mobile), overlay escuro em gradiente SO no rodape do hero (legibilidade do titulo), nunca a tapar a foto toda.
- Titulo editorial grande: Bodoni Moda (ja carregada) display, clamp(40px, 7vw, 96px), letter-spacing negativo, line-height 0.95. Kicker em IBM Plex Mono uppercase pequeno ("ALENTEJO · PORTO COVO · POUCO CONHECIDA"). Sub em Inter.
- Logo abaixo do hero: faixa de 3-4 "facts" rapidos (Regiao · Acesso · Mares · Apoios) em cartoes minimalistas (sem borda+sombra+fundo todos juntos -- escolher UM nivel de elevacao).
- Corpo em 1 coluna estreita (max 68ch) para o texto editorial -- leitura confortavel. Intercalar com:
  - 1 PULL-QUOTE grande (a "alma" da praia, ex.: a frase sobre as piscinas de mare) em Bodoni itálico.
  - 1 bloco "Como chegar" com MINI-MAPA (link/iframe estatico OpenStreetMap ou imagem; sem APIs pagas) + passos de acesso.
  - 1 bloco "O que esperar / o que NAO esperar" lado-a-lado (honestidade = diferenciador).
  - 1 bloco "Melhor altura + marés" (liga aos dados de mare do site se possivel; senao, nota honesta).
- Atribuicao da foto: figcaption discreto (11px, opacidade 0.6) com autor + licenca + link (padrao ja existente).
- Footer e nav identicos ao resto do site.

### Tipografia / cor
- Reusar as fontes JA carregadas: Bodoni Moda (titulos), Inter (corpo), IBM Plex Mono (kickers/labels), Montserrat (numeros/acentos). NAO adicionar novas familias.
- Paleta existente do site (navy/areia/dourado). PROIBIDO o "AI gradient" roxo/azul. Sombras tingidas com a cor do fundo (nao preto puro). Saturacao de acentos < 80%.

### Motion CONTIDO (com orcamento de performance)
- Permitido: scroll-reveal staggered (translateY 12-20px + opacity, 400-600ms) via IntersectionObserver; parallax MUITO subtil so no hero (<=8px, requestAnimationFrame, transform-only); hover lift nos cartoes/CTAs (scale 1.0->1.02, 200ms).
- Guards obrigatorios: `prefers-reduced-motion` => animation:none; `hover:none` (mobile) => sem parallax cursor. GPU-only (so transform/opacity; nunca animar top/left/width/height).
- PROIBIDO em paginas de conteudo: bibliotecas de motion pesadas (GSAP/Lottie/three.js), video de fundo, mesh-gradients animados, canvas particles. Tudo isto mata o LCP no mobile.

### Orcamento de performance (porque sao paginas de SEO)
- LCP element = a foto do hero: servir WebP, dimensoes corretas, `fetchpriority="high"`, `width`/`height` para evitar CLS. Resto das imagens `loading="lazy"`.
- Alvo: Lighthouse mobile Performance >= 90, CLS < 0.1, LCP < 2.5s. JS proprio da pagina < ~15KB. Sem render-blocking de terceiros.
- Verificar no PageSpeed/Lighthouse ANTES de marcar o piloto como aprovado.

### Skill a usar
- Invocar `high-end-visual-design` (taste-skill) para o acabamento; usar `redesign-existing-projects` so para auditar contra padroes genericos. Respeitar tudo o que esta acima (estas regras tem prioridade sobre defaults da skill, sobretudo o orcamento de performance e a proibicao de motion pesado).

## 5. Estrutura / tecnica (LER as paginas existentes e imitar)
- Imitar estrutura/nav/footer/CSS de uma pagina estatica existente: praias-secretas-algarve.html (PT) + equivalente en/, e beach.html para o figcaption/atribuicao.
- Regressoes conhecidas (CLAUDE.md watchlist): body padding-bottom para .mobile-bottom-nav; mob-menu-btn com e.stopPropagation(); script inline que use db dentro de DOMContentLoaded + guard typeof db; _setHTML() se houver innerHTML dinamico.
- Skills: high-end-visual-design ou redesign-existing-projects (taste-skill) para acabamento; respeitar paleta/tipografia existentes (Montserrat/Bodoni/Inter); NAO introduzir o "AI gradient" roxo/azul.
- Acessibilidade: skip-link, alt real, contraste AA.
- Adicionar ao sitemap.xml (PT+EN) e ligar a partir do hub escondidas.html.

## 6. Hub escondidas.html (atualizar no piloto)
- Aplicar reframe honesto (seccao 1).
- Adicionar captura de email (lista de espera) -- o CTA promete "avisar" mas nao tem campo. Usar a Edge Function/padrao de lead do site (Turnstile), nunca toast-only (ver watchlist B2B/planner).
- Remover noindex SO quando houver conteudo real (no piloto pode manter-se).

## 7. Deploy + verificacao
- Pre-deploy: Edit/Write tool TRUNCA o fim dos ficheiros neste mount -- apos cada escrita, tail -3 + wc -l vs git show HEAD.
- Deploy: npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true.
- Purgar cache Cloudflare (HTML e cacheado na zona).
- Smoke test: PT+EN, foto carrega, schema valido (Rich Results Test), hreflang reciproco, mobile 375px.

## 8. Criterios de aceitacao (Ricardo aprova antes de escalar)
- [ ] Factos 100% verificaveis (cada afirmacao tem fonte).
- [ ] Foto real licenciada + atribuicao visivel.
- [ ] Copy honesta (sem "visitamos" falso).
- [ ] SEO completo e unico.
- [ ] Visual on-brand (sem cara de AI), mobile OK.
- [ ] Hub com reframe + captura de email.

## 9. Candidatas para as outras 9 (TODAS a verificar antes de publicar)
A investigar (confirmar reais, lesser-known, com foto licenciada + info verificavel): Praia do Carvalho (Algarve, junto a Benagil, acesso por tunel), Praia do Telheiro (Vila do Bispo), Praia da Amoreira (Aljezur), Praia dos Alteirinhos (Zambujeira), Praia da Adraga (Sintra), Praia do Abano (Cascais), Praia de Odeceixe (rio+mar), Praia da Cova Redonda (Armacao de Pera). NAO usar a lista do worksheet de curadoria (Benagil/Marinha/Supertubos/Nazare sao famosas -- contradizem a promessa).

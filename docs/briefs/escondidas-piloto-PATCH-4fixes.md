# Patch-brief -- Fechar o piloto Samoqueira (4 fixes OBRIGATORIOS antes de escalar)

Contexto: piloto construido (commit 2936869, preview 4fb6fb7f...). Verificacao independente encontrou 4 problemas. Corrigir no piloto (paginas PT+EN + 2 hubs), re-deploy para preview, e AGUARDAR re-verificacao antes de escalar as praias 2-10.

Ficheiros em escopo: escondidas/praia-da-samoqueira.html, en/hidden-beaches/praia-da-samoqueira.html, escondidas.html, en/hidden-beaches.html, sitemap.xml (se mudar imagem/URLs).

---

## FIX 1 -- Formulario de waitlist NAO EXISTE (o relatorio dizia que sim)
Problema: grep em ambos os hubs e na pagina = 0 `<input>`, 0 `<form>`, 0 email, 0 turnstile, 0 `#wl-success`. O criterio "captura de email" nao foi cumprido.
Fazer:
- Adicionar form real de email em AMBOS os hubs (escondidas.html + en/hidden-beaches.html): `<input type="email">` + Turnstile (`cf-turnstile`, site key de producao) + submit.
- Estado de sucesso PERSISTENTE (mostrar `#wl-success`, esconder o form). NUNCA toast-only -- ver watchlist "B2B/Planner persistent state" no CLAUDE.md.
- Ligar ao MESMO padrao de Edge Function de lead ja usado em planear/parceiros (Turnstile verify; functions/v1/...). NAO inventar endpoint novo. Reutilizar o JS de submit existente.
Aceitacao: grep encontra `type="email"`, `cf-turnstile` e `wl-success` nos DOIS hubs; submeter mostra sucesso persistente.

## FIX 2 -- Foto: VERIFICAR que e a Samoqueira + trocar por uma SERENA
Problema: a imagem atual e `Lotacao_esgotada.jpg` ("cheio/esgotado"); o alt diz "com visitantes nas piscinas naturais" -> mostra a praia CHEIA, o que contradiz "praia que ninguem encontra / nao aparece em top-50". Alem disso nao esta confirmado que seja sequer a Samoqueira.
Fazer (por ordem):
1. Abrir a pagina do ficheiro na Wikimedia e CONFIRMAR que retrata Praia da Samoqueira (Porto Covo) E que autor/licenca estao exatos. Se NAO for a Samoqueira -> descartar ja.
2. Preferir foto que mostre a praia SERENA / quase vazia -- on-brand com "escondida". Procurar: commons.wikimedia.org Category:Praia_da_Samoqueira + MediaSearch "Praia da Samoqueira Porto Covo". So CC BY / CC BY-SA / Public Domain. Reproduzir o nome do autor exatamente.
3. Se nao houver CC serena adequada: foto Pexels real da praia/Costa Alentejana (com atribuicao), OU sinalizar ao Ricardo para foto propria. NAO manter a foto cheia. NUNCA gerar AI.
Aceitacao: a foto-heroi mostra o caracter recatado; filename/alt coerentes com "escondida"; atribuicao exata; confirmado ser a Samoqueira.

## FIX 3 -- Imagem via Storage WebP, NAO hotlink direto da Wikimedia
Problema: hero + og:image + schema image apontam para `upload.wikimedia.org/.../...jpg` em resolucao ORIGINAL -> mau LCP no mobile + ma etiqueta de hotlink. O brief pedia WebP via Storage.
Fazer:
- Passar a foto escolhida pelo pipeline image-fetch-store -> Supabase Storage, redimensionada (~1600px) + WebP. Usar a URL do Storage no `<img>`, `og:image`, `twitter:image` e no `image` do schema.
- Hero `<img>`: `width`/`height` definidos (sem CLS), `fetchpriority="high"`, `decoding="async"`. Restantes imagens `loading="lazy"`.
- A unica ocorrencia permitida de `upload.wikimedia.org` no HTML servido e DENTRO do link de atribuicao (texto), nao como fonte da imagem.
Aceitacao: sem `upload.wikimedia.org` como `src`/`og:image`; LCP = WebP do Storage; Lighthouse mobile Performance >= 90, LCP < 2.5s, CLS < 0.1 (verificar antes de fechar).

## FIX 4 -- Schema: adicionar Beach / TouristAttraction
Problema: o JSON-LD tem Park/City/FAQPage/BreadcrumbList mas NAO o tipo principal `Beach`/`TouristAttraction` que o brief pedia (e o mais relevante para uma pagina de praia).
Fazer: entidade principal com `"@type": ["TouristAttraction","Beach"]`, com `name`, `description`, `image` (URL Storage), `geo` (GeoCoordinates), `containedInPlace` (Porto Covo / Sines / Alentejo). Manter FAQPage + BreadcrumbList. Validar no Google Rich Results Test.

---

## Deploy + re-verificacao (gate)
- Apos cada escrita: `tail -3 <file>` + `wc -l` vs `git show HEAD:<file>` (guarda contra o truncamento do Edit tool no mount).
- Deploy para PREVIEW + smoke test (4 URLs = 200).
- Reportar PROVA de cada fix: grep do form (Fix 1), ausencia de hotlink + Storage WebP (Fix 3), tipo Beach no schema (Fix 4), confirmacao Wikimedia + numeros Lighthouse mobile (Fix 2/3).
- NAO escalar para as praias 2-10 ate o Ricardo + re-verificacao passarem.

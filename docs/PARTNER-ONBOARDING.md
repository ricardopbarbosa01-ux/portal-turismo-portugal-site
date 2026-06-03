# PARTNER-ONBOARDING.md

**Protocolo de onboarding de parceiros PTH — Essential €49 + Founder €149**

**Versão:** 1.0
**Criado:** 21/05/2026 (após sessão Good Feeling — ~7h, 3 crises, 6 ADs novos)
**Próxima revisão:** após 2.º e 3.º parceiro onboarded — calibrar tempo real vs estimativa

---

## TL;DR

Este documento é o caminho **único e replicável** para adicionar parceiros à vitrine `/escolas-de-surf` (e futuras vitrines tipo `/operadores-pesca`, `/hoteis-verificados`). Foi construído depois de uma sessão de 7h com 3 crises para onboarding de 1 só parceiro (Good Feeling Surf School). O objectivo é **30-45 min por parceiro**, não 7h.

**Estrutura:** checklist seco em cima (para o Ricardo), prompt-base copy-paste no fim (para Claude Code).

---

## 1. Critérios de qualificação

Não adicionar parceiro à vitrine se NÃO cumprir o mínimo:

| Critério | Mínimo Essential €49 | Mínimo Founder €149 |
|---|---|---|
| Operação activa | Sim, ≥1 ano | Sim, ≥3 anos |
| Rating público (Google ou Tripadvisor) | ≥4.5 com ≥30 reviews | ≥4.7 com ≥100 reviews |
| Multilingue | PT obrigatório | PT + EN mínimo |
| Localização estratégica | Qualquer Algarve, Lisboa, Setúbal, Costa Vicentina | Sagres, Lagos, Ericeira, Peniche, ou equivalente premium |
| Site web próprio | Sim, com HTTPS | Sim, com HTTPS + fotos próprias |
| Certificação relevante | Não obrigatória | Recomendada (FPS para surf, etc.) |
| Autorização documentada | Email/WhatsApp a confirmar uso de logo+fotos+info | Idem |
| Resposta a outreach inicial | <72h | <48h |

Se falhar 2+ critérios Essential → não onboard, manter relação editorial informal.
Se cumprir 4/5 critérios Founder → pitch Founder em vez de Essential.

---

## 2. Decisão Essential €49 vs Founder €149

Pitch tier apropriado **só depois do parceiro demonstrar interesse após inclusão editorial gratuita** (foot-in-the-door). Não vender tier antes de haver relação.

| Sinal | Pitch |
|---|---|
| Parceiro responde rápido + pergunta "quanto custa?" | Essential |
| Parceiro envia material proactivamente (fotos, logo, info detalhada) | Essential ou Founder (avaliar) |
| Parceiro pede destaque, página dedicada, integração em guias | Founder |
| Parceiro tem operação premium + responde em <48h + multilingue + rating ≥4.7 | Founder |
| Parceiro pergunta sobre placement, comissão, anúncios | **STOP** — explicar promise PTH ("verificamos pela verificação, nunca por placement") |

Diferenças visuais entre tiers:
- **Essential €49:** card v2 (logo navy + foto), lista alfabética em `/escolas-de-surf`, 1 update editorial por ano
- **Founder €149:** card v2 idêntico **+** featured top placement, **+** página dedicada `/parceiros/<slug>/`, **+** badge "Founder Partner 2026" visível 12 meses, **+** revisão semestral, **+** inclusão prioritária em guias relevantes

---

## 3. Protocolo investigação pública (AD-20260521-03)

**Antes de adicionar parceiro ao `_data/partners.json`, fazer investigação estruturada.** Apenas dados confirmados, com fonte e nível de confiança. Discrepâncias entre fontes → `null` + nota interna. **NUNCA inventar dados públicos.**

Sequência obrigatória:

| Fonte | Dados a extrair | Nível confiança expectável |
|---|---|---|
| Google Maps / Business Profile | rating, reviews, URL, telefone, hours | ALTA |
| Tripadvisor | rating, reviews, ranking ("#1 em X"), URL | ALTA |
| Instagram oficial | handle, bio, URL, validar branding | ALTA |
| Facebook oficial | URL, validar branding match | MÉDIA |
| Site oficial do parceiro | fundação, certificações, telefone canónico, fotos | ALTA |
| Cross-reference telefone | comparar entre 3+ fontes | ALTA se 2/3 match |

**Output esperado** (template para colar em scratch antes de ir para JSON):

```
=== INVESTIGAÇÃO PÚBLICA — [Nome do parceiro] ===
Data: YYYY-MM-DD

Google Maps:
  - rating: X.X (XX reviews) — fonte: URL
  - telefone: +351 XXX XXX XXX — fonte: URL
  - confiança: ALTA/MÉDIA/BAIXA

Tripadvisor:
  - rating: X.X (XX reviews) — fonte: URL
  - ranking: "#X em [cidade]" — fonte: URL
  - confiança: ALTA/MÉDIA/BAIXA

Instagram: @handle (URL) — confirmado mesmo branding? SIM/NÃO
Facebook: URL — confirmado mesmo branding? SIM/NÃO
Site oficial:
  - fundação: YYYY — fonte: about page URL
  - certificações: [lista] — fonte: URL
  - telefone canónico: [match com Google Maps? SIM/NÃO]

DISCREPÂNCIAS detectadas: [lista, ou "nenhuma"]
Campos com valor `null` no JSON: [lista, ou "nenhum"]
```

Tempo estimado: **15-20 min por parceiro**. Mais que isso → algo está difícil de validar, considerar pausar onboarding.

---

## 4. Protocolo extracção logo + foto + autorização

### 4.1 Logo

1. Visitar site oficial do parceiro
2. Identificar logo principal (header, footer, favicon idealmente em PNG/SVG)
3. Critérios de qualidade:
   - PNG transparente OU SVG
   - Resolução mínima: 400×400 (preferível 518×518 ou maior)
   - Versão **branca/clara** (para fundo navy do card) — se só houver versão escura, pedir ao parceiro ou processar com photo editor (remove background + invert)
   - Sem texto de copyright dentro do logo

4. Processar:
   - Resize para 518×518 ou manter proporção se logo é horizontal
   - Optimizar peso para <50KB
   - Formato final: PNG (não WebP — compatibilidade browser e fallback CSP)

5. Upload Supabase:
   - Bucket: `partner-images`
   - Path: `partner-logos/<slug>.png`
   - **Validar URL público responde HTTP 200 em janela privada antes de continuar**

### 4.2 Foto hero (coluna fundo do card v2)

1. Visitar site do parceiro + fazer pesquisa online complementar
2. Identificar 3-5 candidatas com critérios:
   - Orientação **landscape** ou **quadrada** (NUNCA portrait estreito)
   - Resolução mínima: 800×600
   - **Sem pessoas em primeiro plano identificáveis** (RGPD)
   - **Sem logos de outras marcas** visíveis
   - Boa luz, idealmente mar/praia visível
   - Coerência editorial: foto de uma das praias/spots servidas pelo parceiro (verificar contra lista no JSON)

3. **Apresentar 3-5 candidatas ao Ricardo via mesa de 3 agentes (Designer/Editor/Risco)** antes de escolher.
   - Designer prioriza dimensões + composição
   - Editor prioriza coerência card↔foto
   - Risco prioriza ausência pessoas/marcas

4. Processar:
   - Resize para 1200×900 (4:3) ou 1200×675 (16:9) conforme original
   - Formato final: **WebP** qualidade 85
   - Peso final: <150KB

5. Upload Supabase:
   - Bucket: `partner-images`
   - Path: `partner-photos/<slug>.webp`
   - Validar HTTP 200 público

### 4.3 Autorização

**Não opcional.** Antes de publicar parceiro:

- Pedir confirmação por **email** (preferível) ou WhatsApp
- Template: "Autoriza a Portugal Travel Hub a usar logo da escola, fotos do vosso site e informações públicas (Tripadvisor rating, contactos, redes sociais) na vossa listagem editorial em portalturismoportugal.com?"
- Resposta tem que ser **explícita** ("autorizo", "sim", "ok podem usar")
- Guardar evidência: screenshot do email/WhatsApp em `_diag/partner-authorizations/<slug>-YYYYMMDD.png`
- Registar no `partners.json`:
  - `authorization_source`: "email" / "whatsapp" / "in-person-signed"
  - `authorization_date`: "YYYY-MM-DD"
  - `authorization_evidence`: path do screenshot (offline, não exposto publicamente)

---

## 5. Estrutura de dados em `_data/partners.json`

Modelo completo para um parceiro Essential (campo a campo):

```json
{
  "slug": "good-feeling-surf-school",
  "name": "Good Feeling Surf School",
  "tier": "essential",
  "status": "verified",
  "region": "Algarve",
  "city": "Vila do Bispo",
  "locality": "Raposeira",
  "description_pt": "Escola criada por dois ex-competidores. A diversão levada tão a sério como o ensino do surf.",
  "description_en": "School founded by two ex-competitors. Fun taken as seriously as surf teaching.",
  "languages": ["PT", "EN", "DE"],
  "beaches_served": [
    "praia-da-arrifana",
    "praia-da-amoreira-aljezur",
    "praia-do-castelejo",
    "praia-da-cordoama",
    "praia-de-beliche",
    "praia-do-amado"
  ],
  "founded": 1997,
  "years_in_operation": 29,
  "phone": "+351 968 485 186",
  "website_url": "https://www.goodfeelingsurfschool.com",
  "instagram": "@goodfeelingsurfschool",
  "instagram_url": "https://www.instagram.com/goodfeelingsurfschool/",
  "facebook_url": "https://www.facebook.com/goodfeelingsurfschool/",
  "google_maps_url": null,
  "tripadvisor_rating": 4.8,
  "tripadvisor_reviews": 64,
  "tripadvisor_url": "https://www.tripadvisor.com/...",
  "tripadvisor_ranking_text": "#1 em Vila do Bispo (Tripadvisor)",
  "tripadvisor_ranking_text_en": "#1 in Vila do Bispo (Tripadvisor)",
  "fps_certified": true,
  "logo_url": "https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/partner-images/partner-logos/good-feeling-surf-school.png",
  "logo_treatment": "white-on-navy",
  "hero_photo_url": "https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/partner-images/partner-photos/good-feeling-surf-school.webp",
  "hero_photo_caption_pt": "Praia do Beliche, Sagres",
  "hero_photo_caption_en": "Praia do Beliche, Sagres",
  "hero_photo_source": "site oficial Good Feeling Surf School",
  "verified_since": "2026-05",
  "authorization_source": "email",
  "authorization_date": "2026-05-21",
  "authorization_evidence": "_diag/partner-authorizations/good-feeling-surf-school-20260521.png"
}
```

Campos opcionais que activam features:
- `hero_photo_url` presente → card v2 (Opção 3) automaticamente
- `tier: "founder"` → featured top + página dedicada `/parceiros/<slug>/` + badge
- `fps_certified: true` → badge "Certificada FPS"
- `founded` presente → badge "Desde YYYY · X anos"

---

## 6. Layout card v2 técnico (referência)

### CSS (`css/partners-page.css`)

```css
.partner-card__media { display: flex; flex-direction: column; }

.partner-card__logo-area {
  background: #0a3d6b;
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.partner-card__logo {
  display: block;
  width: 100%;
  max-width: 400px;
  max-height: 400px;
  height: auto;
  object-fit: contain;
  background: transparent;
}

.partner-card__photo-area {
  flex: 1;
  position: relative;
  min-height: 200px;
  overflow: hidden;
}

.partner-card__photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.partner-card__photo-caption {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  color: white;
  font-size: 0.78rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}

@media (max-width: 720px) {
  .partner-card__logo-area { padding: 32px; min-height: 220px; }
  .partner-card__photo-area { min-height: 140px; }
}
```

### CSP em `_headers`

Confirmar que `img-src` contém o subdomain específico ANTES do wildcard:

```
img-src 'self' data: blob:
  https://images.unsplash.com
  https://images.pexels.com
  https://glupdjvdvunogkqgxoui.supabase.co
  https://*.supabase.co
  ...
```

**Razão:** wildcard genérico pode não cobrir subdomain específico em algumas configurações CSP. Lição AD-20260521-04.

### Template build-partners.mjs

Manter inline o CSS do `mobile-bottom-nav` (linhas 389-421 de `beaches.html`) dentro do template gerado. Senão, regressão "triângulo preto abaixo do footer" repete-se. Lição commit `3d62550`.

---

## 7. Workflow git por parceiro

### 7.1 Pre-flight obrigatório (AD-20260521-02)

```bash
cd C:\Users\Powerpc\Portal-turismo-site
bash _scripts/preflight.sh
```

Exit code ≠ 0 → STOP. Não começar trabalho.

Se `preflight.sh` ainda não estiver no repo, primeiro integrar (pendente desde 21/05).

### 7.2 Branch dedicada

```bash
git checkout main
git pull origin main
git checkout -b feat/partner-<slug>
```

**NUNCA trabalhar directamente em main.** Lição da crise CSP de 21/05.

### 7.3 Limite de scope por branch

1 parceiro = 1 branch = 1 merge. Não acumular 3 parceiros na mesma branch — se algo partir, revert atinge todos.

### 7.4 Validação obrigatória ANTES de push

- `python _diag/validate-html.py escolas-de-surf.html`
- `python _diag/validate-html.py en/surf-schools.html`
- Servidor local + Playwright 4 screenshots: PT mobile, PT desktop, EN mobile, EN desktop
- **Validação visual em localhost NÃO chega** (lição AD-20260521-04). Após push, validar produção em janela privada.

### 7.5 NÃO bumpar `?v=` do CSS

Lição AD-20260521-04: cache version bump combinado com propagação Cloudflare gera race condition. Manter version constante a menos que CSS mude significativamente.

### 7.6 GO/NO-GO Ricardo antes de merge

Branch fica no remote (`git push origin feat/partner-<slug>`) mas merge para main **só após Ricardo aprovar visualmente** os 4 screenshots.

### 7.7 Limite operacional

- **Máximo 5 deploys por sessão** (regra emergente 16/05)
- **Máximo 3h cumulativas por sessão** (lição 21/05 — 3 crises em 4h)
- **1 parceiro por sessão se for o primeiro do novo modelo** — onboarding em paralelo só depois de 2-3 parceiros já live e modelo estabilizado

---

## 8. O que NÃO entra (Essential €49)

Features explicitamente fora do tier Essential — não dar grátis, comprometeria pricing Founder:

- ❌ Página dedicada `/parceiros/<slug>/`
- ❌ Featured top placement em `/escolas-de-surf`
- ❌ Badge "Founder Partner 2026"
- ❌ Inclusão prioritária em guias regionais
- ❌ Revisão semestral de conteúdo
- ❌ Mais de 1 foto hero (Essential = 1 foto. Founder = até 4 fotos rotativas/galeria)
- ❌ Estatísticas mensais detalhadas (removidas em 19/05 — insustentáveis para founder solo)
- ❌ Featured em `/surf`, `/pesca`, homepage (removido 19/05 — contradiz brand "verificamos pela verificação, nunca por placement")

---

## 9. Comunicação ao parceiro pós-publicação

(Out of scope deste documento — template comercial separado. Mínimo:)

Email após publicação:
- "A vossa listagem está live em [URL]"
- "Preview do card [screenshot anexado]"
- "Sem custos. Pricing opcional se quiserem mais visibilidade: [link /precos]"
- "Reportem qualquer erro a ola@portalturismoportugal.com"

---

## 10. Lições da sessão Good Feeling (21/05/2026)

Aplicar SEMPRE:

| AD | Lição | Aplicação |
|---|---|---|
| AD-20260521-02 | Pre-flight check obrigatório | `bash _scripts/preflight.sh` no início de cada sessão Claude Code |
| AD-20260521-03 | Investigação pública estruturada | Secção 3 deste documento, antes do JSON |
| AD-20260521-04 (CSP) | Subdomain específico antes do wildcard | Já aplicado em `_headers`, verificar para novos buckets |
| AD-20260521-04 (cache) | NÃO bumpar `?v=` desnecessariamente | Secção 7.5 |
| AD-20260521-04 (visual) | Localhost ≠ validação suficiente | Secção 7.4 — Playwright + janela privada produção |
| `3d62550` (mobile-nav) | mobile-bottom-nav CSS no template | Já no `build-partners.mjs` |
| Sessão (cache browser) | Sintoma "está partido" → Ctrl+F5 janela privada ANTES de investigar | Não escrever prompt Claude Code sem confirmar janela privada primeiro |
| Sessão (delegação fotos) | Escolha de foto é decisão editorial, não técnica | Mesa de 3 (Designer/Editor/Risco) antes de escolher |

---

## 11. Prompt-base para Claude Code (copy-paste)

Template completo para adicionar 1 parceiro Essential. Substituir `<placeholders>` antes de colar.

```
Onboarding novo parceiro Essential €49: <NOME DO PARCEIRO>.
Aplicar layout card v2 (Opcao 3 — split logo navy + foto).

DADOS PRE-VALIDADOS (investigacao publica feita pelo Ricardo):
- Slug: <slug>
- Site oficial: <URL>
- Region: <regiao>
- Cidade: <cidade>
- Localidade: <localidade>
- Description PT: "<descricao>"
- Description EN: "<description>"
- Languages: <["PT", "EN", ...]>
- Beaches served (slugs): <[lista]>
- Founded: <YYYY>
- Phone: <+351 ...>
- Instagram: <@handle>
- Instagram URL: <URL>
- Facebook URL: <URL>
- Tripadvisor rating: <X.X>
- Tripadvisor reviews: <NN>
- Tripadvisor URL: <URL>
- Tripadvisor ranking PT: "<#X em ...>"
- Tripadvisor ranking EN: "<#X in ...>"
- Certificacoes: <FPS / outros / nenhuma>
- Autorizacao: email / whatsapp datada <YYYY-MM-DD>, evidencia em _diag/partner-authorizations/<slug>-YYYYMMDD.png

LOGO E FOTO HERO ja escolhidos pelo Ricardo:
- Logo source URL (site parceiro): <URL>
- Foto hero source URL (site parceiro): <URL>
- Caption foto PT: "<praia, regiao>"
- Caption foto EN: "<beach, region>"

=== FASE 0: PRE-FLIGHT ===

1. bash _scripts/preflight.sh
   (exit 0 obrigatorio para continuar)

2. git status (working tree limpo)
3. git checkout -b feat/partner-<slug>

=== FASE 1: PROCESSAR LOGO ===

4. Download <logo URL> para /tmp/<slug>-logo-original
5. Resize para max 518x518 mantendo proporcao
6. Se logo nao for branco/claro: avisar Ricardo e PARAR (precisa de pre-processamento manual)
7. Optimizar para <50KB, formato PNG
8. Upload Supabase:
   bucket: partner-images
   path: partner-logos/<slug>.png
9. Validar HTTP 200:
   curl -sIk https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/partner-images/partner-logos/<slug>.png

=== FASE 2: PROCESSAR FOTO HERO ===

10. Download <foto URL> para /tmp/<slug>-photo-original
11. Validar visualmente:
    - Sem pessoas identificaveis em 1.o plano
    - Sem logos de outras marcas
    - Landscape ou quadrado
    Se algum falhar: STOP e reportar
12. Resize para 1200x900 (4:3) ou 1200x675 (16:9) conforme original
13. Converter para WebP qualidade 85
14. Peso final <150KB obrigatorio
15. Upload Supabase:
    bucket: partner-images
    path: partner-photos/<slug>.webp
16. Validar HTTP 200

=== FASE 3: ACTUALIZAR _data/partners.json ===

17. Adicionar novo registo com TODOS os campos (ver Seccao 5 do PARTNER-ONBOARDING.md)
18. tier: "essential"
19. status: "verified"
20. verified_since: "<YYYY-MM>"

=== FASE 4: BUILD ===

21. node _scripts/build-partners.mjs
22. Confirmar que escolas-de-surf.html e en/surf-schools.html foram regenerados
23. grep -c "<slug>" escolas-de-surf.html en/surf-schools.html (esperado >=1 em cada)

=== FASE 5: VALIDACAO LOCAL ===

24. python _diag/validate-html.py escolas-de-surf.html
25. python _diag/validate-html.py en/surf-schools.html
26. grep -c 'src="/' escolas-de-surf.html (paths absolutos preservados)
27. grep -A20 "<slug>" escolas-de-surf.html | grep "aggregateRating" (schema enriquecido se rating presente)

28. Servidor local + Playwright:
    python -m http.server 8000 &
    Screenshots:
    - localhost:8000/escolas-de-surf.html (1280x800 + 380x800)
    - localhost:8000/en/surf-schools.html (1280x800 + 380x800)
    Reportar para os 4 viewports:
    - logo visivel no logo-area (sem distorcao)
    - foto visivel no photo-area com caption legivel
    - bounding box logo + foto equilibrados (proximo de 50/50 ou aceitavel)
    - sem triangulo preto, sem layout colapsado

=== FASE 6: COMMIT (NAO MERGE) ===

29. git add _data/partners.json escolas-de-surf.html en/surf-schools.html
30. git commit -m "feat(partners): onboard <NOME DO PARCEIRO> (Essential)"
31. git push origin feat/partner-<slug>

32. STOP. Reportar:
    - hash commit
    - 4 screenshots Playwright
    - URLs Supabase logo + foto
    - confirmacao Fase 5 validacoes
    - peso final logo + foto

Aguardar GO Ricardo via Project Knowledge antes de merge para main.

=== FASE 7 (APOS GO RICARDO): MERGE + SMOKE TEST PRODUcaO ===

33. git checkout main
34. git merge feat/partner-<slug> --no-ff -m "Merge: onboard <NOME DO PARCEIRO>"
35. git push origin main
36. Aguardar 90s

37. Smoke test:
    curl -sk -w "HTTP %{http_code} | Size: %{size_download}\n" https://www.portalturismoportugal.com/escolas-de-surf
    curl -sk -w "HTTP %{http_code} | Size: %{size_download}\n" https://www.portalturismoportugal.com/en/surf-schools
    curl -sIk <URL logo Supabase>
    curl -sIk <URL foto Supabase>
    grep -c "<slug>" /tmp/prod.html /tmp/prod-en.html (esperado 1+ cada)

38. Playwright em janela privada com cache-bust:
    https://www.portalturismoportugal.com/escolas-de-surf?cb=<slug>
    https://www.portalturismoportugal.com/en/surf-schools?cb=<slug>
    Confirmar card novo renderiza correctamente.

39. STOP. Reportar HTTP + size + screenshots + hash final main.

=== FASE 8: CLEANUP ===

40. git push origin --delete feat/partner-<slug>
41. git branch -d feat/partner-<slug>
```

---

## 12. Métricas alvo para próximos onboardings

| Métrica | Good Feeling (1.º) | Target 2.º parceiro | Target 5.º parceiro |
|---|---|---|---|
| Tempo total Claude Code | ~7h (com 3 crises) | <90 min | <45 min |
| Sessões necessárias | 1 longa (overload) | 1 dedicada | 1 paralelo a outras tarefas |
| Crises técnicas | 3 | 0 | 0 |
| Commits | 6+ | 2-3 | 2 |
| Branches | 4 | 1 | 1 |

Se 2.º parceiro demorar >2h ou tiver ≥1 crise → revisitar este documento na próxima retrospectiva mensal (04/06).

---

## 13. Histórico de revisões

| Versão | Data | Notas |
|---|---|---|
| 1.0 | 21/05/2026 | Criação inicial após sessão Good Feeling (~7h, 3 crises, 6 ADs novos). Card v2 Opção 3 em produção. |

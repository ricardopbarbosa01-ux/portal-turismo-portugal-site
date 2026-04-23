# Visual Audit — Playwright + axe-core

Auditoria de contraste WCAG AA usando `@axe-core/playwright` (padrão da indústria).

## Como usar o workflow axe-core

### 1. Instalar dependências (uma vez)

```bash
npm install
```

Se vieres de uma versão anterior deste repo, corre também:
```bash
npm install -D @axe-core/playwright axe-core
```

### 2. Arrancar servidor local

O spec faz hardcode de `http://localhost:3000`. Deixa este terminal a correr:

```bash
npm start
```

(Equivalente a `npx serve . -p 3000` — servidor estático serve `.html` e resolve `/pesca` → `/pesca.html` automaticamente.)

### 3. Correr a auditoria

Noutro terminal:

```bash
npx playwright test tests/visual/contrast-audit.spec.mjs
```

Cobre 4 páginas × 3 zooms = 12 combinações:
- Páginas: `/pesca`, `/surf`, `/praias`, `/webcams`
- Zooms: 80%, 100%, 125%

### 4. Ler o relatório

Output em `tests/visual/screenshots/`:

| Ficheiro | Descrição |
|---|---|
| `axe-report.json` | Array JSON com violações axe-core por página×zoom |
| `pesca-100pct.png` | Screenshot full-page `/pesca` @ 100% |
| `surf-125pct.png` | Screenshot full-page `/surf` @ 125% |
| *(...etc, 12 screenshots)* | |

Formato de `axe-report.json`:
```json
[
  {
    "page": "/pesca",
    "zoom": "100%",
    "violations": [
      {
        "id": "color-contrast",
        "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA...",
        "nodes": [
          {
            "target": [".hero-stat .stat-label"],
            "failureSummary": "Element has insufficient color contrast of 3.12 (foreground...)",
            "html": "<span class=\"stat-label\">...</span>"
          }
        ]
      }
    ],
    "screenshot": "pesca-100pct.png"
  }
]
```

### 5. Claude Code lê o relatório e aplica fixes

Fluxo recomendado:

1. **Claude lê o relatório:**
   ```
   Read Portal-turismo-site/tests/visual/screenshots/axe-report.json
   ```
2. **Claude inspeciona o screenshot relevante** (visão) para confirmar o contexto visual do elemento em falha.
3. **Claude propõe fix cirúrgico** — aponta o selector (`target`), o rácio atual (do `failureSummary`) e a correção CSS (variável de design system, override, etc.).
4. **Re-run** do spec após fix confirma `violations: []` (e a mensagem `✅ /pesca @ 100%: tudo OK` no stdout).

## Porquê axe-core e não código caseiro

- **Menos falsos positivos** — axe-core ignora elementos invisíveis, texto sobre imagens sem contraste computável, etc.
- **Zero manutenção** — as regras WCAG vêm testadas pela Deque (mantém axe-core).
- **Output estruturado** — `failureSummary` inclui rácio + cores + sugestão.
- **Extensível** — basta adicionar regras em `.withRules([...])` (e.g., `'aria-*'`, `'link-name'`).

## Nota histórica

Este spec substituiu em 2026-04-23 uma versão caseira que calculava contraste manualmente via `helpers.js`. O ficheiro `helpers.js` ficou órfão e pode ser removido num futuro `/gsd:quick`.

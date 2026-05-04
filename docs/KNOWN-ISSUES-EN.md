# KNOWN-ISSUES-EN.md — Dívida bilíngue PTH

Última atualização: 2026-05-04

## Issue 1 — Header global em PT no contexto EN

**Sintoma:** Em /pro/welcome.html?lang=en (e em qualquer página /en/*), o header
global continua a mostrar links em PT (Praias, Surf, Pesca, Webcams, Planear,
Guias, Preços, Parceiros, Entrar, Registar) com switch PT|EN a indicar PT ativo.

**Causa raiz:** /js/nav.js renderiza header com strings PT hardcoded. Não lê
document.documentElement.lang nem detecta contexto EN.

**Impacto:** ICP UK ("James, 47, Surrey") clica em "Praias" no welcome EN e
aterra em /praias.html (PT). Quebra coerência da experiência paga.

**Por que NÃO foi corrigido neste sprint:**
- nav.js é partilhado pelas 98 páginas — refactor afeta o site inteiro
- Decisão arquitetural pendente: nav.js bilingue (lê <html lang>) vs nav-en.js
  paralelo vs sistema i18n centralizado
- Escopo rígido da feature welcome.html bilíngue evitou feature creep

**Próximo passo:** Abrir ticket dedicado "Estratégia bilingue PTH 2026" antes
de criar mais features Pro com strings duplicadas (alertas, dashboard, partner).

## Issue 2 — Outras páginas /pro/* (futuras) sem versão EN

(Reservar para quando alertas/dashboard Pro forem construídos.)

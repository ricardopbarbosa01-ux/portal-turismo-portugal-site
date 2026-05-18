# Decisions Log — Portugal Travel Hub

Registo de decisões arquitecturais e editoriais com impacto comercial.
Cada entrada: contexto → decisão → trade-offs → critério de reavaliação.

---

## AD-20260518-01 — Disclosure de financiamento em páginas de metodologia

**Data:** 18/05/2026 · **Status:** Activa · **Commit:** b8f0889

**Contexto:** Inventário em sessão Claude.ai descobriu que (1) expressões
citadas pelo ChatGPT ("verified editorial content", "no disguised sponsored")
existem só em en/media-kit.html linha 440; (2) páginas de metodologia não
têm secção de disclosure de modelo de receita; (3) PTH é publisher Awin
não declarado em nenhum dos 4 ficheiros de transparência. Dois LLMs
independentes avisaram publicamente sobre o gap claim-vs-execução.

**Decisão:** Adicionar secção "Como nos financiamos" / "How we're funded"
em ambas as páginas, declarando GYG, Amazon Associates e parcerias B2B
verificadas explicitamente. Zero alterações ao Media Kit (preservado até
decisão futura). Zero CSS novo.

**Trade-offs:** Pode reduzir "wow factor" do Media Kit B2B. Mesa considerou:
prospects sofisticados valorizam disclosure honesto; prospects que se
afastam por causa disso não eram bons fits.

**Reavaliar:** Em 30 dias (18/06/2026), repetir as 5 queries ChatGPT que originaram
esta decisão e ver se o aviso "don't pretend it is charity journalism"
desaparece quando o ChatGPT recrawl as páginas.

# Smoke test pós-deploy

Lista de URLs de produção que o humano DEVE abrir em janela privada após cada deploy. Se algum estiver partido, fazer rollback imediato (`git revert HEAD` + redeploy).

Tempo estimado: 60 segundos.

## Checklist (5 testes)

| # | URL | O que validar | Sintoma de falha |
|---|---|---|---|
| 1 | https://www.portalturismoportugal.com/ | Homepage carrega; hero visível; navbar funcional | Página em branco, 404, ou loading infinito |
| 2 | https://www.portalturismoportugal.com/beach?id=89fa1083-95bf-42e7-bd28-ad34740851cf | Página da praia "Ilha da Culatra" renderiza com info completa (não só spinner) | Spinner "A carregar informação da praia..." que nunca desaparece — BUG-BEACH-01 regrediu |
| 3 | https://www.portalturismoportugal.com/surf.html | Hero visível a 100% zoom; CTAs "Explorar Spots" + "Planear Escapada de Surf" dentro do viewport | CTAs cortados ou abaixo da fold — BUG-VIS-02 regrediu |
| 4 | https://www.portalturismoportugal.com/contact.html | Form de contacto com widget Turnstile visível e funcional | Erro JS, Turnstile não carrega, ou form esmagado — BUG-VIS-01 regrediu |
| 5 | https://www.portalturismoportugal.com/dashboard.html | Login redirect funciona OU dashboard renderiza para utilizador admin | "db is not defined" no console; redirect infinito |

## Como reportar

Se algum teste falhar, parar tudo. Abrir terminal e correr:

```bash
git log --oneline -5
git revert HEAD
git push origin main
npx wrangler pages deploy . --project-name portal-turismo-portugal-site --commit-dirty=true
```

Documentar o incidente em /docs/AUDIT-MASTER.md como nova entrada com BUG-XXX-NN ID.

## Frequência

Obrigatório após:

- Cada deploy a produção
- Cada PR/branch merge a main
- Sempre que um Quick Task tocar em ≥ 3 ficheiros

Recomendado também:

- Uma vez por semana sem trigger específico (canary check)

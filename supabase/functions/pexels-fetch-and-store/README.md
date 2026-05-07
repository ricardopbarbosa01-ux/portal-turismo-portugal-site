# pexels-fetch-and-store

Edge Function que busca uma foto no Pexels, faz upload ao Supabase Storage (`card-images/beaches/{id}.jpg`) e atualiza as colunas de imagem na tabela `beaches`. Opera apenas em `kind=beach`. Sem optimização (resize/WebP) — isso é feito pelo script Node da Fase 3.

**Idempotente:** se `image_storage_url` já existir para esse `beach_id`, retorna o existente sem refazer trabalho.

---

## Deploy

```powershell
npx supabase functions deploy pexels-fetch-and-store --no-verify-jwt --project-ref glupdjvdvunogkqgxoui
```

> `--no-verify-jwt` é obrigatório — a função é chamada de scripts Node/cron sem token de utilizador.

---

## Teste (PowerShell — Invoke-RestMethod)

> **Nota:** Usa `Invoke-RestMethod`, NÃO `curl.exe` — o curl nativo do Windows tem problemas de SSL revocation neste ambiente.

```powershell
$body = @{ kind = "beach"; beach_id = "PUT-A-REAL-UUID-HERE" } | ConvertTo-Json
Invoke-RestMethod `
  -Uri "https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/pexels-fetch-and-store" `
  -Method Post `
  -Headers @{ "Authorization" = "Bearer $env:SUPABASE_ANON_KEY"; "Content-Type" = "application/json" } `
  -Body $body
```

Para substituir a query automática por uma explícita:

```powershell
$body = @{ kind = "beach"; beach_id = "PUT-A-REAL-UUID-HERE"; query = "Praia da Rocha Algarve portugal" } | ConvertTo-Json
```

---

## Resposta esperada (primeira chamada — `cached: false`)

```json
{
  "storage_url": "https://glupdjvdvunogkqgxoui.supabase.co/storage/v1/object/public/card-images/beaches/<uuid>.jpg",
  "photographer": "Nome do Fotógrafo",
  "pexels_id": "12345678",
  "query_used": "Praia da Rocha Algarve beach portugal",
  "source": "pexels",
  "cached": false
}
```

## Resposta esperada (segunda chamada — `cached: true`)

```json
{
  "storage_url": "https://...",
  "photographer": "Nome do Fotógrafo",
  "pexels_id": "12345678",
  "source": "pexels",
  "cached": true
}
```

---

## Notas

- **Idempotência:** chamadas repetidas ao mesmo `beach_id` retornam o resultado guardado sem consumir quota Pexels.
- **Attribution:** obrigatório pelo Pexels TOS — o campo `photographer` deve ser exibido ao lado da imagem no front-end.
- **Storage path:** `card-images/beaches/{beach_id}.jpg` — upsert com `cacheControl: 31536000` (1 ano).
- **Fase 3:** o script Node `_scripts/populate-images.js` itererá todos os beaches sem `image_storage_url` e chamará esta função em lote.

---

## Diversification (v2)

A v2 da função resolve o problema de fotos repetidas detectado no dry-run de 2026-05-06 (~30-50/109 praias receberam as mesmas 5-10 fotos virais do Pexels).

### Três intervenções

**1. Paginação aleatória com posição variável**
Em vez de pedir `per_page=1` e usar a primeira foto, a v2 pede `per_page=15` e escolhe uma posição aleatória entre 3 e 12. Isso salta as 2-3 fotos mais virais/recorrentes que dominam o topo dos resultados para queries genéricas.

**2. `exclude_pexels_ids` — tracking cross-request**
O cliente (script Node) mantém um `Set` de `pexels_id` já recebidos e envia-o no body de cada chamada. A função evita devolver qualquer foto já usada na mesma sessão.

**3. Rotação de sufixos visuais**
A cada tentativa, é adicionado um sufixo diferente à query base (`cliffs`, `coast`, `sand`, `ocean`, `shore`, `atlantic`, `rocky beach`, `aerial view`, `sunset`, `waves`), diversificando os resultados sem perder relevância geográfica.

### Algoritmo `findPhoto`

1. Para cada attempt (1–4):
   - Suffix: `VISUAL_SUFFIXES[(attempt-1) % VISUAL_SUFFIXES.length]`
   - Query: `${baseQuery} ${suffix}`
   - Page aleatória: 1–3
   - `per_page=15`, posição aleatória 3–12
   - Se foto não está em `excludeIds` → retorna
   - Se todas excluídas → próximo attempt
2. Fallback (após 4 attempts): query base, `per_page=1`, posição 0 — aceita qualquer resultado

### Resposta com diversification (v2, `cached: false`)

```json
{
  "storage_url": "https://...",
  "photographer": "Nome",
  "pexels_id": "12345678",
  "query_used": "Praia da Rocha Algarve beach portugal coast",
  "source": "pexels",
  "cached": false,
  "diversification": {
    "attempts_taken": 2,
    "position_picked": 7,
    "suffix_used": "coast",
    "excluded_count": 12
  }
}
```

### Exemplo com `exclude_pexels_ids` (PowerShell)

```powershell
$body = @{
  kind = "beach"
  beach_id = "PUT-A-REAL-UUID-HERE"
  exclude_pexels_ids = @("12345678", "87654321")
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/pexels-fetch-and-store" `
  -Method Post `
  -Headers @{ "Authorization" = "Bearer $env:SUPABASE_ANON_KEY"; "Content-Type" = "application/json" } `
  -Body $body
```

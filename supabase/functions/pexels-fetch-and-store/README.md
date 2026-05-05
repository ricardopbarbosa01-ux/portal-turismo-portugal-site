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

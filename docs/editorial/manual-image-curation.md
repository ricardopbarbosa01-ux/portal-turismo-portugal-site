# Curadoria Manual de Imagens das Praias

## Quando usar

Quando a Edge Function automática (Wikipedia / Pexels) devolve uma foto que não satisfaz para uma praia específica — por exemplo, foto genérica de praia tropical, imagem irrelevante, ou qualidade insuficiente.

## Workflow passo-a-passo

### 1. Encontrar uma foto adequada

**Wikimedia Commons** (recomendado — licenças CC, URLs estáveis, alta resolução):

1. Pesquisa em `https://commons.wikimedia.org` com o nome da praia (experimenta português e inglês).
2. Filtra por imagens (separador "Media" ou coluna "Images").
3. Escolhe uma com licença **CC BY**, **CC BY-SA** ou **Public Domain** — são todas compatíveis com uso comercial.
4. Clica na imagem → na página de descrição do ficheiro, clica na imagem em alta resolução.
5. Botão direito na imagem → "Copiar endereço da imagem" → esse é o `image_curated_url`.
6. O nome do autor está no campo "Author" da página. Copia para `image_curated_author`.
7. O URL da página `commons.wikimedia.org/wiki/File:...` é o `image_curated_source_url`.

**Pexels** (licença gratuita para uso comercial, sem atribuição obrigatória mas boa prática):

1. Pesquisa em `https://www.pexels.com` com o nome da praia em inglês (melhor cobertura).
2. Escolhe uma foto em orientação paisagem com boa resolução.
3. Clica em "Free Download" → escolhe tamanho "Large" ou "Original".
4. Botão direito na imagem → "Copiar endereço da imagem" → `image_curated_url`.
5. Nome do fotógrafo está abaixo da foto → `image_curated_author`.
6. URL da página da foto (`https://www.pexels.com/photo/...`) → `image_curated_source_url`.

**Unsplash** (licença gratuita para uso comercial):

1. Pesquisa em `https://unsplash.com` com o nome da praia em inglês.
2. Clica na foto → "Download free".
3. Botão direito na imagem descarregada → "Copiar endereço" → `image_curated_url`.
4. Nome do fotógrafo visível na página → `image_curated_author`.
5. URL da página Unsplash da foto → `image_curated_source_url`.

### 2. Preencher na BD via Supabase Table Editor

1. Abre **Supabase Dashboard → Table Editor → beaches**.
2. Filtra a linha da praia (campo `name` ou pesquisa global).
3. Clica na linha para editar e preenche os 3 campos:
   - `image_curated_url` → URL direto da imagem (deve abrir a imagem diretamente no browser, não uma página).
   - `image_curated_author` → nome do fotógrafo/criador (ex: `"Klugschnacker"`, `"João Silva"`).
   - `image_curated_source_url` → URL da página de origem (Wikimedia File page, Pexels photo page, etc.).
4. **Apaga o valor de `image_storage_url`** (define como NULL) — isto limpa o guard de idempotência e força o re-fetch na próxima corrida do script.
5. Guarda.

### 3. Aplicar via populate-images.js

```powershell
cd _scripts
node populate-images.js --apply
```

O script vai detectar que `image_storage_url` está NULL, chamar a Edge Function v4, que vê `image_curated_url` preenchido e usa essa imagem em vez de Wikipedia/Pexels.

Para pré-visualizar sem escrever nada:
```powershell
node populate-images.js
```
(dry-run por omissão — gera relatório HTML mas não actualiza a BD)

## Avisos importantes

- **Licenças**: confirma sempre que a foto permite **uso comercial**. CC BY-NC não é permitida. Pexels License e Unsplash License são permitidas.
- **Atribuição**: o frontend vai mostrar `Photo: <author>` e link para `source_url`. Preenche sempre os dois campos.
- **Resolução**: prefere imagens ≥ 1600px de largura. O script faz resize para baixo (max 1600px), nunca para cima.
- **Formato**: aceita JPEG, PNG, WebP. Evita imagens muito pesadas (> 10 MB) — o download pode expirar.
- **URL direto**: o `image_curated_url` deve apontar directamente para o ficheiro de imagem, não para uma página HTML. Testa colando no browser — deve abrir a imagem, não uma página web.
- **image_curated_* não são alterados pela Edge Function**: estes campos são input editorial e mantêm-se intactos. A Edge Function apenas lê estes campos e escreve em `image_storage_url`, `image_photographer`, `image_source`, etc.

## Exemplo real

Praia do Camilo não tem artigo Wikipedia com infobox, e Pexels devolve Lagos genérico. Processo:

1. Pesquisa "Praia do Camilo" em Wikimedia Commons → encontra `File:Praia_do_Camilo_Lagos.jpg`.
2. Página: `https://commons.wikimedia.org/wiki/File:Praia_do_Camilo_Lagos.jpg`.
3. Imagem em alta resolução: `https://upload.wikimedia.org/wikipedia/commons/a/a1/Praia_do_Camilo_Lagos.jpg`.
4. Autor: `Alvesgaspar` (campo Author na página).
5. Licença: CC BY-SA 3.0 (campo License).
6. Preenche na BD:
   - `image_curated_url` = `https://upload.wikimedia.org/wikipedia/commons/a/a1/Praia_do_Camilo_Lagos.jpg`
   - `image_curated_author` = `Alvesgaspar`
   - `image_curated_source_url` = `https://commons.wikimedia.org/wiki/File:Praia_do_Camilo_Lagos.jpg`
   - `image_storage_url` = NULL (limpar)
7. Corre `node populate-images.js --apply`.
8. Relatório HTML mostra badge dourado "manual" no card da Praia do Camilo.

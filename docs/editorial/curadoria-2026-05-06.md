# Curadoria Editorial de Imagens — 2026-05-06

## Contexto

Esta é a Fase 6A do projeto IMG-FETCH-STORE: worksheet editorial para curadoria manual de imagens das 21 praias prioritárias antes do lançamento. O sistema híbrido (Fase 5) corre Edge Function v4 — manual override (`image_curated_url`) tem prioridade absoluta sobre Wikipedia infobox e Pexels fallback.

**Workflow:**
1. Para cada praia desta lista, abrir o link "Categoria Wikimedia" e/ou "Wikimedia Search".
2. Escolher uma foto adequada (CC BY, CC BY-SA, ou Public Domain — paisagem, alta resolução, representativa do local).
3. Preencher os 3 campos vazios em cada secção: `image_curated_url`, `image_curated_author`, `image_curated_source_url`.
4. No fim, copiar o bloco SQL UPDATE batch, substituir os placeholders `COLAR_URL_AQUI` / `COLAR_AUTHOR_AQUI` / `COLAR_SOURCE_AQUI` pelos valores escolhidos, e correr no Supabase SQL Editor.
5. Após o UPDATE: correr `node _scripts/populate-images.js --apply` para forçar re-fetch e usar a imagem curada.

**Regras de licenciamento (Wikimedia):** apenas CC BY, CC BY-SA, ou Public Domain. Reproduzir o nome do autor exatamente como aparece no campo "Author" da página File: do Wikimedia. Se não há autor visível, escrever `"Wikimedia Commons contributor"`.

**NÃO esquecer:** apagar `image_storage_url` (definir NULL) — caso contrário a Edge Function v4 vai usar a versão em cache do Storage e ignorar o curated. O bloco SQL no fim do documento já inclui isso.

---

## Algarve (5 praias, 6 entradas — Alvor duplicado na BD)

### 1. Praia da Marinha — re-curadoria
- **UUID:** `66ee7f6b-018b-408b-8d48-c58d2f73bf8d`
- **Região BD:** Algarve
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_da_Marinha
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+da+Marinha&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 2. Praia de Benagil — re-curadoria
- **UUID:** `d3bb1bb1-4e97-424d-9267-710673662975`
- **Região BD:** Algarve
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Benagil
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Benagil&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 3. Praia de Carvoeiro — re-curadoria
- **UUID:** `23467c12-84bc-4590-a3a8-32412c15fcde`
- **Região BD:** Algarve
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Carvoeiro
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Carvoeiro&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 4a. Praia de Alvor (UUID: 010ffc15) — re-curadoria
- **UUID:** `010ffc15-3125-4156-aa4f-54b6198ae8e3`
- **Região BD:** Algarve
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Alvor
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Alvor&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 4b. Praia de Alvor (UUID: 925ac239) — re-curadoria
- **UUID:** `925ac239-db1f-432b-98ee-7a308ae9a6b8`
- **Região BD:** Algarve
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Alvor
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Alvor&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

---

## Lisboa / Oeste / Setúbal (7 praias)

### 5. Praia de Cascais — re-curadoria
- **UUID:** `fede421d-0f75-46f7-9248-9a374bc63c4c`
- **Região BD:** Lisboa e Setúbal
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Cascais
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Cascais&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 6. Praia da Costa de Caparica — re-curadoria
- **UUID:** `49839927-ee16-498b-80a8-f029627fd4c5`
- **Região BD:** Oeste
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_da_Costa_de_Caparica
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+da+Costa+de+Caparica&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 7. Praia Grande — re-curadoria
- **UUID:** `513d687d-b8f9-4d87-b5a7-c6de1d7d695c`
- **Região BD:** Oeste
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_Grande_(Colares)
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+Grande+Colares+Portugal&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 8. Praia das Maçãs — re-curadoria
- **UUID:** `d81736c8-0e7d-4d98-b369-377998fc5c2f`
- **Região BD:** Oeste
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_das_Maçãs
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+das+Ma%C3%A7%C3%A3s&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 9. Praia dos Galapinhos — re-curadoria
- **UUID:** `3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7`
- **Região BD:** Lisboa e Setúbal
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_dos_Galapinhos
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+dos+Galapinhos&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 10. Praia de São João do Estoril — re-curadoria
- **UUID:** `f893e0a8-9f2e-4533-9093-001877541cf1`
- **Região BD:** Oeste
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_São_João_do_Estoril
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+S%C3%A3o+Jo%C3%A3o+do+Estoril&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 11. Praia de Supertubos — re-curadoria
- **UUID:** `0f616614-30d1-488a-986a-acd1caebbe6c`
- **Região BD:** Oeste
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Supertubos
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Supertubos&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

---

## Centro (3 praias)

### 12. Praia da Murtinheira — re-curadoria
- **UUID:** `b5d5f332-d553-49d9-ad92-77d658de945f`
- **Região BD:** Centro
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_da_Murtinheira
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+da+Murtinheira&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 13. Praia de Peniche — re-curadoria
- **UUID:** `ffe1a91f-de57-4ff0-9ad5-d32951851730`
- **Região BD:** Centro
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Peniche_(beaches)
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Peniche+Portugal&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 14. Praia do Norte — re-curadoria
- **UUID:** `74421a75-f67c-45d5-928f-b7fae44adc33`
- **Região BD:** Centro
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_do_Norte_(Nazaré)
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+do+Norte+Nazar%C3%A9&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

---

## Norte (4 praias)

### 15. Praia das Caxinas — re-curadoria
- **UUID:** `f7fa6d81-2872-4971-be81-42464b11ac9f`
- **Região BD:** Norte
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_das_Caxinas
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+das+Caxinas+Vila+do+Conde&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 16. Praia do Cabedelo — re-curadoria
- **UUID:** `10f7f046-fb30-493e-acf0-bf6b2a57858b`
- **Região BD:** Norte
- **Atual:** `pexels`
- **Nota:** BD classifica como Norte (Viana do Castelo); plano inicial sugeria Centro (Figueira da Foz) — seguido o valor real da BD.
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_do_Cabedelo
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+do+Cabedelo+Viana+do+Castelo&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 17. Vila Praia de Âncora — re-curadoria
- **UUID:** `43290bbc-db7f-4b1e-9cb5-a51b644c0ca6`
- **Região BD:** Norte
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Vila_Praia_de_Âncora
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Vila+Praia+de+%C3%82ncora&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 18. Praia de Ofir — re-curadoria
- **UUID:** `dd37d1cd-8ecc-45af-b8d2-3ceabf881969`
- **Região BD:** Norte
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Ofir
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Ofir+Esposende&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

---

## Alentejo (3 praias)

### 19. Praia de São Torpes — re-curadoria
- **UUID:** `dee27f4d-ec13-43b4-a618-4ac272d22cf2`
- **Região BD:** Alentejo
- **Atual:** `wikipedia_infobox`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_São_Torpes
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+S%C3%A3o+Torpes+Sines&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 20. Praia de Vila Nova de Milfontes — re-curadoria
- **UUID:** `2dd735c3-9317-45bb-aed7-c3832af7653d`
- **Região BD:** Alentejo
- **Atual:** `pexels`
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Vila_Nova_de_Milfontes
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Vila+Nova+de+Milfontes&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

### 21. Praia de Tróia — re-curadoria
- **UUID:** `0b9d2380-38cf-437d-a4e3-4b68158ba2a4`
- **Região BD:** Alentejo
- **Atual:** `pexels`
- **Nota:** BD classifica como Alentejo; plano inicial agrupava com Lisboa/Setúbal — seguido o valor real da BD.
- **Categoria Wikimedia:** https://commons.wikimedia.org/wiki/Category:Praia_de_Tróia
- **Wikimedia Search:** https://commons.wikimedia.org/w/index.php?search=Praia+de+Tr%C3%B3ia+Setubal&title=Special:MediaSearch&go=Go&type=image
- **A preencher:**
  - `image_curated_url`: 
  - `image_curated_author`: 
  - `image_curated_source_url`: 

---

## SQL UPDATE batch

> **Antes de correr:** substituir TODOS os placeholders `COLAR_URL_AQUI`, `COLAR_AUTHOR_AQUI`, `COLAR_SOURCE_AQUI`. Praias deixadas em branco devem ter as 3 linhas comentadas com `--` ou removidas. A linha `image_storage_url = NULL` é INTENCIONAL e necessária — limpa o cache de idempotência.

```sql
BEGIN;

-- 1. Praia da Marinha (Algarve)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '66ee7f6b-018b-408b-8d48-c58d2f73bf8d';

-- 2. Praia de Benagil (Algarve)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'd3bb1bb1-4e97-424d-9267-710673662975';

-- 3. Praia de Carvoeiro (Algarve)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '23467c12-84bc-4590-a3a8-32412c15fcde';

-- 4a. Praia de Alvor (UUID: 010ffc15) (Algarve)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '010ffc15-3125-4156-aa4f-54b6198ae8e3';

-- 4b. Praia de Alvor (UUID: 925ac239) (Algarve)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '925ac239-db1f-432b-98ee-7a308ae9a6b8';

-- 5. Praia de Cascais (Lisboa e Setúbal)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'fede421d-0f75-46f7-9248-9a374bc63c4c';

-- 6. Praia da Costa de Caparica (Oeste)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '49839927-ee16-498b-80a8-f029627fd4c5';

-- 7. Praia Grande (Oeste)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '513d687d-b8f9-4d87-b5a7-c6de1d7d695c';

-- 8. Praia das Maçãs (Oeste)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'd81736c8-0e7d-4d98-b369-377998fc5c2f';

-- 9. Praia dos Galapinhos (Lisboa e Setúbal)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7';

-- 10. Praia de São João do Estoril (Oeste)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'f893e0a8-9f2e-4533-9093-001877541cf1';

-- 11. Praia de Supertubos (Oeste)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '0f616614-30d1-488a-986a-acd1caebbe6c';

-- 12. Praia da Murtinheira (Centro)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'b5d5f332-d553-49d9-ad92-77d658de945f';

-- 13. Praia de Peniche (Centro)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'ffe1a91f-de57-4ff0-9ad5-d32951851730';

-- 14. Praia do Norte (Centro)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '74421a75-f67c-45d5-928f-b7fae44adc33';

-- 15. Praia das Caxinas (Norte)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'f7fa6d81-2872-4971-be81-42464b11ac9f';

-- 16. Praia do Cabedelo (Norte)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '10f7f046-fb30-493e-acf0-bf6b2a57858b';

-- 17. Vila Praia de Âncora (Norte)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '43290bbc-db7f-4b1e-9cb5-a51b644c0ca6';

-- 18. Praia de Ofir (Norte)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'dd37d1cd-8ecc-45af-b8d2-3ceabf881969';

-- 19. Praia de São Torpes (Alentejo)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = 'dee27f4d-ec13-43b4-a618-4ac272d22cf2';

-- 20. Praia de Vila Nova de Milfontes (Alentejo)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '2dd735c3-9317-45bb-aed7-c3832af7653d';

-- 21. Praia de Tróia (Alentejo)
UPDATE beaches SET
  image_curated_url = 'COLAR_URL_AQUI',
  image_curated_author = 'COLAR_AUTHOR_AQUI',
  image_curated_source_url = 'COLAR_SOURCE_AQUI',
  image_storage_url = NULL
WHERE id = '0b9d2380-38cf-437d-a4e3-4b68158ba2a4';

COMMIT;
```

---

## Histórico
- 2026-05-06: Documento criado (Fase 6A do projeto IMG-FETCH-STORE). 21 praias, 22 entradas (Alvor duplicado na BD: 2 UUIDs). Todos os UUIDs obtidos via Supabase REST API GET /rest/v1/beaches. Coluna de referência: `image_source` (nome real na BD; plano usava `image_url_source` — corrigido após query 400).

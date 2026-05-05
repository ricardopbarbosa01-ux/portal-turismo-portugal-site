# Bucket Storage: card-images

## Configuração

- **Nome**: `card-images`
- **Visibilidade**: público read (sem auth)
- **Escrita**: apenas service_role (Edge Functions)
- **File size limit**: 5 MB
- **MIME types permitidos**: `image/jpeg`, `image/webp`
- **Cache control**: `max-age=31536000` (1 ano)

## Path structure

```
card-images/
├── beaches/
│   ├── {beach_uuid}.jpg
│   └── {beach_uuid}.webp
├── guides/
│   ├── {guide-slug}/
│   │   ├── {card-slug}.jpg
│   │   └── {card-slug}.webp
└── heroes/
    ├── {page-slug}.jpg
    └── {page-slug}.webp
```

Exemplos:
- `card-images/beaches/a1b2c3d4-....jpg`
- `card-images/guides/surf-portugal-iniciantes/card-1.jpg`
- `card-images/heroes/pesca-pt.jpg`

## Criação manual via Supabase Dashboard

1. Login em https://supabase.com/dashboard/project/glupdjvdvunogkqgxoui
2. Navegar para **Storage** → **New bucket**
3. Nome: `card-images`
4. Public bucket: **ON** (toggle ativado)
5. File size limit: `5 MB`
6. Allowed MIME types: `image/jpeg, image/webp`
7. Save

## RLS policies

Aplicar policies em `docs/migrations/2026-05-06-card-images-storage-policies.sql` via SQL Editor após criar o bucket.

## Verificação

Após criar o bucket e aplicar policies, correr `_scripts/verify-phase-1.ps1`:

- Confirma que coluna `beaches.image_storage_url` existe
- Confirma que GET a URL fictícia do bucket retorna 404 (bucket existe, ficheiro não)
- Output: "Phase 1 setup OK" se tudo passa

## Rollback

1. Apagar bucket via Dashboard (Storage → card-images → Delete)
2. Correr rollback SQL da migration `2026-05-06-add-image-storage-url.sql`

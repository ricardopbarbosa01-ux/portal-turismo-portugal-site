-- Lote C 09/10/2026 (auditoria F9): praias de Cascais, Sintra e Setubal estavam com region = 'Oeste'
-- (hero "Portugal · Oeste", GYG "Nazare", "Onde ficar no Oeste", praias semelhantes do Oeste).
-- Todas ficam a sul de 38.93 N (concelhos de Setubal, Sesimbra, Cascais e Sintra) -> 'Lisboa e Setubal'.
-- Aplicar no Supabase: SQL Editor -> colar -> Run (ou `npx supabase db push`).
update public.beaches
set region = 'Lisboa e Setúbal', updated_at = now()
where region = 'Oeste'
  and id in (
    'cb7d55ac-702f-49ec-98f7-d2c8c8e62715', -- Portinho da Arrabida (Setubal)
    '4b7f7ece-a91f-4ef0-bd4f-f8f280a6b78a', -- Praia do Meco (Sesimbra)
    'e11188da-c19e-4c9d-a2a6-59f777412a05', -- Lagoa de Albufeira (Sesimbra)
    'e3da620e-beaf-4a4a-80e3-d3f94c3a311e', -- Praia da Crismina (Cascais)
    '8d29adfa-7276-4074-bce6-dc1c6b49ae12', -- Praia do Guincho (Cascais)
    'a0529d77-b688-4293-ba11-8f023a69e4cf', -- Praia da Ursa (Sintra)
    '6541d792-54dd-4b32-b89c-02ef4c7c9f90', -- Praia da Adraga (Sintra)
    '513d687d-b8f9-4d87-b5a7-c6de1d7d695c', -- Praia Grande (Sintra)
    'd81736c8-0e7d-4d98-b369-377998fc5c2f', -- Praia das Macas (Sintra)
    '5ed26c4c-0979-4497-a021-253ef66f6aeb'  -- Praia do Magoito (Sintra)
  );
-- Verificar: select name, region from public.beaches where id in (...);  -> 10 linhas com 'Lisboa e Setúbal'

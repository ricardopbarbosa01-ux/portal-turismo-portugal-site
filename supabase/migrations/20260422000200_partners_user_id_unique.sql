-- UNIQUE constraint em partners.user_id
-- Previne duplicados acidentais (1 user = 1 perfil de parceiro)
-- Aplicar APENAS após confirmar zero duplicados via query de auditoria

alter table public.partners
  add constraint partners_user_id_unique unique (user_id);

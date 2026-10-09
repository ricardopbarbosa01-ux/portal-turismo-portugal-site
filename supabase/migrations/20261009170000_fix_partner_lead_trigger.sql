-- 09/10/2026 — Lote F3: o trigger de partner_leads usava NEW.nome, campo que esta tabela não tem.
-- Resultado: TODOS os inserts em partner_leads falhavam ("record "new" has no field "nome""), PT e EN.
-- Correção: passar os campos reais à função send-partner-alert e nunca deixar o email bloquear a gravação do pedido.
create or replace function public.on_partner_lead_created()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  begin
    perform private.invoke_edge_function('send-partner-alert', jsonb_build_object(
      'lead_id',     NEW.id,
      'negocio',     NEW.negocio,
      'contacto',    NEW.contacto,
      'email',       NEW.email,
      'tipo',        NEW.tipo,
      'plano',       NEW.plano,
      'regiao',      NEW.regiao,
      'localizacao', NEW.localizacao,
      'mensagem',    NEW.mensagem
    ));
  exception when others then
    -- o pedido fica gravado mesmo que o email de alerta falhe
    raise warning 'send-partner-alert falhou: %', sqlerrm;
  end;
  return NEW;
end;
$function$;

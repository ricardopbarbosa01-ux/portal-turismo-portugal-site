-- Aplicado manualmente no Supabase SQL Editor a 29 Abr 2026
-- Securiza emails: chamadas movidas de frontend → DB triggers (server-side)
-- Idempotente via DROP TRIGGER IF EXISTS

CREATE SCHEMA IF NOT EXISTS private;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION private.invoke_edge_function(function_name text, payload jsonb)
RETURNS bigint AS $$
DECLARE
  request_id bigint;
  service_key text;
BEGIN
  service_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1);
  IF service_key IS NULL THEN
    RAISE EXCEPTION 'service_role_key não encontrado no vault.';
  END IF;
  SELECT net.http_post(
    url := 'https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/' || function_name,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
    body := payload
  ) INTO request_id;
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.on_user_confirmed()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    PERFORM private.invoke_edge_function('send-welcome', jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_user_confirmed ON auth.users;
CREATE TRIGGER trigger_user_confirmed AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.on_user_confirmed();

CREATE OR REPLACE FUNCTION public.on_plan_request_created()
RETURNS trigger AS $$
BEGIN
  PERFORM private.invoke_edge_function('send-plan-confirm', jsonb_build_object(
    'email', NEW.email, 'name', NEW.nome, 'request_id', NEW.id
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_plan_request_created ON public.plan_requests;
CREATE TRIGGER trigger_plan_request_created AFTER INSERT ON public.plan_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_plan_request_created();

CREATE OR REPLACE FUNCTION public.on_partner_lead_created()
RETURNS trigger AS $$
BEGIN
  PERFORM private.invoke_edge_function('send-partner-alert', jsonb_build_object(
    'email', NEW.email, 'nome', NEW.nome, 'lead_id', NEW.id
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_partner_lead_created ON public.partner_leads;
CREATE TRIGGER trigger_partner_lead_created AFTER INSERT ON public.partner_leads
  FOR EACH ROW EXECUTE FUNCTION public.on_partner_lead_created();

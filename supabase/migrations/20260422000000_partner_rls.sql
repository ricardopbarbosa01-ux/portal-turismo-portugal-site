-- RLS policies for partner portal and public forms
-- Tables covered: plan_requests, partners, partner_leads, lead_meta
-- Auth pattern: anon key + JWT claims (dashboard uses SUPABASE_ANON_KEY, NOT service_role)
-- Admin check:  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- Partner check: EXISTS on partners table (aprovado = true, regiao matches)

-- ─── plan_requests ────────────────────────────────────────────────────────────

alter table public.plan_requests enable row level security;

-- Public form submission (planear.html → js/planear.js)
create policy "anon_insert_plan_request"
  on public.plan_requests for insert
  to anon
  with check (true);

-- Partner reads own-region leads only
create policy "partner_select_own_region"
  on public.plan_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.partners p
      where p.user_id = auth.uid()
        and p.aprovado = true
        and p.regiao   = plan_requests.regiao
    )
  );

-- Admin full access
create policy "admin_all_plan_requests"
  on public.plan_requests for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── partners ─────────────────────────────────────────────────────────────────

alter table public.partners enable row level security;

-- Partner reads and updates own profile (parceiro.html dashboard)
create policy "partner_select_own_profile"
  on public.partners for select
  to authenticated
  using (user_id = auth.uid());

create policy "partner_update_own_profile"
  on public.partners for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin full access (CRM + approval workflow)
create policy "admin_all_partners"
  on public.partners for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── partner_leads ────────────────────────────────────────────────────────────

alter table public.partner_leads enable row level security;

-- Public B2B signup form (parceiros.html → js/parceiros.js)
create policy "anon_insert_partner_application"
  on public.partner_leads for insert
  to anon
  with check (true);

-- Admin full access (review applications in CRM dashboard)
create policy "admin_select_partner_leads"
  on public.partner_leads for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── lead_meta ────────────────────────────────────────────────────────────────
-- Replace overly permissive crm_operators_all (USING true for all authenticated)
-- with admin-only access that matches the dashboard gate at dashboard.html:889

drop policy if exists "crm_operators_all" on public.lead_meta;

create policy "admin_all_lead_meta"
  on public.lead_meta for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

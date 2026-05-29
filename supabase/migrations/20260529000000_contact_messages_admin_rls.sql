-- Allow admins to perform all operations on contact_messages.
-- context_messages had anon INSERT dropped in SEC-01 (commits 260504-l95) but never
-- received an explicit admin ALL policy, leaving DELETE/UPDATE blocked by RLS for admins.
-- Pattern mirrors admin_all_plan_requests and admin_all_lead_meta.

CREATE POLICY "admin_all_contact_messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING      ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Retroactive migration: documents the alerts table that already exists in production
-- and adds the snoozed_until column for the Pro alerts management feature.
-- Idempotent: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS — safe to re-run.

-- ─── 1. Table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alerts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beach_id         uuid        NOT NULL,
  beach_name       text        NOT NULL,
  condition        text        NOT NULL,
  operator         text        NOT NULL,
  threshold        numeric     NOT NULL,
  unit             text        NOT NULL DEFAULT 'm',
  active           boolean     NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. New column for snooze feature ────────────────────────────────────────

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz NULL;

-- ─── 3. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- SELECT: user sees only their own alerts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'alerts_select_own'
  ) THEN
    CREATE POLICY alerts_select_own ON public.alerts
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- INSERT: user can only insert alerts for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'alerts_insert_own'
  ) THEN
    CREATE POLICY alerts_insert_own ON public.alerts
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- UPDATE: user can only update their own alerts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'alerts_update_own'
  ) THEN
    CREATE POLICY alerts_update_own ON public.alerts
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- DELETE: user can only delete their own alerts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'alerts_delete_own'
  ) THEN
    CREATE POLICY alerts_delete_own ON public.alerts
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- ─── 4. Performance index ─────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS alerts_user_active_idx
  ON public.alerts (user_id, active);

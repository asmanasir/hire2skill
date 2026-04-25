-- Block repeatedly bouncing/problematic email addresses from auth workflows

BEGIN;

CREATE TABLE IF NOT EXISTS public.email_denylist (
  id            bigserial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  domain        text NOT NULL,
  reason        text,
  source        text NOT NULL DEFAULT 'manual',
  active        boolean NOT NULL DEFAULT true,
  bounce_count  integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_denylist_domain ON public.email_denylist(domain);
CREATE INDEX IF NOT EXISTS idx_email_denylist_active ON public.email_denylist(active);

CREATE OR REPLACE FUNCTION public.set_email_denylist_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_denylist_updated_at ON public.email_denylist;
CREATE TRIGGER trg_email_denylist_updated_at
  BEFORE UPDATE ON public.email_denylist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_denylist_updated_at();

ALTER TABLE public.email_denylist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_denylist_no_direct_access" ON public.email_denylist;
CREATE POLICY "email_denylist_no_direct_access"
  ON public.email_denylist
  FOR ALL
  USING (false)
  WITH CHECK (false);

COMMIT;

-- Used by /api/auth/email-registered (service role only) for login UX (e.g. FINN-style "no account" hint).
CREATE OR REPLACE FUNCTION public.auth_email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.email IS NOT NULL
      AND lower(u.email) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.auth_email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_email_exists(text) TO service_role;

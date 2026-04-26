-- Broaden auth_email_exists: match auth.users.email and auth.identities.identity_data.email
-- (some flows store email only on the identity row).
CREATE OR REPLACE FUNCTION public.auth_email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.email IS NOT NULL
      AND lower(trim(u.email)) = lower(trim(p_email))
    UNION
    SELECT 1
    FROM auth.identities i
    WHERE i.identity_data IS NOT NULL
      AND nullif(trim(i.identity_data->>'email'), '') IS NOT NULL
      AND lower(trim(i.identity_data->>'email')) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.auth_email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_email_exists(text) TO service_role;

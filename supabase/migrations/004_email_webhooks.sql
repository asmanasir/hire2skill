-- Email notification webhooks via pg_net (Supabase built-in extension)
-- These call the deployed Supabase Edge Functions on relevant table events.
--
-- BEFORE running this migration:
--   1. Deploy the three edge functions (see supabase/functions/)
--   2. Set the RESEND_API_KEY, APP_URL secrets on the functions
--   3. Replace <PROJECT_REF> below with your Supabase project reference
--      (found in Settings → General → Reference ID)
--   4. Replace <SUPABASE_ANON_KEY> with your project's anon key
--      (found in Settings → API → Project API keys)
--
-- Alternatively, use the Supabase Dashboard → Database → Webhooks UI
-- to point each trigger to the function URLs — no SQL needed.

-- Create private schema for internal helper functions
CREATE SCHEMA IF NOT EXISTS private;

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ──────────────────────────────────────────────────────────────────────────────
-- Helper: call an edge function asynchronously (fire-and-forget)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.call_edge_function(
  function_name text,
  payload       jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  project_ref  text := '<PROJECT_REF>';
  anon_key     text := '<SUPABASE_ANON_KEY>';
  url          text;
BEGIN
  url := 'https://' || project_ref || '.supabase.co/functions/v1/' || function_name;
  PERFORM extensions.http_post(
    url,
    payload::text,
    'application/json',
    ARRAY[extensions.http_header('Authorization', 'Bearer ' || anon_key)]
  );
EXCEPTION WHEN OTHERS THEN
  -- Never let notification errors break the main transaction
  NULL;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: new booking → notify helper
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.trg_notify_new_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM private.call_edge_function(
    'notify-new-booking',
    jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)::jsonb,
      'old_record', NULL
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
CREATE TRIGGER trg_notify_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION private.trg_notify_new_booking();

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: booking accepted → notify poster
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.trg_notify_booking_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    PERFORM private.call_edge_function(
      'notify-booking-accepted',
      jsonb_build_object(
        'type', 'UPDATE',
        'record', row_to_json(NEW)::jsonb,
        'old_record', row_to_json(OLD)::jsonb
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking_accepted ON public.bookings;
CREATE TRIGGER trg_notify_booking_accepted
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION private.trg_notify_booking_accepted();

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: new message → notify recipient
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.trg_notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM private.call_edge_function(
    'notify-new-message',
    jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)::jsonb,
      'old_record', NULL
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION private.trg_notify_new_message();

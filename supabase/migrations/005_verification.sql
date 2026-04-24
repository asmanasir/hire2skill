-- Verification system: ID document upload + admin review + elite tier

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_doc_url text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_note text,  -- admin rejection reason
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Keep verified boolean in sync with verification_status
CREATE OR REPLACE FUNCTION public.sync_verified_flag()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.verified := (NEW.verification_status = 'verified');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_verified ON public.profiles;
CREATE TRIGGER trg_sync_verified
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_verified_flag();

-- Storage bucket for ID documents (private — service role only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-documents',
  'id-documents',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own docs; nobody can read (service role only)
CREATE POLICY "users upload own id doc"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can read/update their own profile verification fields
-- (existing RLS policies cover this via profiles table)

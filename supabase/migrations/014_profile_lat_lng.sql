-- WGS84 coordinates for helper map pins (geocoded from profiles.location server-side).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN public.profiles.latitude IS 'WGS84 latitude; set when location is geocoded (Norway)';
COMMENT ON COLUMN public.profiles.longitude IS 'WGS84 longitude; set when location is geocoded (Norway)';

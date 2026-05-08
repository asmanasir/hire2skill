-- Auto-increment/decrement profiles.tasks_done when a booking status
-- transitions to or from 'completed'.
-- Also backfills existing completed bookings so current counts are correct.

CREATE OR REPLACE FUNCTION public.sync_tasks_done()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.profiles
    SET tasks_done = GREATEST(COALESCE(tasks_done, 0) + 1, 0)
    WHERE id = NEW.helper_id;

  ELSIF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    UPDATE public.profiles
    SET tasks_done = GREATEST(COALESCE(tasks_done, 0) - 1, 0)
    WHERE id = NEW.helper_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_tasks_done ON public.bookings;
CREATE TRIGGER trg_sync_tasks_done
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_tasks_done();

-- Backfill: set tasks_done to actual count of completed bookings for all helpers
UPDATE public.profiles p
SET tasks_done = (
  SELECT COUNT(*)::int
  FROM   public.bookings b
  WHERE  b.helper_id = p.id
  AND    b.status    = 'completed'
)
WHERE p.role = 'helper';

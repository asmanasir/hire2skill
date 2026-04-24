-- ─────────────────────────────────────────────────────────────────────────────
-- reviews table + auto-update profile avg_rating
-- Run this in the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add rating columns to profiles
alter table public.profiles
  add column if not exists avg_rating numeric(3,2) default 0,
  add column if not exists review_count int default 0;

-- 2. Reviews table
create table if not exists public.reviews (
  id           uuid        primary key default gen_random_uuid(),
  booking_id   uuid        not null references public.bookings(id) on delete cascade,
  reviewer_id  uuid        not null references auth.users(id) on delete cascade,
  reviewee_id  uuid        not null references auth.users(id) on delete cascade,
  rating       smallint    not null check (rating between 1 and 5),
  body         text,
  created_at   timestamptz not null default now(),
  unique (booking_id, reviewer_id)          -- one review per person per booking
);

-- 3. RLS
alter table public.reviews enable row level security;

create policy "reviews_select_all"
  on public.reviews for select using (true);

create policy "reviews_insert_own"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- 4. Trigger: recompute avg_rating + review_count on profile after any review change
create or replace function public.sync_profile_rating()
returns trigger language plpgsql security definer as $$
declare
  target uuid := coalesce(
    case when TG_OP = 'DELETE' then old.reviewee_id else new.reviewee_id end,
    old.reviewee_id
  );
begin
  update public.profiles
  set
    avg_rating   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where reviewee_id = target), 0),
    review_count = (select count(*) from public.reviews where reviewee_id = target)
  where id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_profile_rating on public.reviews;
create trigger trg_sync_profile_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_profile_rating();

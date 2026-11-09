-- Bondly: per-user synced state.
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- One row per user. Each column holds one part of the app's state as JSON,
-- matching what the app keeps on the device:
--   onboarding: { completed, answers }
--   progress:   { completedLessons, checkIns, lessonDays }
--   journal:    { entries, deletedIds }
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  onboarding jsonb not null default '{}'::jsonb,
  progress   jsonb not null default '{}'::jsonb,
  journal    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row-level security: people can only see and change their own row.
alter table public.user_state enable row level security;

drop policy if exists "Read own state" on public.user_state;
create policy "Read own state" on public.user_state
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Insert own state" on public.user_state;
create policy "Insert own state" on public.user_state
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Update own state" on public.user_state;
create policy "Update own state" on public.user_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own state" on public.user_state;
create policy "Delete own state" on public.user_state
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Keep updated_at current on every change.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch
  before update on public.user_state
  for each row execute function public.touch_updated_at();

-- Lets a signed-in person permanently delete their own account.
-- Deleting the auth user also deletes their user_state row (on delete cascade).
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

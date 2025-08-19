-- Schema for events and song requests
-- Run this in Supabase SQL editor or via supabase CLI

-- Enable necessary extensions
create extension if not exists pgcrypto;

-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  is_live boolean not null default false,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

-- Ensure columns exist if the table already existed without them
alter table public.events add column if not exists event_date date;
alter table public.events add column if not exists is_live boolean;
alter table public.events alter column is_live set default false;
update public.events set is_live = false where is_live is null;
alter table public.events alter column is_live set not null;
alter table public.events add column if not exists started_at timestamptz;
alter table public.events add column if not exists created_at timestamptz default now();
-- Optional metadata for richer event pages
alter table public.events add column if not exists venue text;
alter table public.events add column if not exists address text;
alter table public.events add column if not exists start_time text;
alter table public.events add column if not exists end_time text;
alter table public.events add column if not exists description text;




-- Only one event can be live at a time
create unique index if not exists one_live_event on public.events (is_live) where is_live = true;
create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_created_at_idx on public.events (created_at desc);

-- Song requests table
create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  song text not null,
  artist text,
  requester_name text,
  status text not null default 'pending' check (status in ('pending','approved','played','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists song_requests_event_idx on public.song_requests (event_id);
create index if not exists song_requests_created_idx on public.song_requests (created_at desc);

-- RLS
alter table public.events enable row level security;
alter table public.song_requests enable row level security;

-- Allow anon to read the currently live event (id/name/date flags)
drop policy if exists public_select_live_event on public.events;
create policy public_select_live_event on public.events
  for select to anon
  using (is_live = true);

-- Deny anon reads of song_requests by default (no policy -> denied)
-- Allow anon inserts of song_requests only when the target event is live
drop policy if exists public_insert_when_live on public.song_requests;
create policy public_insert_when_live on public.song_requests
  for insert to anon
  with check (exists (
    select 1 from public.events e where e.id = song_requests.event_id and e.is_live = true
  ));

-- Optional: if you want authenticated users with app_metadata.role = 'admin' to query via JWT (not required for service role)
-- create policy admin_events_rw on public.events for all to authenticated
--   using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
--   with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
-- create policy admin_requests_rw on public.song_requests for all to authenticated
--   using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
--   with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


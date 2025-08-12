-- Enable uuid generation
create extension if not exists pgcrypto;

-- Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_live boolean not null default false,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

-- Song requests
create table if not exists song_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  song text not null,
  artist text,
  requester_name text,
  status text not null default 'pending' check(status in ('pending','approved','played','rejected')),
  created_at timestamptz not null default now()
);

-- RLS (secure by default)
alter table events enable row level security;
alter table song_requests enable row level security;

-- Allow public (anon) to read event live status
DROP POLICY IF EXISTS "Public can read event live status" ON public.events;
CREATE POLICY "Public can read event live status" ON public.events
FOR SELECT TO anon
USING (true);

-- Allow public (anon) to insert requests only when the event is live
DROP POLICY IF EXISTS "Public can insert requests during live" ON public.song_requests;
CREATE POLICY "Public can insert requests during live" ON public.song_requests
FOR INSERT TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND e.is_live = true
  )
);

-- Admin-only operations will be executed via server-side service_role key in application code.
-- No additional admin policies needed.

-- Deny public (anon) select on song_requests
DROP POLICY IF EXISTS "No public read of song_requests" ON public.song_requests;
CREATE POLICY "No public read of song_requests" ON public.song_requests
FOR SELECT TO anon
USING (false);

-- Grants required for PostgREST roles
GRANT SELECT ON TABLE public.events TO anon;
GRANT INSERT ON TABLE public.song_requests TO anon;

-- Authenticated users (admins) can manage events and requests
DROP POLICY IF EXISTS "Authenticated can update events" ON public.events;
CREATE POLICY "Authenticated can update events" ON public.events
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read song_requests" ON public.song_requests;
CREATE POLICY "Authenticated can read song_requests" ON public.song_requests
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can update song_requests" ON public.song_requests;
CREATE POLICY "Authenticated can update song_requests" ON public.song_requests
FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete song_requests" ON public.song_requests;
CREATE POLICY "Authenticated can delete song_requests" ON public.song_requests
FOR DELETE TO authenticated
USING (true);

-- Grants for authenticated role
GRANT UPDATE ON TABLE public.events TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.song_requests TO authenticated;


-- Realtime for song_requests
alter publication supabase_realtime add table song_requests;


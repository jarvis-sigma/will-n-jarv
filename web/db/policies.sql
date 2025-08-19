-- Admin-only policy example. Adjust table names as needed.
-- Assumes users have app_metadata.role = 'admin'.

-- Enable RLS on tables that should be admin-only
-- alter table your_table enable row level security;

-- Drop existing permissive policies if any (be careful in production)
-- drop policy if exists "admins only" on your_table;

-- Only allow admins to select/insert/update/delete
-- create policy "admins only"
-- on your_table
-- for all
-- to authenticated
-- using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
-- with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- If you want to allow reads for everyone but writes only for admins:
-- create policy "public read"
-- on your_table
-- for select
-- using (true);
--
-- create policy "admin write"
-- on your_table
-- for all
-- to authenticated
-- using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
-- with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- Migration: Split time_text into start_time and end_time
-- Run this in the Supabase SQL editor or via CLI.

-- 1) Add new columns if they don't exist
alter table public.events add column if not exists start_time text;
alter table public.events add column if not exists end_time text;

-- 2) Backfill from time_text when available (expects formats like "3:00 PM – 5:00 PM EST" or "3:00 PM EST")
-- We'll keep it simple: extract left and right of the dash and strip "EST"; if no dash, use single as start_time
update public.events
set start_time = nullif(trim(regexp_replace(split_part(coalesce(time_text,''),'–',1),'(?i)\s*EST$','')), ''),
    end_time   = nullif(trim(regexp_replace(split_part(coalesce(time_text,''),'–',2),'(?i)\s*EST$','')), '')
where (start_time is null or start_time = '') and (end_time is null or end_time = '');

-- 3) Drop legacy column now that new columns exist
alter table public.events drop column if exists time_text;

-- 4) Helpful index (optional)
create index if not exists events_event_date_idx on public.events (event_date);


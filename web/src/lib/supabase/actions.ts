"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { type RequestStatus } from "@/lib/types";

function getAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !service) return null;
  return createClient(url, service);
}

export async function listEvents() {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { data, error } = await client
    .from("events")
    .select("id,name,is_live,started_at,event_date,created_at,venue,address,start_time,end_time,description")
    .order("created_at", { ascending: false });
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true, data } as const;
}

// Public pages: list upcoming events using service role (server-only) to avoid extra RLS setup.
export async function listAllEventsUpcoming() {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { data, error } = await client
    .from("events")
    .select("id,name,event_date,is_live,created_at,venue,address,start_time,end_time,description")
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true, data } as const;
}

export async function getEventById(id: string) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { data, error } = await client
    .from("events")
    .select("id,name,event_date,is_live,created_at,venue,address,start_time,end_time,started_at,description")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true, data } as const;
}

export async function createEvent(input: { name: string; date?: string; start_time?: string; end_time?: string; venue?: string; address?: string; description?: string }) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const payload: Record<string, string | boolean> = { name: input.name, is_live: false };
  if (input.date) { payload.event_date = input.date; payload.started_at = input.date; }
  if (input.start_time) payload.start_time = input.start_time;
  if (input.end_time) payload.end_time = input.end_time;
  if (input.venue) payload.venue = input.venue;
  if (input.address) payload.address = input.address;
  if (input.description) payload.description = input.description;
  const { error } = await client.from("events").insert(payload);
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/admin/events");
  return { ok: true } as const;
}

export async function updateEvent(id: string, input: { name?: string; date?: string; start_time?: string; end_time?: string; venue?: string; address?: string; description?: string }) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const payload: Record<string, string> = {};
  if (input.name) payload.name = input.name;
  if (input.date) { payload.event_date = input.date; payload.started_at = input.date; }
  if (input.start_time !== undefined) payload.start_time = input.start_time;
  if (input.end_time !== undefined) payload.end_time = input.end_time;
  if (input.venue) payload.venue = input.venue;
  if (input.address) payload.address = input.address;
  if (input.description) payload.description = input.description;
  const { error } = await client.from("events").update(payload).eq("id", id);
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/admin/events");
  return { ok: true } as const;
}

export async function deleteEvent(id: string) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { error } = await client.from("events").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/admin/events");
  return { ok: true } as const;
}

export async function setLiveEvent(eventId: string | null) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  // First, clear any existing live flags
  const { error: clearErr } = await client.from("events").update({ is_live: false }).neq("is_live", false);
  if (clearErr) return { ok: false, reason: clearErr.message } as const;
  if (eventId) {
    const { error } = await client.from("events").update({ is_live: true }).eq("id", eventId);
    if (error) return { ok: false, reason: error.message } as const;
  }
  revalidatePath("/live");
  revalidatePath("/admin");
  return { ok: true } as const;
}

export async function getLiveEvent() {
  const client = getAnon();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { data, error } = await client
    .from("events")
    .select("id,name,is_live,started_at,event_date")
    .eq("is_live", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true, data } as const;
}

export async function createSongRequest(input: { song: string; artist?: string; name?: string }) {
  const client = getAnon();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const live = await getLiveEvent();
  if (!live.ok || !live.data?.is_live) return { ok: false, reason: "not-live" } as const;
  const event_id = live.data.id;
  const { error } = await client.from("song_requests").insert({
    event_id,
    song: input.song,
    artist: input.artist,
    requester_name: input.name,
  });
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/live");
  return { ok: true } as const;
}

export async function listSongRequests() {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const live = await getLiveEvent();
  if (!live.ok || !live.data) return { ok: false, reason: "no-event" } as const;
  const { data, error } = await client
    .from("song_requests")
    .select("id, event_id, song, artist, requester_name, status, created_at")
    .eq("event_id", live.data.id)
    .order("created_at", { ascending: false });
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true, data } as const;
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { error } = await client
    .from("song_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/admin");
  return { ok: true } as const;
}

export async function deleteRequest(id: string) {
  const client = getAdmin();
  if (!client) return { ok: false, reason: "missing-env" } as const;
  const { error } = await client.from("song_requests").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message } as const;
  revalidatePath("/admin");
  return { ok: true } as const;
}


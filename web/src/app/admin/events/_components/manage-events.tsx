"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { listEvents, updateEvent, deleteEvent } from "@/lib/supabase/actions";
function to12h(hhmm: string) {
  if (!hhmm) return "";
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}
function formatTimeRange(start: string, end: string) {
  const s = to12h(start);
  const e = to12h(end);
  if (s && e) return `${s} – ${e} EST`;
  if (s) return `${s} EST`;
  if (e) return `${e} EST`;
  return "";
}


export function ManageEvents() {
  type Ev = { id: string; name: string; event_date?: string | null; started_at?: string | null; is_live?: boolean; start_time?: string | null; end_time?: string | null; venue?: string | null; address?: string | null; description?: string | null };
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await listEvents();
      if ((res as { ok?: boolean } | null)?.ok === false) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const data = (res as { ok: true; data: Ev[] }).data;
      setEvents(data);
      setLoading(false);
    })();
  }, []);

  const sorted = useMemo(() => {
    if (!events) return [] as Ev[];
    const dateOf = (e: Ev) => e.event_date || e.started_at || "";
    return [...events].sort((a, b) => (dateOf(a) || "").localeCompare(dateOf(b) || ""));
  }, [events]);

  if (loading) return <p className="text-sm text-zinc-400">Loading events…</p>;
  if (!events?.length) return <p className="text-sm text-zinc-500">No events yet or backend not configured.</p>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
      <h2 className="text-xl font-semibold text-white mb-3">Upcoming events</h2>
      <div className="space-y-3">
        {sorted.map((ev) => (
          <EventRow key={ev.id} ev={ev} onChange={(next) => setEvents((prev) => prev?.map((e) => (e.id === next.id ? next : e)) ?? null)} onDelete={(id) => setEvents((prev) => prev?.filter((e) => e.id !== id) ?? null)} />
        ))}
      </div>
    </div>
  );
}

type EventShape = { id: string; name: string; event_date?: string | null; started_at?: string | null; is_live?: boolean; start_time?: string | null; end_time?: string | null; venue?: string | null; address?: string | null; description?: string | null };
function EventRow({ ev, onChange, onDelete }: { ev: EventShape; onChange: (e: EventShape) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState(ev.name);
  const [date, setDate] = useState<string>(ev.event_date || ev.started_at || "");
  const { start: initialStart, end: initialEnd } = { start: ev.start_time || "", end: ev.end_time || "" };
  const [start, setStart] = useState<string>(initialStart);
  const [end, setEnd] = useState<string>(initialEnd);
  const [venue, setVenue] = useState<string>(ev.venue || "");
  const [address, setAddress] = useState<string>(ev.address || "");
  const [description, setDescription] = useState<string>(ev.description || "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Input className="bg-black/30" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <Input className="bg-black/30" type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" />
        <div className="grid grid-cols-2 gap-3">
          <Input className="bg-black/30" type="time" step={60} value={start} onChange={(e) => setStart(e.target.value)} placeholder="Start" />
          <Input className="bg-black/30" type="time" step={60} value={end} onChange={(e) => setEnd(e.target.value)} placeholder="End" />
        </div>
        <p className="text-xs text-zinc-400 -mt-2">All times are EST</p>
        <Input className="bg-black/30" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" />
        <Input className="bg-black/30" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
      </div>
      <textarea className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="bg-white/5 border-white/10"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            const res = await updateEvent(ev.id, { name, date: date || undefined, start_time: start || undefined, end_time: end || undefined, venue: venue || undefined, address: address || undefined, description: description || undefined });
            const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
            const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
            if (ok === false) toast.error(reason ?? "Failed to update event");
            else {
              onChange({ ...ev, name, event_date: date, start_time: start || null, end_time: end || null, venue, address, description });
              toast.success("Event updated");
            }
            setSaving(false);
          }}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          className="bg-white/5 border-white/10"
          disabled={removing}
          onClick={async () => {
            setRemoving(true);
            const res = await deleteEvent(ev.id);
            const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
            const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
            if (ok === false) toast.error(reason ?? "Failed to delete event");
            else {
              onDelete(ev.id);
              toast.success("Event deleted");
            }
            setRemoving(false);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}


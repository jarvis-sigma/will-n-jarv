import Link from "next/link";
import { listAllEventsUpcoming } from "@/lib/supabase/actions";
import { formatLocalDate as fmtDate } from "@/lib/date";

export default async function EventsPage() {
  const res = await listAllEventsUpcoming();
  const items = (res as { ok: true; data: Array<{ id: string; name: string; event_date?: string | null }> } | { ok: false }).ok
    ? (res as { ok: true; data: Array<{ id: string; name: string; event_date?: string | null }> }).data
    : [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold text-white">Events</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.length === 0 && (
          <p className="text-sm text-zinc-400">No upcoming events.</p>
        )}
        {items.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
            <p className="text-sm text-zinc-400">{fmtDate(e.event_date) ?? "TBA"}</p>
            <h3 className="mt-2 text-xl text-white">{e.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}


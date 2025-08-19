import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { listAllEventsUpcoming } from "@/lib/supabase/actions";
import { formatLocalDate as fmtDate } from "@/lib/date";

export async function UpcomingEvents() {
  const res = await listAllEventsUpcoming();
  const items = (res as { ok: true; data: Array<{ id: string; name: string; event_date?: string | null }> } | { ok: false }).ok
    ? (res as { ok: true; data: Array<{ id: string; name: string; event_date?: string | null }> }).data
    : [];

  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Upcoming events</h2>
          <Link className="text-zinc-300 hover:text-white" href="/events">See all</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <Card className="bg-white/[.03] border-white/10"><CardContent className="p-6"><p className="text-sm text-zinc-400">No events yet.</p></CardContent></Card>
          )}
          {items.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`}>
              <Card className="bg-white/[.03] border-white/10 hover:bg-white/[.05] transition-colors">
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-400">{fmtDate(e.event_date) ?? "TBA"}</p>
                  <h3 className="mt-2 text-xl text-white">{e.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


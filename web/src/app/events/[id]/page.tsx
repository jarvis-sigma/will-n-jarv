import Link from "next/link";
import { getEventById } from "@/lib/supabase/actions";
import { formatLocalDate as fmtDate } from "@/lib/date";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const res = await getEventById(params.id);
  if (!(res as { ok?: boolean }).ok) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-zinc-400">Event not found.</p>
        <Link href="/events" className="underline text-white">Back to events</Link>
      </div>
    );
  }
  const e = (res as { ok: true; data: { id: string; name: string; event_date?: string | null; venue?: string | null; address?: string | null; start_time?: string | null; end_time?: string | null; description?: string | null } }).data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/events" className="text-sm text-zinc-400 hover:text-white">← Back to events</Link>
      <h1 className="mt-4 text-4xl font-semibold text-white">{e.name}</h1>
      {e.description && (
        <div className="mt-6 prose prose-invert max-w-none">
          <p className="text-zinc-300 whitespace-pre-line">{e.description}</p>
        </div>
      )}

      <p className="mt-2 text-zinc-300">{fmtDate(e.event_date) ?? "TBA"}{e.start_time || e.end_time ? ` • ${[e.start_time, e.end_time].filter(Boolean).join(" – ")} EST` : ""}</p>
      {e.venue && <p className="mt-1 text-zinc-400">{e.venue}</p>}
      {e.address && <p className="text-zinc-500">{e.address}</p>}
    </div>
  );
}


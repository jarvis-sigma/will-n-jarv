import { PublicRequest } from "./_components/public-request";
import { getLiveEvent } from "@/lib/supabase/actions";

export default async function LivePage() {
  const res = await getLiveEvent();
  const hasBackend = (res as { ok?: boolean } | null)?.ok !== false;
  const live = hasBackend && (res as { ok: true; data: { id?: string | null } | null }).data?.id ? true : false;
  const name = hasBackend ? (res as { ok: true; data: { name?: string | null } | null }).data?.name ?? null : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold text-white">Live Requests</h1>
      <p className="mt-2 text-zinc-400">
        {hasBackend ? (live ? `We’re live${name ? ` — ${name}` : ""}. Submit your song!` : "Not live right now.") : "Submit a song when we go live (demo mode)."}
      </p>
      <div className="mt-8 grid gap-6">
        <PublicRequest initialLive={live} hasBackend={hasBackend} eventName={name ?? undefined} />
      </div>
      <p className="mt-6 text-sm text-zinc-500">Note: Requests are only visible to the DJ.</p>
    </div>
  );
}


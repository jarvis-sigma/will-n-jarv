"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LiveActions, getState, onChange, type SongRequest, type RequestStatus } from "@/lib/live-demo";
import { setRequestStatus, deleteRequest, listEvents, setLiveEvent, listSongRequests } from "@/lib/supabase/actions";

export function AdminPanel() {
  const [active, setActive] = useState(getState().active);
  const [requests, setRequests] = useState(getState().requests);
  const [events, setEvents] = useState<{ id: string; name: string; is_live: boolean }[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);
  useEffect(() => {
    const unsub = onChange((s) => { setActive(s.active); setRequests(s.requests); });
    const loadEvents = async () => {
      const res = await listEvents();
      if ((res as { ok?: boolean } | null)?.ok === false) return null; // demo mode
      const data = (res as { ok: true; data: { id: string; name: string; is_live: boolean }[] }).data;
      setEvents(data);
      const cur = data.find((e) => e.is_live)?.id ?? null;
      setLiveId(cur);
      return cur;
    };
    (async () => {
      const current = await loadEvents();

      // Start polling live requests if backend is available and an event is live
      if (current) {
        const poll = async () => {
          const lr = await listSongRequests();
          const ok = (lr as { ok?: boolean } | null)?.ok;
          if (ok) {
            const list = (lr as { ok: true; data: Array<{ id: string; song: string; artist?: string | null; requester_name?: string | null; status: RequestStatus; created_at: string }> }).data;
            // Shape to local model
            const mapped: SongRequest[] = list.map((x) => ({
              id: x.id,
              song: x.song,
              artist: x.artist ?? undefined,
              name: x.requester_name ?? undefined,
              status: x.status,
              time: new Date(x.created_at).getTime(),
            }));
            setRequests(mapped);
          }
        };
        // Initial load
        await poll();
        // Poll every 5s
        const id = setInterval(poll, 5000);
      // Refresh event list when events are updated via the form
      if (typeof window !== "undefined") {
        const handler = () => { loadEvents(); };
        window.addEventListener("wj-events-updated", handler);
        // Clean up when unmounting
        // Note: polling cleanup is returned below when current is set
        // so we remove only this listener here
        return () => window.removeEventListener("wj-events-updated", handler);
      }

        return () => clearInterval(id);
      }
    })();
    return unsub;
  }, []);

  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [q, setQ] = useState("");
  const filteredRequests = useMemo(() => {
    const norm = (s: string) => s.toLowerCase();
    const needle = norm(q);
    const base = requests.filter((r) => (filter === "all" ? true : r.status === filter));
    return needle ? base.filter((r) => norm(r.song).includes(needle) || norm(r.artist || "").includes(needle)) : base;
  }, [requests, filter, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <div>
          <p className="text-zinc-300">Live status</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge className={active ? "bg-emerald-500 text-black" : "bg-zinc-700"}>
              {active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Live event selector (if backend available) */}
          {events.length > 0 && (
            <select
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
              value={liveId ?? ""}
              onChange={async (e) => {
                const next = e.target.value || null;
                setLiveId(next);
                const res = await setLiveEvent(next);
                const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                if (ok === false) toast.error(reason ?? "Failed to set live");
                if (ok) toast.success(next ? "Live event set" : "Live cleared");
              }}
            >
              <option value="">No live event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          )}

          {/* Demo toggle fallback when backend is not configured */}
          {events.length === 0 && (
            <Button
              variant="secondary"
              className="bg-white/5 border-white/10"
              onClick={() => {
                LiveActions.toggleActive();
              }}
            >
              {active ? "Deactivate (demo)" : "Activate (demo)"}
            </Button>
          )}

          <Button
            variant="secondary"
            className="bg-white/5 border-white/10"
            onClick={() => {
              LiveActions.clear();
              toast("Requests cleared");
            }}
          >
            Clear requests
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-medium text-white">Moderate</h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search song or artist"
              className="h-9 w-56 bg-black/30"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {(["all","pending","approved","played","rejected"] as const).map((f) => (
                <Button
                  key={f}
                  variant="secondary"
                  className={`bg-white/5 border-white/10 ${filter===f?"ring-1 ring-white/30":""}`}
                  onClick={() => setFilter(f as "all" | RequestStatus)}
                >
                  {String(f).charAt(0).toUpperCase() + String(f).slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-3">
          {filteredRequests.length === 0 && (
            <p className="text-sm text-zinc-400">No requests yet.</p>
          )}
          {filteredRequests.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
              <div>
                <p className="text-white">
                  {r.song}
                  {r.artist ? <span className="text-zinc-400"> — {r.artist}</span> : null}
                </p>
                {r.name ? <p className="text-xs text-zinc-400 mt-1">from {r.name}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="bg-white/5 border-white/10">Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={async () => {
                      const res = await setRequestStatus(r.id as string, "pending");
                      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                      if (ok === false && reason === "missing-env") {
                        LiveActions.setStatus(r.id, "pending");
                      }
                    }}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const res = await setRequestStatus(r.id as string, "approved");
                      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                      if (ok === false && reason === "missing-env") {
                        LiveActions.setStatus(r.id, "approved");
                      }
                    }}>Approved</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const res = await setRequestStatus(r.id as string, "played");
                      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                      if (ok === false && reason === "missing-env") {
                        LiveActions.setStatus(r.id, "played");
                      }
                    }}>Played</DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const res = await setRequestStatus(r.id as string, "rejected");
                      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                      if (ok === false && reason === "missing-env") {
                        LiveActions.setStatus(r.id, "rejected");
                      }
                    }}>Rejected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="secondary" className="bg-white/5 border-white/10" onClick={async () => {
                  const res = await deleteRequest(r.id as string);
                  const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
                  const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
                  if (ok === false && reason === "missing-env") {
                    LiveActions.remove(r.id);
                  }
                }}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


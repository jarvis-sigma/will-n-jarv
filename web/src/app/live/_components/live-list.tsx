"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getState, onChange, type SongRequest } from "@/lib/live-demo";

const statusLabel: Record<SongRequest["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  played: "Played",
  rejected: "Rejected",
};

export function LiveList() {
  const [requests, setRequests] = useState(getState().requests);
  useEffect(() => onChange((s) => setRequests(s.requests)), []);

  const grouped = useMemo(() => {
    const sections: { title: string; items: SongRequest[] }[] = [];
    const order: SongRequest["status"][] = ["pending", "approved", "played", "rejected"];
    for (const st of order) {
      const items = requests.filter((r) => r.status === st);
      if (items.length) sections.push({ title: statusLabel[st], items });
    }
    return sections;
  }, [requests]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
      <h2 className="text-xl font-medium text-white">Live requests</h2>
      <div className="mt-4 space-y-6">
        {grouped.length === 0 && (
          <p className="text-sm text-zinc-400">No requests yet. Be the first!</p>
        )}
        {grouped.map((g, i) => (
          <div key={i}>
            <div className="flex items-center justify-between">
              <p className="text-zinc-300 font-medium">{g.title}</p>
              <Badge variant="secondary" className="bg-white/10 border-white/10">
                {g.items.length}
              </Badge>
            </div>
            <div className="mt-3 space-y-3">
              {g.items.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-white/10 bg-black/20 p-3"
                >
                  <p className="text-white">
                    {r.song}
                    {r.artist ? <span className="text-zinc-400"> — {r.artist}</span> : null}
                  </p>
                  {r.name ? (
                    <p className="text-xs text-zinc-400 mt-1">from {r.name}</p>
                  ) : null}
                </div>
              ))}
            </div>
            {i < grouped.length - 1 && <Separator className="my-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}


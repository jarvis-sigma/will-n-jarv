"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LiveActions, getState, onChange } from "@/lib/live-demo";
import { createSongRequest } from "@/lib/supabase/actions";

export function PublicRequest(props: { initialLive?: boolean; hasBackend?: boolean; eventName?: string }) {
  const [active, setActive] = useState(props.initialLive ?? getState().active);
  useEffect(() => {
    if (props.hasBackend) return; // when backend is available, rely on SSR-provided live flag
    return onChange((s) => setActive(s.active));
  }, [props.hasBackend]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const song = String(fd.get("song") || "").trim();
    const artist = String(fd.get("artist") || "").trim();
    const name = String(fd.get("name") || "").trim();
    if (!song) return toast.error("Please enter a song title.");

    // If Supabase is configured, use it; otherwise fall back to demo store
    try {
      const res = await createSongRequest({ song, artist, name });
      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
      if (ok === false && reason === "missing-env") {
        // fallback in local dev with no env
        if (!active) return toast.info("No live event right now.");
        LiveActions.addRequest({ song, artist, name });
      } else if (ok === false) {
        return toast.error(reason ?? "Something went wrong");
      }
      toast.success("Request sent!");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
      <h2 className="text-xl font-medium text-white">Request a song</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {active ? `We’re live${props.eventName ? ` — ${props.eventName}` : ""}. Drop your request!` : "Not live right now."}
      </p>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <Input name="song" placeholder="Song title" />
        <Input name="artist" placeholder="Artist (optional)" />
        <Textarea name="name" rows={2} placeholder="Your name (optional)" />
        <Button className="bg-white text-black hover:bg-neutral-200">Send</Button>
      </form>
    </div>
  );
}


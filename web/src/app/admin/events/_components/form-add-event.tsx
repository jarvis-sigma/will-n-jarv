"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createEvent } from "@/lib/supabase/actions";


export function AddEventForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement; // capture before any awaits
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const date = String(fd.get("date") || "").trim();
    const start = String(fd.get("start_time") || "").trim();
    const end = String(fd.get("end_time") || "").trim();
    const venue = String(fd.get("venue") || "").trim();
    const address = String(fd.get("address") || "").trim();
    const description = String(fd.get("description") || "").trim();
    if (!name) return toast.error("Please enter an event name");
    setLoading(true);
    try {
      const res = await createEvent({ name, date: date || undefined, start_time: start || undefined, end_time: end || undefined, venue: venue || undefined, address: address || undefined, description: description || undefined });
      const ok = (res as { ok?: boolean; reason?: string } | null)?.ok;
      const reason = (res as { ok?: boolean; reason?: string } | null)?.reason;
      if (ok === false) toast.error(reason ?? "Failed to create event (check env/schema)");
      else {
        toast.success("Event created");
        form.reset();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("wj-events-updated"));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <Input name="name" placeholder="Event name (e.g., SigChi Party)" />
      <Input name="date" type="date" placeholder="Event date" />
      <div className="grid grid-cols-2 gap-3">
        <Input name="start_time" type="time" step={60} placeholder="Start time" />
        <Input name="end_time" type="time" step={60} placeholder="End time" />
      </div>
      <p className="text-xs text-zinc-400 -mt-2">All times are EST</p>

      <Input name="venue" placeholder="Venue" />
      <Input name="address" placeholder="Address" />
      <textarea name="description" rows={3} placeholder="Description" className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white" />
      <Button className="bg-white text-black hover:bg-neutral-200" disabled={loading}>
        {loading ? "Adding…" : "Add event"}
      </Button>
    </form>
  );
}


"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const details = String(formData.get("details") || "").trim();

    if (!name || !email || !details) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      // Placeholder: simulate a network call
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Thanks! We'll be in touch soon.");
      form.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold text-white">Book us</h1>
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="name">Name</label>
          <Input id="name" name="name" placeholder="Your name" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300" htmlFor="details">Event details</label>
          <Textarea id="details" name="details" placeholder="Venue, date, budget, vibe..." rows={5} />
        </div>
        <Button disabled={loading} className="w-full bg-white text-black hover:bg-neutral-200">
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}


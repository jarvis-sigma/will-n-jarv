"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const qp = useSearchParams();
  const error = qp.get("error");
  const error_description = qp.get("error_description");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Enter an email");
    try {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createBrowserClient(url, anon);
      const next = qp.get("next");
      const emailRedirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo, data: {} } });
      if (error) throw error;
      toast.success("Check your email for a magic link");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to send link";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Sign in</h1>
      <p className="mt-2 text-zinc-400">Use your email; we’ll send a magic link.</p>
      {error && (
        <p className="mt-3 text-sm text-red-400">
          {decodeURIComponent(error_description ?? error)}
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button disabled={loading} className="bg-white text-black hover:bg-neutral-200">{loading ? "Sending..." : "Send link"}</Button>
      </form>
    </div>
  );
}


"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminLink() {
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    const allow = raw.split(",").map((s) => s.trim()).filter(Boolean);

    // Check email from local storage token if present (best-effort client hint).
    // Server still enforces access; this only hides the link for non-admins.
    try {
      const token = localStorage.getItem("sb-" + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host.split(".")[0] + "-auth-token");
      if (token) {
        const { user } = JSON.parse(token);
        if (user?.email && allow.includes(user.email)) setAllowed(true);
      }
    } catch {}
  }, []);

  if (!allowed) return null;
  return (
    <Link href="/admin" className="bg-white text-black hover:bg-neutral-200 text-sm font-medium rounded-md px-4 py-2">
      Admin
    </Link>
  );
}


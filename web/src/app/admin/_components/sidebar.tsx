"use client";
import Link from "next/link";

export function AdminSidebar({ email }: { email: string }) {
  const items = [
    { href: "/admin/live", label: "Live event" },
    { href: "/admin/events", label: "Manage events" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
      <p className="text-xs text-zinc-400 mb-3">Signed in as</p>
      <p className="text-sm text-white mb-5 break-all">{email}</p>
      <nav className="flex flex-col gap-2">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="text-sm text-zinc-300 hover:text-white">
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 pt-4 border-t border-white/10">
        <Link href="/auth/sign-out" className="bg-white text-black hover:bg-neutral-200 text-sm font-medium rounded-md px-4 py-2 inline-block">
          Sign out
        </Link>
      </div>
    </div>
  );
}


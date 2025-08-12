"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Music, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { AdminLink } from "./link-admin";

const nav = [
  { href: "/", label: "Home" },
  { href: "/bio", label: "Bio" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
  { href: "/live", label: "Live" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Music className="h-5 w-5" />
          <span className="font-semibold tracking-tight">will n jarv</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "text-zinc-300 hover:text-white transition-colors",
                  active && "text-white"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <AdminLink />
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="bg-white/5 hover:bg-white/10 border border-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/80 backdrop-blur border-white/10">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6 flex flex-col gap-5">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="text-white text-lg">
                    {n.label}
                  </Link>
                ))}
                <AdminLink />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


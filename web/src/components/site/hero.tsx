"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-neon-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <div className="mx-auto max-w-7xl px-6 py-28">
        <motion.h1
          className="text-balance text-5xl md:text-7xl font-semibold tracking-tight-hero leading-tight-hero text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          will n jarv
          <span className="ml-3 bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            live, loud, together
          </span>
        </motion.h1>
        <p className="mt-6 max-w-3xl md:max-w-4xl text-zinc-300">
          Affordable, premium DJ sets for nights that matter. Book us for your event and let guests request songs live.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200">
            <Link href="/contact">Book us</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-white/5 border border-white/10 hover:bg-white/10">
            <Link href="/events">Upcoming events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


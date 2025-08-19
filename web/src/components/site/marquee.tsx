"use client";
import { motion, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import * as React from "react";
import { GALLERY_IMAGES } from "./gallery-images";

function Card({ src, i }: { src: string; i: number }) {
  return (
    <div className="relative h-40 w-64 shrink-0 rounded-xl border border-white/10 overflow-hidden">
      <Image
        src={src}
        alt={`Gallery ${i + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 256px, 256px"
        priority={i < 4}
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}

export function GalleryMarquee() {
  const [x, setX] = React.useState(0);
  const images = GALLERY_IMAGES.length ? GALLERY_IMAGES : Array.from({ length: 12 }).map((_, i) => `/gallery/sample-${(i%6)+1}.jpg`);

  // Measure the width of one full set of cards to create a seamless loop
  const groupRef = React.useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = React.useState(268 * images.length);
  React.useEffect(() => {
    const measure = () => {
      if (groupRef.current) setWrapW(groupRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [images.length]);

  useAnimationFrame((_, delta) => {
    setX((prev) => {
      const next = prev - (delta * 0.03);
      return next <= -wrapW ? next + wrapW : next;
    });
  });

  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mask-fade-x overflow-hidden rounded-2xl border border-white/10 bg-white/[.02]">
          <div className="relative p-4">
            <motion.div style={{ x }} className="flex gap-3">
              <div ref={groupRef} className="flex gap-3">
                {images.map((src, idx) => (
                  <Card key={idx} i={idx} src={src} />
                ))}
              </div>
              <div aria-hidden className="flex gap-3">
                {images.map((src, idx) => (
                  <Card key={`dupe-${idx}`} i={idx} src={src} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

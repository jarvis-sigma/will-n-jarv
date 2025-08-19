import { Hero } from "@/components/site/hero";
import { GalleryMarquee } from "@/components/site/marquee";
import { UpcomingEvents } from "@/components/site/upcoming";

export default function Home() {
  return (
    <div className="relative bg-gradient-to-b from-black to-zinc-950">
      <Hero />
      <GalleryMarquee />
      <UpcomingEvents />
    </div>
  );
}

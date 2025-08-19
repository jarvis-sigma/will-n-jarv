import Image from "next/image";

export default function BioPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-4xl md:max-w-5xl">
        <h1 className="text-4xl font-semibold text-white">Bio</h1>

        {/* Text above the image (wraps later via wider max width) */}
        <p className="mt-6 text-zinc-300 leading-relaxed">
          will n jarv was formed in 2024 by William Miller and Jarvis Xie. We are seniors at Yale University with a passion for music and sharing our work with others.
        </p>

        {/* Centered image, aligned to the same text width */}
        <div className="relative my-10 aspect-[4/3] w-full max-w-2xl md:max-w-3xl mx-auto">
          <Image src="/bio/IMG_1768.JPG" alt="will n jarv" fill className="rounded-2xl border border-white/10 object-cover" sizes="(max-width: 768px) 100vw, 640px" />
        </div>

        {/* Text below the image (same width for symmetry) */}
        <p className="text-zinc-300 leading-relaxed">
          will n jarv craft energetic sets that blend pop, rap, and electronic classics with bass house, trap house, and progressive house. Having played rooms big and small, our number one priority is to keep the dancefloor moving. We&apos;ve DJed events like:
        </p>

        <ul className="mt-4 list-disc pl-6 text-zinc-300 space-y-1">
          <li>Yale Junior Class Formal</li>
          <li>Ezra Stiles College Formal</li>
          <li>Chi Psi Spring Fling Party</li>
          <li>Sigma Chi GLOW</li>
        </ul>

      </div>
    </div>
  );
}


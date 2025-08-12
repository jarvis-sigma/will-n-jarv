import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} will n jarv</p>
        <div className="flex items-center gap-6">
          <Link className="hover:text-white" href="https://instagram.com" target="_blank">Instagram</Link>
          <Link className="hover:text-white" href="https://soundcloud.com" target="_blank">SoundCloud</Link>
          <Link className="hover:text-white" href="mailto:bookings@jarvis.party">Email</Link>
        </div>
      </div>
    </footer>
  );
}


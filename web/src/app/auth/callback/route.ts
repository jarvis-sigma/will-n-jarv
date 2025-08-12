import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const next = req.nextUrl.searchParams.get("next") || "/admin";

  // Prepare redirect target first so we can attach cookies to it.
  const res = NextResponse.redirect(new URL(next, req.url));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        const list = req.cookies.getAll();
        return !list?.length ? null : list.map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const c of cookiesToSet) {
          res.cookies.set({ name: c.name, value: c.value, ...c.options });
        }
      },
    },
  });

  // Prefer PKCE: if we have ?code, exchange for a session server-side
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const dest = new URL(`/sign-in?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.code || "exchange_failed")}&error_description=${encodeURIComponent(error.message)}`, req.url);
      return NextResponse.redirect(dest);
    }

    // Enforce allowlist right after sign-in.
    const { data: { user } } = await supabase.auth.getUser();
    const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!user?.email || !allowed.includes(user.email)) {
      await supabase.auth.signOut();
      const dest = new URL(`/sign-in?error=not_allowed&error_description=${encodeURIComponent("This site is invite-only")}`, req.url);
      return NextResponse.redirect(dest);
    }

    return res;
  }

  // Fallback: If provider sent fragment tokens (#access_token...), we cannot read them on the server.
  // Redirect to the client page that will parse the hash and call our API to set the session.
  const client = new URL(`/auth/callback/client${req.nextUrl.search}`, req.url);
  return NextResponse.redirect(client);
}


import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const { access_token, refresh_token, next } = await req.json();
  const res = NextResponse.json({ ok: true });

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

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, reason: "missing_tokens" }, { status: 400 });
  }

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
  }

  // Return a redirect to the desired next page with cookies applied
  const redirect = NextResponse.redirect(new URL(next || "/admin", req.url));
  // copy cookies from res to redirect
  for (const c of res.cookies.getAll()) {
    redirect.cookies.set(c);
  }
  return redirect;
}


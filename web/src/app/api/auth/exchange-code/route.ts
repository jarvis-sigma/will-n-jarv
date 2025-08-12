import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const { code, next } = await req.json();
  if (!code) return NextResponse.json({ ok: false, reason: "missing_code" }, { status: 400 });

  const res = NextResponse.redirect(new URL(next || "/admin", req.url));

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });

  return res;
}


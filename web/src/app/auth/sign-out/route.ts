import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = NextResponse.redirect(new URL("/", req.url));

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

  await supabase.auth.signOut();
  return res;
}


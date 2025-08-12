import { createServerClient, type CookieOptions, type CookieOptionsWithName } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies(); // async in Next 15
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) return null;

  return createServerClient(url, anon, {
    cookies: {
      // Use the recommended async getAll/setAll API
      async getAll() {
        const list = cookieStore.getAll();
        if (!list || list.length === 0) return null;
        return list.map((c) => ({ name: c.name, value: c.value }));
      },
      async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // In RSC render, Next forbids mutating cookies except in Server Actions/Route Handlers.
        // Supabase may attempt to update cookies during refresh; swallow the error in that case.
        try {
          for (const c of cookiesToSet) {
            cookieStore.set({ name: c.name, value: c.value, ...(c.options as CookieOptionsWithName) });
          }
        } catch {
          // Ignore when not in a mutating context; cookies will be set on subsequent actions.
        }
      },
    },
  });
}


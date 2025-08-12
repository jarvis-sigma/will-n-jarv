import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/ssr";
import { AdminSidebar } from "./_components/sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in?next=/admin");

  // Use getUser() (authenticated via Auth server) instead of reading from getSession().
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin");

  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const email = user.email ?? "";
  if (!allowed.includes(email)) {
    redirect("/sign-in?error=not_allowed&error_description=" + encodeURIComponent("This site is invite-only"));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside>
        <AdminSidebar email={email} />
      </aside>
      <section>{children}</section>
    </div>
  );
}


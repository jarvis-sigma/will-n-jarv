"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const hash = window.location.hash;
    const next = sp.get("next") || "/admin";
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token, next }),
        })
          .then((res) => {
            if (res.redirected) window.location.href = res.url;
            else router.replace(next);
          })
          .catch(() => router.replace(`/sign-in?next=${encodeURIComponent(next)}&error=set_session_failed`));
        return;
      }
    }
    router.replace(`/sign-in?next=${encodeURIComponent(next)}&error=missing_tokens`);
  }, [router, sp]);
  return null;
}


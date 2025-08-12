import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // If user hits /auth/callback with hash tokens (implicit grant), rewrite to the
  // client page that can parse the fragment and set cookies via API route.
  if (req.nextUrl.pathname === "/auth/callback" && req.url.includes("#access_token")) {
    return NextResponse.rewrite(new URL(`/auth/callback${req.nextUrl.search}`, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


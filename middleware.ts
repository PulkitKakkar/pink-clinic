import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const expected = process.env.ADMIN_SESSION_TOKEN || "pink-local-admin-test-session";
  const authenticated = request.cookies.get(ADMIN_COOKIE)?.value === expected;
  if (authenticated) return NextResponse.next();
  if (isAdminApi) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

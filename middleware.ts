import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const expected = process.env.ADMIN_SESSION_TOKEN || (process.env.NODE_ENV === "production" ? "" : "pink-local-admin-test-session");
  const authenticated = Boolean(expected && request.cookies.get(ADMIN_COOKIE)?.value === expected);
  if (authenticated) return NextResponse.next();
  if (isAdminApi) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
    || (forwardedHost && (forwardedProtocol === "http" || forwardedProtocol === "https") ? `${forwardedProtocol}://${forwardedHost}` : request.nextUrl.origin);
  const loginUrl = new URL("/admin/login", publicOrigin);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { STUDIO_ADMIN_COOKIE } from "@/lib/studio/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  const isStudioPage = pathname === "/studio" || pathname.startsWith("/studio/");
  if (!isAdminPage && !isAdminApi && !isStudioPage) return NextResponse.next();

  const expected = isStudioPage
    ? process.env.STUDIO_ADMIN_SESSION_TOKEN || (process.env.NODE_ENV === "production" ? "" : "pink-local-studio-admin-session")
    : process.env.ADMIN_SESSION_TOKEN || (process.env.NODE_ENV === "production" ? "" : "pink-local-admin-test-session");
  const cookieName = isStudioPage ? STUDIO_ADMIN_COOKIE : ADMIN_COOKIE;
  const authenticated = Boolean(expected && request.cookies.get(cookieName)?.value === expected);
  if (authenticated) return NextResponse.next();
  if (isAdminApi) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
    || (forwardedHost && (forwardedProtocol === "http" || forwardedProtocol === "https") ? `${forwardedProtocol}://${forwardedHost}` : request.nextUrl.origin);
  const loginUrl = new URL(isStudioPage ? "/studio-login" : "/admin/login", publicOrigin);
  if (!isStudioPage) loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*", "/studio/:path*"] };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { STUDIO_ADMIN_COOKIE } from "@/lib/studio/auth";
import { ACADEMY_ADMIN_COOKIE } from "@/lib/academy/auth";
import { getPublicOrigin } from "@/lib/public-origin";
import { loadRuntimeSecrets } from "@/lib/runtime-secrets";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const redirectOrigin = process.env.LEGACY_REDIRECT_ORIGIN;
  if (
    redirectOrigin && new URL(getPublicOrigin(request)).hostname === process.env.LEGACY_REDIRECT_HOST &&
    ["GET", "HEAD"].includes(request.method) && !pathname.startsWith("/api/")
  ) {
    const destination = new URL(redirectOrigin);
    if (destination.protocol !== "https:" || destination.username || destination.password || destination.pathname !== "/") {
      throw new Error("Invalid legacy redirect origin.");
    }
    destination.pathname = pathname;
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 302);
  }
  await loadRuntimeSecrets();
  if (pathname === "/admin/learners")
    return NextResponse.redirect(
      new URL("/academy-admin", getPublicOrigin(request)),
    );
  if (pathname === "/api/admin/learners")
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  const isStudioPage = pathname === "/studio" || pathname.startsWith("/studio/");
  const isAcademyPage =
    pathname.startsWith("/academy-admin") &&
    pathname !== "/academy-admin/login";
  const isAcademyApi =
    pathname.startsWith("/api/academy-admin") &&
    pathname !== "/api/academy-admin/login";
  if (!isAdminPage && !isAdminApi && !isStudioPage && !isAcademyPage && !isAcademyApi)
    return NextResponse.next();

  const expected = isStudioPage
    ? process.env.NODE_ENV === "production"
      ? process.env.STUDIO_ADMIN_SESSION_TOKEN || ""
      : "pink-local-studio-admin-session"
    : isAcademyPage || isAcademyApi
      ? process.env.NODE_ENV === "production"
        ? process.env.ACADEMY_ADMIN_SESSION_TOKEN || ""
        : "pink-local-academy-admin-session"
      : process.env.NODE_ENV === "production"
      ? process.env.ADMIN_SESSION_TOKEN || ""
      : "pink-local-admin-test-session";
  const cookieName = isStudioPage
    ? STUDIO_ADMIN_COOKIE
    : isAcademyPage || isAcademyApi
      ? ACADEMY_ADMIN_COOKIE
      : ADMIN_COOKIE;
  const authenticated = Boolean(expected && request.cookies.get(cookieName)?.value === expected);
  if (authenticated) return NextResponse.next();
  if (isAdminApi || isAcademyApi)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const loginUrl = new URL(
    isStudioPage
      ? "/studio-login"
      : isAcademyPage
        ? "/academy-admin/login"
        : "/admin/login",
    getPublicOrigin(request),
  );
  if (!isStudioPage) loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|css|js|woff|woff2)$).*)",
  ],
};

import { NextResponse } from "next/server";
import { ACADEMY_ADMIN_COOKIE, academyAdmin } from "@/lib/academy/auth";
import { getPublicOrigin } from "@/lib/public-origin";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/academy-admin");
  const origin = getPublicOrigin(request);
  const safeNext =
    next === "/academy-admin" || next.startsWith("/academy-admin/")
      ? next
      : "/academy-admin";
  const allowed = await consumeRateLimit({
    scope: "academy-admin-login",
    identifier: requestIdentifier(request),
    limit: 5,
    windowSeconds: 15 * 60,
  });
  if (!allowed)
    return NextResponse.redirect(
      new URL(`/academy-admin/login?error=rate-limit&next=${encodeURIComponent(safeNext)}`, origin),
      303,
    );
  if (email !== academyAdmin.email || password !== academyAdmin.password)
    return NextResponse.redirect(
      new URL(`/academy-admin/login?error=1&next=${encodeURIComponent(safeNext)}`, origin),
      303,
    );
  const response = NextResponse.redirect(new URL(safeNext, origin), 303);
  response.cookies.set(ACADEMY_ADMIN_COOKIE, academyAdmin.sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

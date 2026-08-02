import { NextResponse } from "next/server";
import { ADMIN_COOKIE, testAdmin } from "@/lib/admin/auth";
import { getPublicOrigin } from "@/lib/public-origin";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");
  const origin = getPublicOrigin(request);
  const safeNext = next === "/admin" || next.startsWith("/admin/") ? next : "/admin";

  const allowed = await consumeRateLimit({
    scope: "admin-login",
    identifier: requestIdentifier(request),
    limit: 5,
    windowSeconds: 15 * 60,
  });
  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=rate-limit&next=${encodeURIComponent(safeNext)}`, origin),
      303,
    );
  }

  if (email !== testAdmin.email || password !== testAdmin.password) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&next=${encodeURIComponent(safeNext)}`, origin), 303);
  }

  const response = NextResponse.redirect(new URL(safeNext, origin), 303);
  response.cookies.set(ADMIN_COOKIE, testAdmin.sessionToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

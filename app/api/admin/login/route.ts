import { NextResponse } from "next/server";
import { ADMIN_COOKIE, testAdmin } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");
  const origin = new URL(request.url).origin;

  if (email !== testAdmin.email || password !== testAdmin.password) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&next=${encodeURIComponent(next)}`, origin), 303);
  }

  const response = NextResponse.redirect(new URL(next.startsWith("/admin") ? next : "/admin", origin), 303);
  response.cookies.set(ADMIN_COOKIE, testAdmin.sessionToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

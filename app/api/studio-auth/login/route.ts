import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/public-origin";
import { STUDIO_ADMIN_COOKIE, studioAdmin } from "@/lib/studio/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const origin = getPublicOrigin(request);

  if (!studioAdmin.email || !studioAdmin.password || !studioAdmin.sessionToken || email !== studioAdmin.email || password !== studioAdmin.password) {
    return NextResponse.redirect(new URL("/studio-login?error=1", origin), 303);
  }

  const response = NextResponse.redirect(new URL("/studio", origin), 303);
  // Sanity authentication returns to /studio from an external origin. Lax
  // allows that top-level GET redirect to carry this cookie; Strict causes a
  // loop between our Studio gate and Sanity's login provider screen.
  response.cookies.set(STUDIO_ADMIN_COOKIE, studioAdmin.sessionToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 4 });
  return response;
}

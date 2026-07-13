import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/public-origin";
import { STUDIO_ADMIN_COOKIE } from "@/lib/studio/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/studio-login", getPublicOrigin(request)), 303);
  response.cookies.set(STUDIO_ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

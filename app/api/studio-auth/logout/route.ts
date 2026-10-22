import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/public-origin";
import { STUDIO_ADMIN_COOKIE } from "@/lib/studio/auth";

async function handlePOST(request: Request) {
  const response = NextResponse.redirect(new URL("/studio-login", getPublicOrigin(request)), 303);
  response.cookies.set(STUDIO_ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

export const POST = observeApi("/api/studio-auth/logout", handlePOST);

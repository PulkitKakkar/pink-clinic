import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { getPublicOrigin } from "@/lib/public-origin";

async function handlePOST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", getPublicOrigin(request)), 303);
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export const POST = observeApi("/api/admin/logout", handlePOST);

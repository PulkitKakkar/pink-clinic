import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";
import { ACADEMY_ADMIN_COOKIE } from "@/lib/academy/auth";
import { getPublicOrigin } from "@/lib/public-origin";

async function handlePOST(request: Request) {
  const response = NextResponse.redirect(
    new URL("/academy-admin/login", getPublicOrigin(request)),
    303,
  );
  response.cookies.set(ACADEMY_ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export const POST = observeApi("/api/academy-admin/logout", handlePOST);

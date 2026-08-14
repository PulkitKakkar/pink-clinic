import { NextResponse } from "next/server";
import { ACADEMY_ADMIN_COOKIE } from "@/lib/academy/auth";
import { getPublicOrigin } from "@/lib/public-origin";

export async function POST(request: Request) {
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

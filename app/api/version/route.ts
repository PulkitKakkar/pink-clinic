import { NextResponse } from "next/server";
import { getBuildInfo } from "@/lib/app-version";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getBuildInfo());
}

import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";
import { getBuildInfo } from "@/lib/app-version";

export const dynamic = "force-dynamic";

function handleGET() {
  return NextResponse.json(getBuildInfo());
}

export const GET = observeApi("/api/version", handleGET);

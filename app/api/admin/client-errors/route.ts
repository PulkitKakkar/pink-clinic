import type { ClientErrorCode } from "@/lib/admin/client-errors";
import { NextResponse } from "next/server";
import { logApplicationEvent } from "@/lib/observability";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

const codes = new Set(["network", "server_response", "invalid_response", "render", "unhandled_rejection", "image_upload"] as const);
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 1024) return new NextResponse(null, { status: 413 });
    const text = await request.text();
    if (text.length > 1024) return new NextResponse(null, { status: 413 });
    const body = JSON.parse(text) as { code?: unknown };
    if (typeof body.code !== "string" || !codes.has(body.code as never)) return new NextResponse(null, { status: 400 });
    if (!await consumeRateLimit({ scope: "admin-client-errors", identifier: requestIdentifier(request), limit: 30, windowSeconds: 60 }))
      return new NextResponse(null, { status: 429 });
    logApplicationEvent("client_error", "ERROR", { clientCode: body.code as ClientErrorCode });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SyntaxError) return new NextResponse(null, { status: 400 });
    logApplicationEvent("server_error", "ERROR", { operation: "request", error });
    return new NextResponse(null, { status: 503 });
  }
}

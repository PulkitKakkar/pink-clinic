import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";

const allowedHosts = [".cdninstagram.com", ".fbcdn.net"];

async function handleGET(request: Request) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source) return NextResponse.json({ error: "Missing image URL" }, { status: 400 });

  const imageUrl = new URL(source);
  if (imageUrl.protocol !== "https:" || !allowedHosts.some((host) => imageUrl.hostname.endsWith(host))) {
    return NextResponse.json({ error: "Image host not allowed" }, { status: 400 });
  }

  const response = await fetch(imageUrl, { next: { revalidate: 3600 } });
  if (!response.ok || !response.body) return NextResponse.json({ error: "Image unavailable" }, { status: 404 });

  return new NextResponse(response.body, {
    headers: {
      "content-type": response.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export const GET = observeApi("/api/instagram/image", handleGET);

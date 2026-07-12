import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { requireImageBucket, treatmentImageS3 } from "@/lib/admin/image-storage";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key?.startsWith("treatment-images/")) return NextResponse.json({ error: "Invalid image key." }, { status: 400 });
    const object = await treatmentImageS3.send(new GetObjectCommand({ Bucket: requireImageBucket(), Key: key }));
    if (!object.Body) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    return new Response(object.Body.transformToWebStream(), { headers: { "content-type": object.ContentType || "image/jpeg", "cache-control": "private, max-age=300", "x-content-type-options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}

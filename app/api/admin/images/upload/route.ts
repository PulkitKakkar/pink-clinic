import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { requireImageBucket, treatmentImageS3 } from "@/lib/admin/image-storage";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { contentType?: string };
    if (!body.contentType || !allowed.has(body.contentType)) return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    const key = `treatment-images/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
    const command = new PutObjectCommand({ Bucket: requireImageBucket(), Key: key, ContentType: body.contentType, ServerSideEncryption: "AES256" });
    const uploadUrl = await getSignedUrl(treatmentImageS3, command, { expiresIn: 300 });
    return NextResponse.json({ key, uploadUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not prepare image upload." }, { status: 500 });
  }
}

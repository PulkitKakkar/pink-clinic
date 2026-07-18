import { NextResponse } from "next/server";
import { locations } from "@/lib/content";

export async function POST(request: Request) {
  const data = Object.fromEntries((await request.formData()).entries());
  const returnUrl = new URL("/contact", request.url);
  const branch = locations.find((location) => location.id === data.branchId);
  const email = String(data.email || "");
  const valid = branch && data.firstName && data.lastName && data.phone && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    returnUrl.searchParams.set("status", "error");
    return NextResponse.redirect(returnUrl, 303);
  }

  const enquiry = { ...data, branchName: branch.name, branchAddress: branch.address };
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    returnUrl.searchParams.set("status", "error");
    return NextResponse.redirect(returnUrl, 303);
  }
  const response = await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(enquiry) });
  returnUrl.searchParams.set("status", response.ok ? "success" : "error");
  return NextResponse.redirect(returnUrl, 303);
}

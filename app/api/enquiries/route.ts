import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = Object.fromEntries((await request.formData()).entries());
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ message: "Enquiry webhook is not configured." }, { status: 503 });
  const response = await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  return NextResponse.json({ received: response.ok }, { status: response.ok ? 200 : 502 });
}

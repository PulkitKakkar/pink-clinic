import { NextResponse } from "next/server";
import { locations } from "@/lib/content";

export async function POST(request: Request) {
  const data = Object.fromEntries((await request.formData()).entries());
  const branch = locations.find((location) => location.id === data.branchId);
  if (!branch) return NextResponse.json({ message: "Please confirm which branch you would like to contact." }, { status: 400 });

  const enquiry = { ...data, branchName: branch.name, branchAddress: branch.address };
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ message: "Enquiry webhook is not configured." }, { status: 503 });
  const response = await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(enquiry) });
  return NextResponse.json({ received: response.ok }, { status: response.ok ? 200 : 502 });
}

import { NextResponse } from "next/server";
import { locations } from "@/lib/content";

function enquiryText(enquiry: Record<string, FormDataEntryValue | string>) {
  return [
    `New website enquiry for ${enquiry.branchName}`,
    "",
    `Name: ${enquiry.firstName} ${enquiry.lastName}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Interest: ${enquiry.interest || "Not specified"}`,
    `Context: ${enquiry.context || "None"}`,
    "",
    "Message:",
    String(enquiry.message || "No message provided"),
  ].join("\n");
}

async function deliverEnquiry(
  enquiry: Record<string, FormDataEntryValue | string>,
  branchEmail: string,
) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.ENQUIRY_FROM_EMAIL?.trim();
  if (resendApiKey && fromEmail) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [branchEmail],
        reply_to: String(enquiry.email),
        subject: `Website enquiry: ${enquiry.interest || "General enquiry"}`,
        text: enquiryText(enquiry),
      }),
    });
    if (!response.ok) throw new Error(`Resend returned ${response.status}.`);
    return;
  }

  const webhook = process.env.ENQUIRY_WEBHOOK_URL?.trim();
  if (!webhook) {
    throw new Error("Set RESEND_API_KEY and ENQUIRY_FROM_EMAIL, or ENQUIRY_WEBHOOK_URL.");
  }
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(enquiry),
  });
  if (!response.ok) throw new Error(`Enquiry webhook returned ${response.status}.`);
}

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
  try {
    await deliverEnquiry(enquiry, branch.email);
    returnUrl.searchParams.set("status", "success");
  } catch (error) {
    console.error("Could not deliver website enquiry.", error);
    returnUrl.searchParams.set("status", "error");
  }
  return NextResponse.redirect(returnUrl, 303);
}

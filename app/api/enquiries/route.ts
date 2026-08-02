import { NextResponse } from "next/server";
import { locations } from "@/lib/content";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

const limits = {
  firstName: 80,
  lastName: 80,
  email: 254,
  phone: 40,
  interest: 100,
  context: 200,
  serviceSlug: 120,
  serviceName: 160,
  message: 4000,
} as const;

type EnquiryField = keyof typeof limits;

function cleanField(data: Record<string, FormDataEntryValue>, field: EnquiryField) {
  const value = data[field];
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  if (
    cleaned.length > limits[field] ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(cleaned)
  )
    return undefined;
  return cleaned;
}

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
  const allowed = await consumeRateLimit({
    scope: "public-enquiry",
    identifier: requestIdentifier(request),
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!allowed) {
    returnUrl.searchParams.set("status", "error");
    return NextResponse.redirect(returnUrl, 303);
  }

  const branchId = typeof data.branchId === "string" ? data.branchId : "";
  const branch = locations.find((location) => location.id === branchId);
  const fields = Object.fromEntries(
    (Object.keys(limits) as EnquiryField[]).map((field) => [
      field,
      cleanField(data, field),
    ]),
  ) as Record<EnquiryField, string | undefined>;
  const valid =
    branch &&
    fields.firstName &&
    fields.lastName &&
    fields.phone &&
    fields.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
    Object.values(fields).every((value) => value !== undefined);
  if (!valid) {
    returnUrl.searchParams.set("status", "error");
    return NextResponse.redirect(returnUrl, 303);
  }

  const enquiry = {
    ...Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value || ""]),
    ),
    branchId,
    branchName: branch.name,
    branchAddress: branch.address,
  };
  try {
    await deliverEnquiry(enquiry, branch.email);
    returnUrl.searchParams.set("status", "success");
  } catch (error) {
    console.error("Could not deliver website enquiry.", error);
    returnUrl.searchParams.set("status", "error");
  }
  return NextResponse.redirect(returnUrl, 303);
}

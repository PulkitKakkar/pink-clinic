import { NextResponse } from "next/server";
import {
  isStopMessage,
  recordMarketingSmsOptOut,
} from "@/lib/notifications/marketing-opt-outs";
import { getPublicOrigin } from "@/lib/public-origin";
import {
  isValidTwilioSignature,
  twilioSignature,
} from "@/lib/security/twilio-signature";

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function POST(request: Request) {
  const form = await request.formData();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken)
    return NextResponse.json(
      { error: "The SMS webhook is not configured." },
      { status: 503 },
    );

  const requestUrl = new URL(request.url);
  const publicUrl = `${getPublicOrigin(request)}${requestUrl.pathname}${requestUrl.search}`;
  const expectedSignature = twilioSignature(publicUrl, form.entries(), authToken);
  if (
    !isValidTwilioSignature(
      request.headers.get("x-twilio-signature"),
      expectedSignature,
    )
  )
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });

  const from = String(form.get("From") || "");
  const body = String(form.get("Body") || "");
  const optOutType = form.get("OptOutType");

  if (from && isStopMessage(body, optOutType && String(optOutType)))
    await recordMarketingSmsOptOut(from, body || "STOP");

  return new NextResponse(EMPTY_TWIML, {
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

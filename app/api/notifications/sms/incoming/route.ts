import { NextResponse } from "next/server";
import {
  isStopMessage,
  recordMarketingSmsOptOut,
} from "@/lib/notifications/marketing-opt-outs";

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function POST(request: Request) {
  const form = await request.formData();
  const from = String(form.get("From") || "");
  const body = String(form.get("Body") || "");
  const optOutType = form.get("OptOutType");

  if (from && isStopMessage(body, optOutType && String(optOutType)))
    await recordMarketingSmsOptOut(from, body || "STOP");

  return new NextResponse(EMPTY_TWIML, {
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

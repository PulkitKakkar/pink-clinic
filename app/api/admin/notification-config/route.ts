import { NextResponse } from "next/server";

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function inspectSecret(value: string | undefined, options: { revealPrefix?: number; revealSuffix?: number } = {}) {
  const raw = value || "";
  const trimmed = raw.trim();
  const prefix = options.revealPrefix ? trimmed.slice(0, options.revealPrefix) : undefined;
  const suffix = options.revealSuffix ? trimmed.slice(-options.revealSuffix) : undefined;
  return {
    present: Boolean(trimmed),
    length: trimmed.length,
    hasLeadingOrTrailingWhitespace: raw !== trimmed,
    ...(prefix ? { prefix } : {}),
    ...(suffix ? { suffix } : {}),
  };
}

function basicAuth(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

async function checkTwilioCredentials(accountSid: string | undefined, authToken: string | undefined) {
  const sid = accountSid?.trim();
  const token = authToken?.trim();
  if (!sid || !token) return { checked: false, ok: false, reason: "Missing Account SID or Auth Token." };

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
      headers: { authorization: basicAuth(sid, token) },
      cache: "no-store",
    });
    if (response.ok) return { checked: true, ok: true, status: response.status };
    return { checked: true, ok: false, status: response.status, reason: response.status === 401 ? "Twilio rejected this Account SID/Auth Token pair." : await response.text() };
  } catch (error) {
    return { checked: true, ok: false, reason: error instanceof Error ? error.message : "Could not contact Twilio." };
  }
}

export async function GET() {
  return NextResponse.json({
    notificationWebhookUrl: present(process.env.NOTIFICATION_WEBHOOK_URL),
    twilioAccountSid: inspectSecret(process.env.TWILIO_ACCOUNT_SID, { revealPrefix: 2, revealSuffix: 4 }),
    twilioAuthToken: inspectSecret(process.env.TWILIO_AUTH_TOKEN),
    twilioPhoneNumber: inspectSecret(process.env.TWILIO_PHONE_NUMBER, { revealPrefix: 3, revealSuffix: 4 }),
    twilioCredentialCheck: await checkTwilioCredentials(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
  });
}

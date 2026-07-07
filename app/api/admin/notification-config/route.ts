import { NextResponse } from "next/server";

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

export function GET() {
  return NextResponse.json({
    notificationWebhookUrl: present(process.env.NOTIFICATION_WEBHOOK_URL),
    twilioAccountSid: present(process.env.TWILIO_ACCOUNT_SID),
    twilioAuthToken: present(process.env.TWILIO_AUTH_TOKEN),
    twilioPhoneNumber: present(process.env.TWILIO_PHONE_NUMBER),
  });
}

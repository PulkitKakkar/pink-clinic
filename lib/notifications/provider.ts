import "server-only";

import type { NotificationProvider } from "@/lib/notifications/types";

export class NotificationConfigurationError extends Error {}

class WebhookNotificationProvider implements NotificationProvider {
  constructor(private readonly url: string) {}

  async send(notification: Parameters<NotificationProvider["send"]>[0]) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.NOTIFICATION_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify(notification),
    });
    if (!response.ok) throw new Error(`Notification provider returned ${response.status}.`);
  }
}

class TwilioSmsNotificationProvider implements NotificationProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;

  constructor(
    accountSid: string,
    authToken: string,
    fromNumber: string,
  ) {
    this.accountSid = accountSid.trim();
    this.authToken = authToken.trim();
    this.fromNumber = formatPhoneNumber(fromNumber);
  }

  async send(notification: Parameters<NotificationProvider["send"]>[0]) {
    if (!notification.channels.includes("sms")) throw new Error("Twilio SMS provider cannot send this notification because no customer phone number is available.");

    const toNumber = formatPhoneNumber(notification.booking.customerPhone);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toNumber,
        From: this.fromNumber,
        Body: notification.message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 401) throw new Error("Twilio rejected the Account SID/Auth Token. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Amplify, then redeploy.");
      throw new Error(`Twilio returned ${response.status}: ${error.slice(0, 300)}`);
    }
  }
}

class LocalNotificationProvider implements NotificationProvider {
  async send(notification: Parameters<NotificationProvider["send"]>[0]) {
    console.info(`[notification:test] ${notification.type} -> ${notification.channels.join(", ")} -> ${notification.booking.customerName}`);
  }
}

function formatPhoneNumber(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  return `+${digits}`;
}

export function getNotificationProvider(): NotificationProvider {
  const webhook = process.env.NOTIFICATION_WEBHOOK_URL?.trim();
  if (webhook) return new WebhookNotificationProvider(webhook);
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (accountSid && authToken && phoneNumber) {
    return new TwilioSmsNotificationProvider(accountSid, authToken, phoneNumber);
  }
  if (process.env.NODE_ENV !== "production") return new LocalNotificationProvider();
  throw new NotificationConfigurationError("Set NOTIFICATION_WEBHOOK_URL or TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to send production booking notifications.");
}

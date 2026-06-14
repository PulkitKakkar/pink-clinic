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

class LocalNotificationProvider implements NotificationProvider {
  async send(notification: Parameters<NotificationProvider["send"]>[0]) {
    console.info(`[notification:test] ${notification.type} -> ${notification.channels.join(", ")} -> ${notification.booking.customerName}`);
  }
}

export function getNotificationProvider(): NotificationProvider {
  const webhook = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhook) return new WebhookNotificationProvider(webhook);
  if (process.env.NODE_ENV !== "production") return new LocalNotificationProvider();
  throw new NotificationConfigurationError("NOTIFICATION_WEBHOOK_URL is required to send production booking notifications.");
}

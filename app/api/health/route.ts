import { NextResponse } from "next/server";
import { checkBookingStorageHealth } from "@/lib/admin/booking-storage";

export const dynamic = "force-dynamic";

function configured(value: string | undefined, minimumLength = 1) {
  return Boolean(value?.trim() && value.trim().length >= minimumLength);
}

export async function GET() {
  const configuration = {
    database: configured(process.env.DATABASE_URL),
    admin: configured(process.env.ADMIN_EMAIL) && configured(process.env.ADMIN_PASSWORD, 16) && configured(process.env.ADMIN_SESSION_TOKEN, 32),
    academy: configured(process.env.ACADEMY_ADMIN_EMAIL) && configured(process.env.ACADEMY_ADMIN_PASSWORD, 16) && configured(process.env.ACADEMY_ADMIN_SESSION_TOKEN, 32),
    studio: configured(process.env.STUDIO_ADMIN_EMAIL) && configured(process.env.STUDIO_ADMIN_PASSWORD, 16) && configured(process.env.STUDIO_ADMIN_SESSION_TOKEN, 32),
    images: configured(process.env.TREATMENT_IMAGES_BUCKET),
    enquiries: (
      configured(process.env.RESEND_API_KEY) &&
      configured(process.env.ENQUIRY_FROM_EMAIL)
    ) || configured(process.env.ENQUIRY_WEBHOOK_URL),
    notifications: configured(process.env.NOTIFICATION_WEBHOOK_URL) || (
      configured(process.env.TWILIO_ACCOUNT_SID) &&
      configured(process.env.TWILIO_AUTH_TOKEN) &&
      configured(process.env.TWILIO_PHONE_NUMBER)
    ),
    reminders: configured(process.env.CRON_SECRET, 32),
  };

  try {
    await checkBookingStorageHealth();
  } catch {
    configuration.database = false;
  }

  const healthy = Object.values(configuration).every(Boolean);
  return NextResponse.json(
    { status: healthy ? "healthy" : "unhealthy", checks: configuration },
    { status: healthy ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

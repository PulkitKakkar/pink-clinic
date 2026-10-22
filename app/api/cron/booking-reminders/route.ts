import { observeApi } from "@/lib/observe-api";
import { NextResponse } from "next/server";
import { getBookings } from "@/lib/admin/booking-storage";
import { sendDueBookingReminders } from "@/lib/notifications/booking-notifications";

export const dynamic = "force-dynamic";

async function handleGET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const results = await sendDueBookingReminders(await getBookings());
  return NextResponse.json({ processed: results.length, results });
}

export const GET = observeApi("/api/cron/booking-reminders", handleGET);

import { NextResponse } from "next/server";
import { getBookings } from "@/lib/admin/booking-storage";
import { sendDueBookingReminders } from "@/lib/notifications/booking-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const results = await sendDueBookingReminders(await getBookings());
  return NextResponse.json({ processed: results.length, results });
}

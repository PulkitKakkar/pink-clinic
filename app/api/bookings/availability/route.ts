import { NextResponse } from "next/server";
import { getBookings } from "@/lib/admin/booking-storage";
import { staffMembers } from "@/lib/admin/booking-config";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";
import { getAvailableSlots, isBookableDate } from "@/lib/booking-availability";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const branchId = query.get("branchId") || "";
  const serviceId = query.get("serviceId") || "";
  const date = query.get("date") || "";
  const durationMinutes = Number(query.get("durationMinutes"));
  const validService =
    serviceId.startsWith("catalog:") || services.some((service) => service.id === serviceId);
  if (
    !branches.some((branch) => branch.id === branchId) ||
    !validService ||
    !isBookableDate(date) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 5 ||
    durationMinutes > 480
  )
    return NextResponse.json({ error: "Invalid availability request." }, { status: 400 });

  const slots = getAvailableSlots({
    date,
    durationMinutes,
    bookings: await getBookings(),
    staff: staffMembers,
    branchId,
    serviceId,
  });
  return NextResponse.json({ slots });
}

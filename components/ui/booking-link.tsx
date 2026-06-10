"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useBranch } from "@/components/providers/branch-provider";
import { bookingProvider } from "@/lib/booking";
import type { BookingIntent } from "@/lib/booking/types";

export function BookingLink({ intent, label = "Book appointment", className = "button-primary" }: { intent?: BookingIntent; label?: string; className?: string }) {
  const { selectedBranch } = useBranch();
  if (!selectedBranch && !intent?.branchId) {
    const href = intent?.serviceSlug ? `/treatments/select-branch?service=${intent.serviceSlug}` : "/treatments/select-branch";
    return <Link href={href} className={className}>{label}<ArrowUpRight size={16} /></Link>;
  }
  const bookingIntent = selectedBranch ? { branchId: selectedBranch.id, branchSlug: selectedBranch.slug, ...intent } : intent;
  return <Link href={bookingProvider.getBookingUrl(bookingIntent)} className={className}>{label}<ArrowUpRight size={16} /></Link>;
}

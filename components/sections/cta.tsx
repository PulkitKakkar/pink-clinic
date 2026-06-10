import { BookingLink } from "@/components/ui/booking-link";
import Link from "next/link";

export function AppointmentCta() {
  return <section className="relative overflow-hidden bg-pink py-24 text-white sm:py-28"><div className="noise absolute inset-0 opacity-50" /><div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/15" /><div className="absolute -right-12 -top-12 h-64 w-64 rounded-full border border-white/15" /><div className="container-site relative text-center"><p className="mb-4 text-[10px] font-bold uppercase tracking-[.3em] text-white/65">Your time is now</p><h2 className="mx-auto max-w-4xl font-display text-5xl leading-[.95] tracking-[-.05em] sm:text-7xl">Ready to feel like<br />your best self?</h2><p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/70">Start with a consultation or reserve your next treatment. Our team will take care of the rest.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><BookingLink className="button-light" label="Book treatment" intent={{ source: "homepage-cta" }} /><Link href="/contact" className="button-outline">Contact us</Link></div></div></section>;
}

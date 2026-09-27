import Link from "next/link";

export const metadata = { title: "Payment received", robots: { index: false, follow: false } };

export default function CheckoutSuccessPage() {
  return <main className="min-h-screen bg-pink-light/30 pt-28"><section className="mx-auto max-w-xl px-5 py-20 text-center"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink">Payment received</p><h1 className="mt-3 font-display text-5xl">We’re confirming your appointment.</h1><p className="mt-5 text-sm leading-7 text-black/60">Your booking is confirmed by our secure payment system, not this return page. Please allow a moment for your confirmation message to arrive.</p><Link href="/" className="button-primary mt-8">Return home</Link></section></main>;
}

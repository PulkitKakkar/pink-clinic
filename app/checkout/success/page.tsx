import Link from "next/link";
import { getBranchBySlug } from "@/lib/branches";
import { verifyPaymentOrder, fulfilStripeSession } from "@/lib/payments/stripe-orders";
import { BookingConflictError, getBookings } from "@/lib/admin/booking-storage";
import { StripeOrderReceipt } from "@/components/checkout/stripe-order-receipt";

export const metadata = { title: "Order confirmation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function receiptData(sessionId?: string) {
  try {
    if (!sessionId) throw new Error("Missing payment reference.");
    const order = await verifyPaymentOrder(sessionId);
    if (order.startsAt) {
      try { await fulfilStripeSession(sessionId); }
      catch (error) { if (!(error instanceof BookingConflictError)) throw error; }
    }
    const branch = getBranchBySlug(order.branchSlug);
    if (!branch) throw new Error("Invalid branch.");
    const bookedKeys = (await getBookings()).flatMap((booking) => booking.stripePaymentKey?.startsWith(`${order.sessionId}:`) ? [booking.stripePaymentKey] : []);
    return { order, branch, bookedKeys };
  } catch { return null; }
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  const data = await receiptData(sessionId);
  if (data) return <StripeOrderReceipt {...data} />;
  return <main className="min-h-screen bg-pink-light/30 pt-28"><section className="container-site max-w-xl py-20 text-center"><h1 className="font-display text-5xl">We’re checking your payment.</h1><p className="mt-5 text-sm leading-7 text-black/60">We couldn’t verify a completed payment yet. Refresh this page in a moment. If you have been charged, contact Pink with your Stripe payment reference before trying another payment.</p><Link href="/contact" className="button-primary mt-8">Contact Pink</Link><Link href="/basket" className="button-primary ml-3 mt-8">Return to basket</Link></section></main>;
}

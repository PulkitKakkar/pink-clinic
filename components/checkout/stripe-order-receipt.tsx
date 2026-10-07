"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppointmentCalendar } from "@/components/checkout/appointment-calendar";
import { useBasket } from "@/components/providers/basket-provider";
import type { Branch } from "@/lib/branches";
import { paymentAppointments, type PaymentOrder } from "@/lib/payments/types";

export function StripeOrderReceipt({ order, branch, bookedKeys }: { order: PaymentOrder; branch: Branch; bookedKeys: string[] }) {
  const { items, removePurchasedItems } = useBasket();
  const [index, setIndex] = useState(0);
  const appointments = paymentAppointments(order).filter((entry) => !bookedKeys.includes(entry.key));
  const appointment = appointments[index];
  useEffect(() => {
    // Wait for the basket provider to load persisted items before deducting the paid order.
    if (order.source !== "basket" || !items.length) return;
    const marker = `pink-stripe-basket-cleared:${order.sessionId}`;
    if (window.localStorage.getItem(marker)) return;
    window.localStorage.setItem(marker, "true");
    removePurchasedItems(order.items.map((item) => ({ ...item, branchId: order.branchId })));
  }, [items, order, removePurchasedItems]);

  return <main className="min-h-screen bg-pink-light/30 pt-28"><section className="container-site max-w-4xl py-10 sm:py-16">
    <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink">{order.livemode ? "Stripe payment received" : "Stripe test payment received"}</p>
    <h1 className="mt-3 font-display text-5xl sm:text-6xl">Thank you for your order.</h1>
    <p className="mt-4 text-sm leading-6 text-black/60">Your {order.livemode ? "payment" : "test payment"} of £{(order.amountTotal / 100).toFixed(2)} for {branch.name} has been verified.</p>
    {!order.livemode && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Sandbox order: no real money was charged. This order is for testing only.</p>}
    <div className="mt-6 rounded-2xl bg-white p-5 text-sm shadow-soft">
      {order.items.map((item, index) => <div key={index} className="flex justify-between gap-4 border-b border-black/5 py-3"><span>{item.quantity} × {item.title}{item.variantName && <small className="block text-black/60">{item.variantName}</small>}</span><strong>£{(item.unitAmount * item.quantity / 100).toFixed(2)}</strong></div>)}
      {order.items.some((item) => item.requiresShipping) && <p className="mt-4">Delivery: {order.shippingAmount ? `£${(order.shippingAmount / 100).toFixed(2)}` : "Free"}. Your products will be sent by Royal Mail 48 to {order.shippingAddress}.</p>}
      {order.items.some((item) => item.kind === "product" && !item.requiresShipping) && <p className="mt-4">Pink will contact you with your gift card details.</p>}
      {order.items.some((item) => item.kind === "course") && <p className="mt-4">Pink will contact you to arrange your course.</p>}
      <p className="mt-4 break-all text-xs text-black/60">Order reference: {order.sessionId}</p>
    </div>
    {appointment && order.customer ? <div className="mt-8">
      <p className="mb-4 text-sm leading-6 text-black/60">Payment is complete. Choose a time for {appointment.treatmentName}.{appointments.length > 1 && ` Appointment ${index + 1} of ${appointments.length}.`}</p>
      <AppointmentCalendar key={appointment.key} details={{ ...appointment, branchId: branch.id, branchName: branch.name, branchAddress: branch.address, customer: order.customer, paymentReference: order.sessionId, paymentAppointmentKey: appointment.key }} onContinue={index < appointments.length - 1 ? () => setIndex((value) => value + 1) : undefined} />
    </div> : paymentAppointments(order).length > 0 && <p className="mt-6 text-sm font-bold">Your purchased appointments have been booked. Check your confirmation message for the details.</p>}
    <Link href="/" className="button-primary mt-8">Return home</Link>
  </section></main>;
}

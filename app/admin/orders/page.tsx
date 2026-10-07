import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPaymentOrders } from "@/lib/payments/order-storage";
import { branches } from "@/lib/branches";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  const orders = (await getPaymentOrders()).filter((order) => order.status === "paid").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <><AdminHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><h1 className="font-display text-5xl">Stripe orders</h1><p className="mt-3 text-sm text-black/60">Paid orders for both branches. Review refunds and payment disputes in Stripe before fulfilment.</p><div className="mt-8 grid gap-5">{orders.length ? orders.map((order) => <article key={order.sessionId} className="rounded-2xl bg-white p-6 shadow-soft">
    {!order.livemode && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">Sandbox test order — no real payment. Do not fulfil.</p>}
    <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">{order.customer?.firstName} {order.customer?.lastName} · {branches.find((branch) => branch.id === order.branchId)?.name}</h2><strong>£{(order.amountTotal / 100).toFixed(2)}</strong></div>
    <p className="mt-2 text-xs text-black/60">{new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
    <ul className="mt-4 space-y-2 text-sm">{order.items.map((item, index) => <li key={index}>{item.quantity} × {item.title} · {item.variantName || "Standard"} · {item.kind}</li>)}</ul>
    <p className="mt-4 text-sm">{order.customer?.email} · {order.customer?.phone}</p>
    {order.shippingAddress && <p className="mt-3 text-sm"><strong>Deliver to:</strong> {order.shippingAddress}</p>}
    <p className="mt-4 break-all text-xs text-black/60">Stripe reference: {order.sessionId}</p>
  </article>) : <p className="rounded-2xl bg-white p-6 text-sm">No paid Stripe orders yet.</p>}</div></main></>;
}

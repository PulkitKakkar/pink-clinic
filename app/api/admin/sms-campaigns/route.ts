import { NextResponse } from "next/server";
import { getBookings } from "@/lib/admin/booking-storage";
import { buildCustomerHistories } from "@/lib/admin/customer-history";
import { isMarketingSmsAllowed, normalizePhoneNumber } from "@/lib/notifications/marketing-opt-outs";
import { prepareMarketingSms, validateMarketingSms } from "@/lib/notifications/marketing-sms-utils";
import { sendMarketingSms } from "@/lib/notifications/provider";
import { completeMarketingSmsCampaign, createMarketingSmsCampaign, updateMarketingSmsDelivery } from "@/lib/notifications/marketing-sms-history";
import { logAdminActivity } from "@/lib/admin/activity-log";

const MAX_RECIPIENTS = 500;

export async function POST(request: Request) {
  let body: { recipientIds?: unknown; message?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!Array.isArray(body.recipientIds) || !body.recipientIds.every((id) => typeof id === "string"))
    return NextResponse.json({ error: "Choose valid recipients." }, { status: 400 });
  const recipientIds = [...new Set(body.recipientIds)];
  if (!recipientIds.length) return NextResponse.json({ error: "Choose at least one recipient." }, { status: 400 });
  if (recipientIds.length > MAX_RECIPIENTS) return NextResponse.json({ error: `A campaign can include at most ${MAX_RECIPIENTS} recipients.` }, { status: 400 });
  const message = typeof body.message === "string" ? body.message : "";
  const messageError = validateMarketingSms(message);
  if (messageError) return NextResponse.json({ error: messageError }, { status: 400 });

  const customers = buildCustomerHistories(await getBookings());
  const byId = new Map(customers.map((customer) => [customer.id, customer]));
  const chosenCustomers = recipientIds.map((id) => byId.get(id)).filter((customer) => Boolean(customer)) as typeof customers;
  const preparedMessage = prepareMarketingSms(message);
  const campaign = await createMarketingSmsCampaign(preparedMessage, chosenCustomers.map((customer) => ({ customerId: customer.id, customerName: customer.name, phone: customer.phone })));
  const handledPhones = new Set<string>();
  let sent = 0, skipped = 0, failed = 0;
  for (const delivery of campaign.deliveries) {
    const customer = byId.get(delivery.customerId);
    const phone = customer ? normalizePhoneNumber(customer.phone) : "";
    if (!customer?.marketingConsent || !phone || handledPhones.has(phone) || !(await isMarketingSmsAllowed(phone))) { skipped += 1; await updateMarketingSmsDelivery(delivery.id, "skipped", "Consent withdrawn, opted out, or duplicate phone number."); continue; }
    handledPhones.add(phone);
    try { await sendMarketingSms(customer.phone, preparedMessage); }
    catch (error) { failed += 1; const errorMessage = error instanceof Error ? error.message : "Unknown delivery error."; await updateMarketingSmsDelivery(delivery.id, "failed", errorMessage); console.error(`[marketing-sms] Could not send to customer ${customer.id}`, error); continue; }
    sent += 1;
    await updateMarketingSmsDelivery(delivery.id, "sent");
  }
  await completeMarketingSmsCampaign(campaign.id, { sent, skipped, failed });
  await logAdminActivity({ action: "created", entity: "SMS campaign", entityId: campaign.id, summary: `SMS campaign sent to ${sent} customer${sent === 1 ? "" : "s"}`, changes: { recipientCount: recipientIds.length, sent, skipped, failed } });
  return NextResponse.json({ campaignId: campaign.id, sent, skipped, failed });
}

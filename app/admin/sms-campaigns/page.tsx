import { AdminHeader } from "@/components/admin/admin-header";
import { SmsCampaignComposer } from "@/components/admin/sms-campaign-composer";
import { SmsCampaignHistory } from "@/components/admin/sms-campaign-history";
import { getBookings } from "@/lib/admin/booking-storage";
import { buildCustomerHistories } from "@/lib/admin/customer-history";
import { isMarketingSmsAllowed, normalizePhoneNumber } from "@/lib/notifications/marketing-opt-outs";
import { getMarketingSmsCampaigns } from "@/lib/notifications/marketing-sms-history";

export const dynamic = "force-dynamic";

export default async function SmsCampaignsPage() {
  const [bookings, campaigns] = await Promise.all([getBookings(), getMarketingSmsCampaigns()]);
  const customers = buildCustomerHistories(bookings);
  const optedIn = customers.filter((customer) => customer.marketingConsent && customer.phone);
  const allowed = await Promise.all(
    optedIn.map(async (customer) => ({ customer, allowed: await isMarketingSmsAllowed(customer.phone) })),
  );
  const recipients = Array.from(
    new Map(
      allowed
        .filter((item) => item.allowed)
        .map(({ customer }) => [
          normalizePhoneNumber(customer.phone),
          { id: customer.id, name: customer.name, phone: customer.phone },
        ]),
    ).values(),
  );

  return <><AdminHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">Customer marketing</p><h1 className="mt-2 font-display text-5xl">SMS campaigns</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">Prepare a promotion, choose exactly which eligible customers should receive it, and send it through the clinic&apos;s Twilio number.</p><SmsCampaignComposer recipients={recipients} /><SmsCampaignHistory campaigns={campaigns} /></main></>;
}

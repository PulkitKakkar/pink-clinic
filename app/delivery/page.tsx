import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Delivery Information", description: "Delivery charges, areas and timing for Pink Beauty product orders.", alternates: { canonical: "/delivery" } };

export default function DeliveryPage() {
  return <PolicyPage eyebrow="Physical products" title="Delivery." intro="This delivery information applies to physical products sold for shipment by Pink Beauty Salon & Academy or Pink Beauty Clinic." sections={[
    { title: "Where we deliver", body: "Physical products are currently shipped within the United Kingdom of Great Britain and Northern Ireland. Appointment, course and digital or gift-card arrangements are confirmed separately and are not shipped as parcels unless expressly stated." },
    { title: "Charges", body: "Standard delivery is £4.99 for product orders below £75 and free for product orders of £75 or more. Any applicable delivery charge must be displayed in the final checkout total before payment." },
    { title: "Service and timing", body: "Standard delivery uses Royal Mail 48. Delivery estimates exclude weekends and public holidays; orders placed on a non-business day are processed on the next business day. Highlands and Northern Ireland delivery can take longer. A delivery estimate is not a guaranteed delivery date." },
    { title: "Questions or delays", body: "Contact the business shown on your order confirmation if a parcel is delayed or arrives damaged. Email either branch at info@pinkbeautysalons.co.uk, call Pink Beauty Salon & Academy on 0118 996 2711, or call Pink Beauty Clinic on 0118 402 8505." },
  ]} />;
}

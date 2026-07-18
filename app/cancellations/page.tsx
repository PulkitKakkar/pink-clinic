import { PolicyPage } from "@/components/policy-page";

export default function CancellationsPage() {
  return <PolicyPage eyebrow="Appointments and courses" title="Cancellations." intro="Contact the relevant branch as soon as possible if your plans change." sections={[
    { title: "West Street appointments", body: "West Street requires at least 48 hours’ notice to cancel or change an appointment. A late cancellation, change or missed appointment may be treated as used and deducted from a prepaid package. Some specialist or high-demand treatments require a deposit." },
    { title: "Watlington Street appointments", body: "Watlington Street asks for at least 24 hours’ notice to reschedule. Purchased or booked services are normally non-refundable, although this does not affect statutory rights. A service already begun with your express consent may not carry the usual cancellation right." },
    { title: "Courses, packages and deposits", body: "Course places, deposits, transfers, prepaid packages and session validity may have additional conditions supplied before enrolment or booking. Ask the academy to confirm dates, cancellation arrangements and what is included before paying." },
    { title: "How to make a change", body: "Call West Street on 0118 996 2711 or Watlington Street on 0118 402 8505 and provide your name, branch, appointment or order details. The branch will confirm any rescheduling, credit or refund that applies." },
  ]} />;
}

# BNPL launch review — 21 October 2026

Status: HOLD for public BNPL launch. The owner confirmed there is no written
provider scope confirmation yet. Dashboard Enabled and unpaid session creation
are technical checks, not evidence of coverage for every offering or seller.
This review does not replace the business/legal owner's approval of the policies.

## Changes prepared

- Terms, Returns and Cancellations remove automatic forfeiture of all fees and
  deposits. Cancellation deductions reflect actual loss after mitigation, with
  any balance refunded; no double recovery. Statutory cancellation and service
  remedies remain. Non-transfer and 12-month package conditions remain subject
  to these rights.
- Corrected course early-start wording: starting alone does not extinguish the
  cancellation right. Separate express request and full-performance acknowledgement
  must be recorded before supplying services during the cancellation period.
- Clarified original-method refunds and BNPL plan updates; added Clearpay privacy
  disclosures and neutral availability wording without promotional credit claims.
- The checkout API now defaults to card (including eligible enabled wallets).
  BNPL requires every item to have a provider-specific, branch-specific approval
  entry with an evidence reference in lib/payments/payment-methods.ts. The
  production list is empty. Gift-card/voucher detection also checks item titles;
  even an approval entry cannot override the gift exclusion.
- No AWS or Stripe account settings were changed during this review. This code
  safeguard has no effect until merged and deployed. It does not resolve the
  legal-seller issue for card payments, which also needs Stripe confirmation.

## Required before enabling BNPL

1. Ask Stripe to confirm whether account acct_1UKK9BPLNckAQmVH (Pink Beauty Salon
   Ltd) may process orders where the contractual seller is VB Wholesale UK Ltd.
   If not, agree a supported account structure and implement it before public
   checkout for that seller. Do not relabel a seller merely to bypass this issue.
2. Obtain provider scope confirmation for each treatment/course category,
   including invasive/clinical treatments, future courses, and prepaid packages
   used up to 12 months after purchase. Confirm applicable fulfilment deadlines,
   capture timing and evidence of delivery. Clearpay's Stripe terms list beauty,
   education and services as restricted and include a 14-day delivery clause;
   seek clarification for these service models rather than assuming approval.
3. Record references and approved scope here, then add only covered offerings to
   the code allowlist. Review variants and package changes before release: one
   handle must not include an unapproved variant. Both seller and complete mixed
   basket must be covered independently for each provider.
4. Business/legal owner reviews published terms, returns, cancellation, privacy,
   seller details and policy timing. Staff must retain separate early-start
   requests and acknowledgements before service/course commencement within a
   cancellation period. The general checkout checkbox does not capture these.
   The app does not yet capture separate early-start consent: obtain it in a
   durable record before starting, or do not start within that period. A booking
   or payment by itself is not consent to waive cancellation rights.
5. Complete the existing Stripe release gate: a controlled genuine payment and
   refund, actual webhook delivery/retry, exactly-once paid-order and appointment
   fulfilment, receipt delivery and refunds reflected in the provider plan.
   Do not use Klarna for owner/director/employee purchases. Do not infer a successful
   payment from a Checkout redirect. Follow provider-approved test procedures.
6. Use provider-approved UK wording for any later BNPL advertisements or badges.
   Do not add custom credit promotions or surcharges.

## Proposed support request — owner to send

Subject: Confirm UK merchant entities and BNPL scope for Pink website

We use Stripe account acct_1UKK9BPLNckAQmVH, registered to Pink Beauty Salon Ltd.
Our website offers West Street sales by Pink Beauty Salon Ltd and Watlington
Street sales by VB Wholesale UK Ltd. Please confirm whether this account setup
may process both sellers, or specify the supported structure required.

We want to offer Klarna and Clearpay through Stripe-hosted Checkout for beauty
and aesthetic services (including potentially invasive treatments), academy
courses booked ahead, and prepaid treatment packages redeemable over 12 months.
Gift cards and vouchers are excluded. Please confirm the approved and excluded
categories for each provider, whether separate underwriting/written approval is
needed, and the applicable delivery/capture deadlines for future services,
courses and packages. We will provide the exact offering list on request.
Please also confirm refund, dispute and fulfilment-evidence requirements for
these models. We have not treated dashboard Enabled as approval of this scope.

No support message has been sent by Codex.

## Primary sources checked

- https://stripe.com/gb/legal/afterpay-clearpay
- https://docs.stripe.com/payments/klarna/compliance
- https://www.gov.uk/government/publications/cancelling-goods-or-services-guide-for-consumers/cancelling-goods-or-services
- https://www.gov.uk/online-and-distance-selling-for-businesses

The earlier setup report's pending status was historical: PR #100 has since
merged. Its CI passed; public health checks were healthy on 21 October. A health
check does not establish the deployed commit or complete the payment release gate.

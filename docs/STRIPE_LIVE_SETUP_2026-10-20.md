# Pink Stripe live setup — 20 October 2026

## Scope

- Active AWS account: `417731044164` (verified with STS inside Pink CloudShell before changes).
- Amplify: `dex0d2j1ekar0/main`.
- App origin: `https://main.dex0d2j1ekar0.amplifyapp.com`.
- Stripe account: Pink Beauty Salon Ltd, `acct_1UKK9BPLNckAQmVH`.
- No source-account resources, DNS records or custom-domain settings changed.
- No application-code or schema changes were needed. `009_stripe_orders.sql` was verified in Pink's `schema_migrations`.

## Configuration

The runtime secret remains `pink-clinic/dex0d2j1ekar0/main/runtime`. Only
`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` changed; every other runtime
setting was compared and preserved.

- Previous current version (test): `a5b41430-f062-4c08-8198-625d346e0112`.
- Live version: `d3792c3e-f25e-40b4-99cf-c2658dd6c628`.
- The restricted live key grants Checkout Sessions write, Payment Intents read,
  and Charges and Refunds read. No payout or refund write permission was granted.
- The initially generated, unconfigured key was rotated by the user after its
  temporary CloudShell staging copy expired. The replacement was saved directly
  in Secrets Manager and verified against Stripe before activation.
- Live webhook destination: `we_1USZDvPLNckAQmVHrzMYZeP0`.
- URL: `https://main.dex0d2j1ekar0.amplifyapp.com/api/stripe/webhook`.
- Snapshot events: `checkout.session.completed` and
  `checkout.session.async_payment_succeeded`.
- Webhook API version: `2026-08-26.dahlia`.

No secret values or customer records are included in this report.

## Verification

- Stripe live API: created, retrieved (including the payment-intent expansion)
  and expired an unpaid Checkout session successfully. No charge was made.
- Amplify refresh: job `11`, commit
  `90b8bdb2cc89b23c0b3ade2ae1708cca75974296`.
- Deployment `11` succeeded in 4 minutes 32 seconds.
- Deployed `/api/health`: HTTP 200, all named checks true.
- Correctly signed synthetic configuration event: HTTP 200; unsigned request:
  HTTP 400. This verifies signature configuration, not an actual Stripe delivery.
- App-created course checkout: live mode, £399 total, correct Pink return origin;
  retrieved through the restricted key and expired without payment.
- App-created mixed treatment/gift-card basket: live mode, £160 total; retrieved
  through the restricted key and expired without payment.
- Both app smoke orders were verified in Pink's database as live, unpaid/pending
  records. No customer records were exported and no bookings or charges were made.
- Removed the now-redundant AWSPENDING label; AWSCURRENT remains the validated live
  version, and the former test version is retained for rollback.
- Physical delivery checkout was not exercised: the current local catalogues have
  no available physical products. Gift cards do not require delivery.
- Email receipt settings were not changed or independently verified.
- The application smoke sessions remain visible as unpaid orders. Both Stripe
  sessions are expired and cannot be paid.
- A completed live payment, Stripe delivery/retry, paid order/booking verification,
  receipt and refund remain launch-gate checks requiring a designated purchaser.

## Rollback

Restore the previous runtime secret version's `AWSCURRENT` label and refresh
Pink's deployment if payment configuration needs to return to test mode. Preserve
both versions. Do not restore source-account resources.

## Klarna and Clearpay follow-up — 21 October 2026

Pink's live payment-method configuration
`pmc_1UKK9iPLNckAQmVH8WpshrYL` showed Klarna and Afterpay / Clearpay as
Enabled, with no required actions. No account settings or permissions were changed.

The checkout update requests `card`, `klarna` and `afterpay_clearpay` for
non-gift purchases. Gift-card/voucher purchases, including mixed baskets that
contain them, remain card-only. Provider eligibility still determines availability
for a particular customer and transaction.

Gift-card restrictions:
- https://docs.stripe.com/payments/klarna/compliance
- https://stripe.com/gb/legal/afterpay-clearpay

Validation: lint, TypeScript, all 259 tests, and production build passed.
Live API smoke tests ran inside account-verified Pink CloudShell using the existing
restricted key and the proposed request parameters:
- £150 and £399 sessions included card, Klarna and Clearpay.
- A £1,600 session included card and Klarna; Stripe filtered out Clearpay.
- All three sessions were expired successfully without payment. No customer
  details were supplied, orders written to Pink, or charges made by these tests.
- Existing signed-webhook handling already ignores unpaid completions and handles
  asynchronous paid completions; its regression tests pass.

Code and deployment status: pending PR review and merge. These live API checks
validate the proposed parameters, not the currently deployed app route or a
completed BNPL authorisation.

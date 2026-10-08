# Pink Beauty launch runbook

## Release gate

1. Open a pull request and require `Lint, typecheck, test and build` to pass.
2. Review the deployment diff, database migration, content changes and environment-variable changes.
3. Verify the staging journeys on mobile and desktop: home, both treatment branches, catalogue, basket, contact, admin and Studio.
4. Confirm `/api/health` returns HTTP 200 and every named check is `true`.
5. Record the current release tag, Amplify deployment ID and database backup identifier.

The production origin is `https://pinkclinic.co.uk`. Until DNS cutover, use the
Amplify branch hostname for smoke tests and monitoring. The domain currently
serves Shopify, so preserve its DNS records for rollback before replacing them.

## Database protection

- Production PostgreSQL connections use TLS (`ssl: require`). Restrict inbound access to the hosting environment and named administrators.
- Enable automated encrypted backups with at least 14 days of retention and point-in-time recovery where the provider supports it.
- Before launch and every schema migration, take a manual snapshot and record its identifier in the release notes.
- Quarterly, restore the latest snapshot into an isolated non-production database, run `npm run db:migrate`, and verify booking/customer counts. Delete the restored copy after the test.
- Do not download production customer data to developer laptops.

## S3 treatment images

- Block all public access, enable default SSE-S3 or SSE-KMS encryption, and enable bucket versioning.
- Permit the Amplify runtime role only `s3:GetObject` and `s3:PutObject` under `treatment-images/*`.
- Apply a lifecycle/retention policy approved for clinical records. Image access must remain through the authenticated `/api/admin/images/view` route.
- Test with a non-sensitive image: authenticated upload and view must succeed; signed-out view must return 401.

## Rollback

1. Pause staff writes if data compatibility is uncertain.
2. In Amplify, redeploy the last known-good deployment recorded in the release notes.
3. If a migration damaged data, restore the pre-release snapshot to a new database, validate it, then update `DATABASE_URL`; never overwrite the only production copy.
4. Re-run `/api/health`, admin login, booking creation and notification smoke tests.
5. Record the incident, affected window and follow-up actions. Rotate any potentially exposed secret.

## Monitoring and response

- GitHub Actions calls the homepage, `/api/version` and `/api/health` every 15 minutes. Configure `MONITOR_URL` as the production origin and enable Actions failure notifications for the repository owner.
- Review Amplify server logs for HTTP 5xx responses, enquiry webhook failures, notification-provider failures and database connection errors.
- Treat failed booking confirmations or reminders as customer-impacting. Contact affected customers by phone, then fix or replay only after checking the notification ledger to prevent duplicates.

## Secret verification

- Staff Admin, Academy Admin and Studio credentials must be different. Passwords must be unique and at least 12 characters; session tokens and `CRON_SECRET` must be independently generated values of at least 32 characters.
- Store application secrets in the owning AWS account’s Secrets Manager; keep CI credentials in GitHub secrets. Rotate them after staff changes or suspected exposure.
- Never paste secret values into a ticket, pull request, screenshot or launch report.

## Content and legal sign-off

- A business owner checks prices, descriptions, offers, opening hours, staff, courses, locations and branch availability against the source of truth.
- The relevant business/legal owner approves privacy, cookie, cancellation, delivery, returns and terms wording against the integrations actually enabled in production.
- Submit the sitemap in Google Search Console, inspect the production homepage URL and confirm ownership for the canonical domain.

## Stripe payment release gate

- Stripe is the only online provider. Run migration `009_stripe_orders.sql` before
  deploying checkout, configure the live secret key and the live webhook signing
  secret in Secrets Manager, and verify both are available at runtime.
- Configure Stripe events `checkout.session.completed` and
  `checkout.session.async_payment_succeeded` for `/api/stripe/webhook`.
- On staging, verify a card decline, customer cancellation, successful basket
  checkout, a product with delivery, course purchase, multiple treatments, webhook
  redelivery and receipt refresh. Confirm order records in `/admin/orders` and
  exactly one booking per paid appointment in `/admin/bookings`.
- Confirm UK delivery costs (£4.99 below £75 of products; free at £75), enable Stripe
  email receipts and test notification delivery with designated test recipients.
- Change staging/test credentials to production/live credentials only after these
  journeys pass. Verify `/api/health`, and do a controlled live payment and refund
  before opening checkout to customers.

## Runtime configuration and account cutover

Keep public configuration in Amplify. Store database credentials, staff passwords,
session tokens and provider API keys in each account's own Secrets Manager secret:
`pink-clinic/{appId}/main/runtime`. The branch receives only `RUNTIME_SECRET_ARN`
and `RUNTIME_SECRET_REGION`. Its compute role needs `secretsmanager:GetSecretValue`
on that exact secret ARN. It needs no secret editing permission.

Use the account-checked migration script with the intended AWS profile:

```sh
node scripts/migrate-amplify-secrets.mjs --account ACCOUNT_ID --app APP_ID
node scripts/migrate-amplify-secrets.mjs --account ACCOUNT_ID --app APP_ID --stage
# After the runtime role can read the secret and the code is ready:
node scripts/migrate-amplify-secrets.mjs --account ACCOUNT_ID --app APP_ID --apply
```

Dry-run is the default. Staging preserves existing Amplify settings; applying
removes secret values from application and branch variables while preserving
public settings. The allowlist rejects unexpected keys. The proxy loads the
secret before handling application requests and rejects requests if it cannot load
it. Amplify compute credentials are used during request handling; do not fetch
secrets in the server startup instrumentation hook. Builds
skip runtime loading, and the build preparation script removes secrets from the
SSR environment file. Do not grant the build role secret access.

For rollback to code that predates runtime loading, restore the secret values to
Amplify variables securely before rebuilding that release. Never print them.
Update provider keys in Secrets Manager and redeploy to refresh running servers.

Before redirecting staff, back up both databases and compare migration checksums.
Run `scripts/sync-pink-database.py` inside Pink CloudShell with a private connection
file containing `sourceAccount`, `targetAccount` and `sourceDatabaseUrl`. Supply
an available target snapshot using `--snapshot`. Review the default dry run before
adding `--apply`. It copies a consistent source snapshot, verifies each incoming
row, preserves target-only rows and commits atomically. Customer exports remain
inside AWS. Source writes after the snapshot need another sync before final cutover;
do not rerun a source-authoritative sync after staff start editing Pink's records.

Only after Pink's health, authenticated staff routes, data and files pass, set
`LEGACY_REDIRECT_HOST=main.d269wokvvip0dc.amplifyapp.com` and
`LEGACY_REDIRECT_ORIGIN=https://main.dex0d2j1ekar0.amplifyapp.com` on the source
main branch and redeploy it. Page GET/HEAD requests redirect temporarily (302),
preserving paths and query parameters. API callbacks and POSTs remain on their
original deployment. Staff bookmarks work, but the browser shows Pink's hostname
and staff must sign in once there because cookies belong to each hostname.
Remove these two settings and redeploy to undo the redirect.

Both accounts incur charges while their resources remain provisioned. A redirect
does not stop RDS, storage, backups or secret charges. After Pink is accepted,
inventory and retire source resources with the owner's approval; retain the old
Amplify hostname only as a lightweight redirect if required. Resource deletion,
custom-domain cutover and Stripe live activation are separate approved steps.

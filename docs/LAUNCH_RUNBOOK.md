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

- Admin and Studio emails/passwords must differ. Passwords must be unique and at least 16 characters; session tokens and `CRON_SECRET` must be independently generated values of at least 32 characters.
- Store secrets only in Amplify/GitHub. Rotate them after staff changes or suspected exposure.
- Never paste secret values into a ticket, pull request, screenshot or launch report.

## Content and legal sign-off

- A business owner checks prices, descriptions, offers, opening hours, staff, courses, locations and branch availability against the source of truth.
- The relevant business/legal owner approves privacy, cookie, cancellation, delivery, returns and terms wording against the integrations actually enabled in production.
- Submit the sitemap in Google Search Console, inspect the production homepage URL and confirm ownership for the canonical domain.

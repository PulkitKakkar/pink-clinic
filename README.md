# Pink Beauty Salon & Academy

Production Next.js 16 website for Pink Beauty Salon, Clinic and Academy.

## Architecture

- `app/` — App Router pages, SEO routes, enquiry endpoint and embedded Sanity Studio
- `components/sections/` — reusable homepage and landing-page sections
- `components/ui/` — provider-agnostic booking UI
- `lib/booking/` — booking provider interface and configurable adapter
- `lib/branches.ts` — canonical branch model used by URLs, context and integrations
- `lib/pricing/` — provider-agnostic branch treatment pricing
- `lib/sanity/` — CMS client
- `sanity/schemas/` — Services, courses, team, testimonials, offers, gallery and blog schemas
- `lib/content.ts` — typed fallback content used before Sanity is populated
- `lib/admin/` — bookings, customers and consultation records
- `lib/learner/` — Academy accounts, courses, submissions and private files
- `db/migrations/` — ordered PostgreSQL migrations applied by `npm run db:migrate`

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Copying `.env.example` creates a development template; replace only the values needed for the feature you are testing. Do not commit `.env.local`.

Booking buttons route to the website's own contact form and preserve the selected branch and treatment. For direct email delivery, set `RESEND_API_KEY` and `ENQUIRY_FROM_EMAIL` after verifying the sending domain with Resend. Submissions for both branches are emailed to `info@pinkbeautysalons.co.uk`, with the customer's address as Reply-To. Alternatively, set `ENQUIRY_WEBHOOK_URL` to a CRM, email automation or serverless lead handler. Set `GETADDRESS_API_KEY` to enable postcode address lookup in staff forms.

## Products, services and images

The fallback catalogues for both branches are generated from their public Shopify JSON feeds:

```bash
npm run catalog:import
```

This overwrites `data/west-street-catalog.json` and `data/watlington-street-catalog.json` with the current live catalogue data, so review the diff before committing it. `catalog:import:west-street` is retained as an alias for the same two-branch import.

Day-to-day changes should be made by staff at `/studio` under **Catalogue**. **Products & Services** supports images, descriptions, collection assignment and a separate price configuration for each branch within one catalogue entry. Each branch can have either one current/original price pair or its own priced variants. When an original price is higher than the current price, the website presents it as a crossed-out discount. **Collections** supports adding existing products, manual ordering, collection images, descriptions, branch visibility and featured/hidden states. A published Studio entry with the same slug overrides the imported fallback entry; this keeps the latest reviewed import as a safe fallback. Watlington items and prices can be added to the same product by adding Watlington under **Available at**.

After reviewing both imported catalogues, a developer can perform the one-time Sanity seed with `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` and a Sanity editor token in `SANITY_WRITE_TOKEN`:

```bash
npm run catalog:seed:sanity
```

The seed creates both branch documents, converts Shopify collections into Studio collections and creates or updates catalogue editor records while retaining existing Studio images and featured flags. Existing Shopify images remain visible as fallbacks until staff replace them through Studio's image uploader. To copy remote catalogue images into Sanity after reviewing the import, run `npm run catalog:images:sanity` with the same Sanity credentials.

Studio uses a separate administrator login from the staff `/admin` area. Configure `STUDIO_ADMIN_EMAIL`, `STUDIO_ADMIN_PASSWORD` and `STUDIO_ADMIN_SESSION_TOKEN` in the hosting environment. The Studio session lasts four hours and is followed by Sanity's own project authentication. Do not reuse the staff password or either session token.

## Branch-aware treatment flow

Treatment journeys begin at `/treatments/select-branch`. The selected branch is represented in the URL, synchronized into `BranchProvider`, and persisted in local storage. All treatment prices are resolved through `PricingProvider`; booking links pass stable branch and service identifiers through `BookingProvider`.

Branch-specific offers and staff are modeled as branch references in Sanity. Availability and external booking IDs can be added behind the same branch/provider boundary without changing treatment UI components. Courses remain global and route directly to `/courses`.

Sanity Studio is available at `/studio` after adding the Sanity project ID and dataset.

## Staff administration

The authenticated staff workspace is available at `/admin`. Development-only
fallback credentials are shown on the local login page and are disabled in
production.

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random `ADMIN_SESSION_TOKEN` before deployment. Production deliberately has no fallback admin credentials.

Never commit `.env.local`, production exports, database dumps, customer data, or
credentials. See `SECURITY.md` for the production checklist and reporting policy.

The booking calendar supports both branches, manual treatments and practitioners, editing, notes, and conflict protection. Local development uses git-ignored JSON data. Production requires PostgreSQL:

```bash
# Set DATABASE_URL first, then create the bookings table and overlap constraint.
npm run db:migrate
```

The PostgreSQL exclusion constraint prevents the same configured or manually entered practitioner being booked for overlapping confirmed appointments, including concurrent requests across multiple production instances. A production deployment without `DATABASE_URL` will refuse to use the booking system.

## Booking notifications

Customers receive a confirmation when a booking is created. The hourly workflow sends one reminder for each confirmed appointment once it enters the 24-to-48-hour window. Booking changes and cancellations also trigger a customer notification. Delivery is provider-agnostic:

- Set `NOTIFICATION_WEBHOOK_URL` to an SMS/email automation endpoint.
- Optionally set `NOTIFICATION_WEBHOOK_SECRET`; it is sent as a Bearer token.
- Or, for direct SMS confirmations and reminders, set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- Set a long random `CRON_SECRET` in Amplify environment variables.
- Configure the repository's `CRON_SECRET` and `BOOKING_REMINDER_URL` GitHub Actions secrets. `CRON_SECRET` must exactly match the value configured in Amplify, and `BOOKING_REMINDER_URL` must be the full production URL ending in `/api/cron/booking-reminders`.
- Re-run `npm run db:migrate` after pulling notification changes to create the idempotent notification delivery ledger.

The included `.github/workflows/booking-reminders.yml` calls the reminder endpoint hourly at minute 7 and can also be run manually. GitHub Actions is the production scheduler; Amazon EventBridge Scheduler is not required. Do not enable a second scheduler unless failover is deliberately designed and monitored.

The webhook receives the notification type, subject, message, requested channels, and booking details. The provider is responsible for delivering SMS and/or email. When the Twilio environment variables are used without a webhook, the app sends SMS directly and does not send email notifications. Delivery records prevent duplicate reminders across concurrent production instances and allow failed deliveries to be retried. Local development logs notifications instead of contacting customers.

Configure the Twilio number's incoming-message webhook to send `POST` requests
to `/api/notifications/sms/incoming`. Standard STOP keywords are recorded and
withdraw promotional consent for every customer record with the matching phone
number. This opt-out applies only to promotional SMS; transactional booking
confirmations, changes, cancellations and reminders continue to be sent.

Consultation submissions use local JSON in development and PostgreSQL in production when `DATABASE_URL` is configured. Run `npm run db:migrate` after pulling consultation changes so the `consultations` table exists before staff use the digital forms.

Original supplied consultation PDFs are stored in `private/admin-forms/` and served only through authenticated admin API routes.

## Learner portal

Pink Academy learners sign in at `/learner-login`; public registration and self-service password resets are intentionally unavailable. Academy administrators use the separate `/academy-admin/login` area to create or reset credentials, enrol learners on individual VTCT courses, and review versioned assignment submissions. Configure unique `ACADEMY_ADMIN_EMAIL`, `ACADEMY_ADMIN_PASSWORD`, and `ACADEMY_ADMIN_SESSION_TOKEN` values; do not reuse salon staff credentials. Every generated learner credential requires a password change on first sign-in.

Approved course books and assignments are fixed in `lib/learner/courses.ts`. When Pink supplies them, store the documents privately and add their object keys to that manifest. Learners can submit online answers and up to five PDF or Word files of 10 MB each per attempt. Configure `LEARNER_FILES_BUCKET` and `LEARNER_FILES_REGION`; the existing private treatment-images bucket is used as a fallback when a separate learner bucket is not configured. Run `npm run db:migrate` before enabling the portal; it applies `003_learner_portal.sql` and any other unapplied migrations in order.

## Amplify deployment

Deploy with AWS Amplify Hosting using the included `amplify.yml`. Add the production values needed by the enabled features from `.env.example` to Amplify environment variables. The build allowlists the supported server-side variables and all `NEXT_PUBLIC_` variables into `.env.production` before `npm run build`; when adding a new server-only variable, update the allowlist in `amplify.yml` too.

Amplify Hosting does not create the PostgreSQL database for bookings. Create a production PostgreSQL database separately, for example Amazon RDS PostgreSQL, Aurora PostgreSQL, Neon, Supabase, or another managed Postgres provider, then set its connection string as `DATABASE_URL` in Amplify. Run `npm run db:migrate` against that database before using admin bookings.

Booking reminders are not scheduled by Amplify. The included GitHub Actions workflow calls:

```text
https://your-domain.com/api/cron/booking-reminders
```

Configure these GitHub Actions repository secrets:

- `BOOKING_REMINDER_URL` — the complete endpoint URL shown above.
- `CRON_SECRET` — the same long random secret configured in Amplify; the workflow sends it as a Bearer token.

The separate production monitor workflow runs every 15 minutes and requires `MONITOR_URL`, set to the production origin without a trailing path. Enable GitHub Actions failure notifications for the repository owner.

Images use Next Image, pages are statically generated where possible, and treatment/location routes include structured data and generated metadata.

## Releases

Operational launch, backup, monitoring and rollback steps are documented in
[`docs/LAUNCH_RUNBOOK.md`](docs/LAUNCH_RUNBOOK.md).

The live version is taken from `package.json` and exposed in the site footer and at:

```text
https://your-domain.com/api/version
```

Create tagged release versions before deploying:

```bash
npm run release:patch  # 1.0.0 -> 1.0.1
npm run release:minor  # 1.0.0 -> 1.1.0
npm run release:major  # 1.0.0 -> 2.0.0
npm run release:push
```

Pushing the version tag starts the GitHub release workflow. It runs linting, typechecking, and a production build, then creates a GitHub Release with generated notes and a `release-info.json` attachment.

Use patch releases for small fixes, minor releases for new features, and major releases for breaking changes or major rebuilds.

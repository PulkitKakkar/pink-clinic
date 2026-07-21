# Pink Beauty Salon & Academy

Production Next.js 15 website for Pink Beauty Salon, Clinic and Academy.

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

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Booking buttons route to the website's own contact form and preserve the selected branch and treatment. Set `ENQUIRY_WEBHOOK_URL` to a CRM, email automation or serverless lead handler before enabling the contact form in production.

## Products, services and images

The West Street fallback catalogue is generated from the Shopify CSV export:

```bash
npm run catalog:import:west-street -- "/path/to/West street products.csv" data/west-street-catalog.json
```

Day-to-day changes should be made by staff at `/studio` under **Catalogue**. **Products & Services** supports images, descriptions, collection assignment and a separate price configuration for each branch within one catalogue entry. Each branch can have either one current/original price pair or its own priced variants. When an original price is higher than the current price, the website presents it as a crossed-out discount. **Collections** supports adding existing products, manual ordering, collection images, descriptions, branch visibility and featured/hidden states. A published Studio entry with the same slug overrides the imported CSV entry; this keeps the original import as a safe fallback. Watlington items and prices can be added to the same product by adding Watlington under **Available at**.

After creating the West Street branch document in Studio, a developer can perform the one-time catalogue seed with a Sanity editor token in `SANITY_WRITE_TOKEN`:

```bash
npm run catalog:seed:sanity
```

The seed converts the Shopify tags into Studio collections and creates missing editor records without overwriting later staff changes. Existing Shopify images remain visible as fallbacks until staff replace them through Studio's image uploader.

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

Customers receive a confirmation when a booking is created and reminders approximately 48 and 24 hours before confirmed appointments. Booking changes and cancellations also trigger a customer notification. Delivery is provider-agnostic:

- Set `NOTIFICATION_WEBHOOK_URL` to an SMS/email automation endpoint.
- Optionally set `NOTIFICATION_WEBHOOK_SECRET`; it is sent as a Bearer token.
- Or, for direct SMS confirmations and reminders, set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- Set a long random `CRON_SECRET` in Amplify environment variables.
- Configure an external hourly scheduler, such as Amazon EventBridge Scheduler, to call `/api/cron/booking-reminders` with the cron secret.
- Re-run `npm run db:migrate` after pulling notification changes to create the idempotent notification delivery ledger.

The webhook receives the notification type, subject, message, requested channels, and booking details. The provider is responsible for delivering SMS and/or email. When the Twilio environment variables are used without a webhook, the app sends SMS directly and does not send email notifications. Delivery records prevent duplicate reminders across concurrent production instances and retry failed provider requests. Local development logs notifications instead of contacting customers.

Consultation submissions use local JSON in development and PostgreSQL in production when `DATABASE_URL` is configured. Run `npm run db:migrate` after pulling consultation changes so the `consultations` table exists before staff use the digital forms.

Original supplied consultation PDFs are stored in `private/admin-forms/` and served only through authenticated admin API routes.

## Amplify deployment

Deploy with AWS Amplify Hosting using the included `amplify.yml`. Add all required `.env.example` variables in Amplify environment variables. The build copies server-side and `NEXT_PUBLIC_` variables into `.env.production` before `npm run build`.

Amplify Hosting does not create the PostgreSQL database for bookings. Create a production PostgreSQL database separately, for example Amazon RDS PostgreSQL, Aurora PostgreSQL, Neon, Supabase, or another managed Postgres provider, then set its connection string as `DATABASE_URL` in Amplify. Run `npm run db:migrate` against that database before using admin bookings.

Booking reminders are not scheduled by Amplify automatically. Use Amazon EventBridge Scheduler, a Lambda cron, or another scheduler to request:

```text
https://your-domain.com/api/cron/booking-reminders
```

Include the configured `CRON_SECRET` according to the API route requirements. Images use Next Image, pages are statically generated where possible, and treatment/location routes include structured data and generated metadata.

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

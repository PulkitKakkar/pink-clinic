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

Set `NEXT_PUBLIC_BOOKING_URL` to Fresha now, or replace the adapter in `lib/booking/index.ts` with a Stripe/custom API implementation later. Set `ENQUIRY_WEBHOOK_URL` to a CRM, email automation or serverless lead handler before enabling the contact form in production.

## Branch-aware treatment flow

Treatment journeys begin at `/treatments/select-branch`. The selected branch is represented in the URL, synchronized into `BranchProvider`, and persisted in local storage. All treatment prices are resolved through `PricingProvider`; booking links pass stable branch and service identifiers through `BookingProvider`.

Branch-specific offers and staff are modeled as branch references in Sanity. Availability and external booking IDs can be added behind the same branch/provider boundary without changing treatment UI components. Courses remain global and route directly to `/courses`.

Sanity Studio is available at `/studio` after adding the Sanity project ID and dataset.

## Admin consultation prototype

The staff-only consultation workspace is available at `/admin`. For local testing:

```text
Email: admin@pinkbeauty.test
Password: PinkTest2026!
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random `ADMIN_SESSION_TOKEN` before deployment. Production deliberately has no fallback admin credentials.

The booking calendar supports both branches, manual treatments and practitioners, editing, notes, and conflict protection. Local development uses git-ignored JSON data. Production requires PostgreSQL:

```bash
# Set DATABASE_URL first, then create the bookings table and overlap constraint.
npm run db:migrate
```

The PostgreSQL exclusion constraint prevents the same configured or manually entered practitioner being booked for overlapping confirmed appointments, including concurrent requests across multiple Vercel instances. A production deployment without `DATABASE_URL` will refuse to use the booking system.

## Booking notifications

Customers receive a confirmation when a booking is created and reminders approximately 48 and 24 hours before confirmed appointments. Booking changes and cancellations also trigger a customer notification. Delivery is provider-agnostic:

- Set `NOTIFICATION_WEBHOOK_URL` to an SMS/email automation endpoint.
- Optionally set `NOTIFICATION_WEBHOOK_SECRET`; it is sent as a Bearer token.
- Set a long random `CRON_SECRET` in Vercel. Vercel Cron calls `/api/cron/booking-reminders` hourly.
- Hourly reminders require Vercel Pro or Enterprise. Vercel Hobby only permits daily cron jobs; use an external hourly scheduler if remaining on Hobby.
- Re-run `npm run db:migrate` after pulling notification changes to create the idempotent notification delivery ledger.

The webhook receives the notification type, subject, message, requested channels, and booking details. The provider is responsible for delivering SMS and/or email. Delivery records prevent duplicate reminders across concurrent Vercel instances and retry failed provider requests. Local development logs notifications instead of contacting customers.

Consultation submissions still use local JSON and are strictly for test data. Do not enter real customer or health information until consultation storage is moved to an encrypted database and production identity, role-based access, audit logging, retention controls, backups, and clinical/legal review are complete.

Original supplied consultation PDFs are stored in `private/admin-forms/` and served only through authenticated admin API routes.

## Deployment

Deploy to Vercel and add all `.env.example` variables in project settings. Images use Next Image, pages are statically generated, and treatment/location routes include structured data and generated metadata.

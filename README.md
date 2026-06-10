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

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random `ADMIN_SESSION_TOKEN` before deployment. Admin submissions currently use git-ignored local JSON storage in `data/admin/` and are strictly for test data. Do not enter real customer or health information until this is replaced with an encrypted database, production identity provider, role-based access, audit logging, retention controls, backups, and completed clinical/legal review.

Original supplied consultation PDFs are stored in `private/admin-forms/` and served only through authenticated admin API routes.

## Deployment

Deploy to Vercel and add all `.env.example` variables in project settings. Images use Next Image, pages are statically generated, and treatment/location routes include structured data and generated metadata.

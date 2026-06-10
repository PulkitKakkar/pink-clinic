# Pink Beauty Salon & Academy

Production Next.js 15 website for Pink Beauty Salon, Clinic and Academy.

## Architecture

- `app/` — App Router pages, SEO routes, enquiry endpoint and embedded Sanity Studio
- `components/sections/` — reusable homepage and landing-page sections
- `components/ui/` — provider-agnostic booking UI
- `lib/booking/` — booking provider interface and configurable adapter
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

Sanity Studio is available at `/studio` after adding the Sanity project ID and dataset.

## Deployment

Deploy to Vercel and add all `.env.example` variables in project settings. Images use Next Image, pages are statically generated, and treatment/location routes include structured data and generated metadata.

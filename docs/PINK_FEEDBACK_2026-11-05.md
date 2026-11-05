# Pink feedback — 5 November 2026

Requested by the owner after review of four WhatsApp voice notes and a screenshot.

## Implemented

- Academy is available only at Watlington Street, including catalogue detail and
  checkout resolution. West Street treatment and product availability is retained.
- Academy has VTCT and ABT groups, with VTCT selected first and existing accreditation
  logos. Courses appear as compact rows; promotional course images, general search,
  gender controls and unrelated collection categories are absent from this page.
- The Academy hero uses the existing Watlington photoshoot.
- Watlington Make-up and Beauty Therapy Diploma prices corrected from £400/£700
  to £399/£699 in fallback data and the corresponding Sanity branch variants.
  Other branch prices are unchanged. Live public catalogue and Sanity were compared;
  no £99.99 course price was found. No price was invented to replace that audio reference.
- Gallery reduced from 67 to 35 photos: four distinct salon views, six solo team
  portraits, thirteen distinct aesthetics images, four academy images and the
  existing eight exterior images. Source files are preserved. Videos are unchanged.
  Staff-at-work photos have been removed from the Salon collection, avoiding an
  ambiguous crop/removal instruction. One solo portrait of Shaheen remains in Team.
- Public team copy uses Blanche (retaining the existing URL anchor), Hair Specialist /
  Advanced Beauty Therapist; Harpreet and Shaheen use Advanced Beauty Therapist;
  Vilma uses Laser & Advanced Beauty Practitioner. Shaheen was already last.
- Chandni's story/qualifications await details from her, as confirmed by the owner.

## Pricing evidence

Checked 5 November 2026 against the owner-provided branch websites:

- https://pinkclinic.co.uk/collections/vtct-courses
- https://pinkbeautysalons.co.uk/collections/vtct-courses
- https://pinkclinic.co.uk/products/advanced-make-up-course — £399
- https://pinkclinic.co.uk/products/beauty-therapy-diploma — £699
- https://pinkclinic.co.uk/products/facial-and-skincare-course — £199
- https://pinkclinic.co.uk/products/female-intimate-waxing-course — £199
- https://pinkclinic.co.uk/products/gel-manicure-and-pedicure — £199
- https://pinkclinic.co.uk/products/waxing-course — £199
- https://pinkclinic.co.uk/products/ultimate-brow-masterclass-microblading-machine-ombre-powder-combination-course — £2,000 (was £3,499)
- https://pinkclinic.co.uk/products/ultimate-spmu-course-machine-ombre-powder-brows-lip-blush-lip-liner — £2,000 (was £3,499)
- https://pinkclinic.co.uk/products/ultimate-advanced-spmu-course-microblading-machine-ombre-powder-brows-lip-blush-lip-liner-course — £2,500 (was £3,699)

The suggested future regulation change in the recording was not independently
verified or published as a claim.

## Follow-up to send to Chandni

“Could you send a few lines about your story for the Our Team page—how you started
Pink, the milestones you want included, and what you want clients/students to know
about you? In your voice note, did you want any change to the qualifications or
‘Advanced treatments’ wording? If so, please send the exact wording.”

No database schema, AWS resources, environment variables, DNS or Stripe activation
changes are required for this update.

## Validation

- `npm run check`: lint, typecheck, 317 tests across 35 files and production build pass.
- Browser review at 1440px desktop and 390px mobile: VTCT default, ABT selection,
  six/nine courses respectively, corrected prices, course detail/purchase link,
  curated gallery count and team titles verified.
- Pink's public health endpoint was healthy with all named checks true before release.
- Local AWS identity is Pulkit's source account; no AWS CLI mutation was performed.

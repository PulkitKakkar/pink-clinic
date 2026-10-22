# Google reviews activation — 22 October 2026

## Prepared

The existing Places API integration now reads its API key and branch place IDs at
request time rather than capturing configuration during the build. No Google
Business Profile access or Pink Google account connection is needed.

Reviews are requested server-side without Next data caching, with a 2.5-second
timeout per branch. The other branch and public Google Maps links remain usable
when one request fails. No reviews or API keys are stored in the database.
Google relevance order is preserved within each branch and interleaved across
branches, displaying up to six reviews with written comments. Individual source
links, author attribution, Google Maps attribution and selection notice are shown.
The public fallback no longer displays developer configuration instructions.
Privacy and terms disclosures include Google services.

## Activation pending

The owner requested a separate Pink project and new Pink billing account, without
using the existing personal/Firebase billing accounts. Google Cloud billing setup
was started under pulkitkakkar176@gmail.com with name Pink Clinic Reviews, country
United Kingdom and GBP. The new billing account is 018587-77E18E-83E653; its
billing profile is incomplete and the form remained loading. The owner was asked
to finish Pink business/payment details. No existing billing account was linked.
The project has not yet been created, to avoid linking personal billing.

After the owner completes Pink billing details:

1. Create/select dedicated project Pink Clinic Reviews, link only the Pink billing
   account, enable Places API (New), and configure request quotas and budget alerts.
   Budgets alert; they do not cap spending. With uncached content, homepage requests
   can make one Place Details request per configured branch. Agree quotas before
   activation; falling back to Google Maps links is preferable to uncontrolled cost.
2. Create a server-side API key restricted to Places API (New). Amplify has no
   fixed outbound IP configured, so do not use a browser referrer restriction for
   this server-side key. Keep the key in Pink's runtime Secrets Manager only.
3. Resolve and verify each branch's Google Place ID against its actual address:
   West Street, 4–5 West Street, Reading; Watlington, 25 Watlington Street, Reading.
4. Verify AWS STS identity 417731044164 before mutations. Preserve all other runtime
   secret entries and public environment settings. Add GOOGLE_PLACES_API_KEY to
   pink-clinic/dex0d2j1ekar0/main/runtime; set GOOGLE_WEST_STREET_PLACE_ID and
   GOOGLE_WATLINGTON_STREET_PLACE_ID in target Amplify configuration. Refresh deploy.
5. Verify latest deployment success, all health checks, both branch identities,
   ratings/reviews/source links, mobile presentation, and no key in client output.
   Do not mark reviews live until a real authenticated Places request succeeds.

## Validation

Local lint, TypeScript, 304 tests across 32 files and production build passed.
New tests cover credentials loaded after module import, cache/timeout options,
branch interleaving and source links, missing configuration, and a failed branch.
No AWS, Google API key or production configuration changes have been made yet.

References:
- https://developers.google.com/maps/documentation/places/web-service/get-api-key
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/documentation/places/web-service/usage-and-billing

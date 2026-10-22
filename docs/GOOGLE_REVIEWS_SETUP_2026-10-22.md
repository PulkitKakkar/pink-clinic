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

## Business Profile route requested later on 22 October

The owner chose automatic updates rather than a manually maintained selection.
Chrome Business Profile Manager verifies both Pink branches under
khushbooc1995@gmail.com. The signed-in pulkitkakkar176@gmail.com account currently
lists zero businesses; pulkitkakkarrdec@gmail.com requires reauthentication.
The owner was asked which manager identity should authorise the integration.
No profile permissions, reviews or replies were changed.

Google documents the Business Profile API as having no usage charge, but still
requires an approved Cloud project and OAuth authorisation. Do not confuse the
interactive Business Profile Manager login with website API access. Do not
complete the pending paid Places setup merely to pursue this alternative.

The current PR implements Places only. A Business Profile adapter, credential
lifecycle and source-specific selection copy remain to be implemented after the
identity and project access are resolved. Do not describe this PR as supporting
Business Profile OAuth or as a working automatic feed.

- https://developers.google.com/my-business/content/pricing
- https://developers.google.com/my-business/content/prereqs
- https://developers.google.com/my-business/content/implement-oauth

## Authorised manager and dedicated project

The owner selected khushbooc1995@gmail.com and authorised submission of Google's
API access request, confirming that the West Street profile has been verified
for at least 60 days.

Created Google Cloud project Pink Clinic Reviews under that identity:
- Project ID: pink-clinic-reviews-20261022
- Project number: 872208401226
- Parent: No organisation
- No billing account was selected/linked during creation.

The Google application uses West Street's verified profile as the qualifying
business, https://pinkclinic.co.uk as company website, and explicitly describes
read-only retrieval of reviews/ratings for both Pink branches, reviewer
attribution/source links, no automated replies or unrelated profile management,
and asks Google to confirm that public website display is permitted. This
request does not grant OAuth access or activate reviews on the website.

### Submission confirmed

Google's workflow returned 100% complete and "Opened a support case".
- Case ID: 3-2226000041363
- Stated review time: approximately 7–10 business days.
- Google instructs applicants to submit only one request per project; do not
  create a duplicate case while this request is pending.

The request is submitted, not approved. Await Google's response to
khushbooc1995@gmail.com before enabling the Business Profile API/OAuth and
implementing the adapter. No website deployment or AWS change was made during
this application step. Existing Places-only PR #104 remains open, CI passed.

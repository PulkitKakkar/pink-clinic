# Google Business Profile automatic reviews — 29 October 2026

## Approval and current state

Google approved project `872208401226` (`pink-clinic-reviews-20261022`) in
support case `5-4917000041696`, with a default quota of 300 queries/minute.
The Cloud console was verified under `khushbooc1995@gmail.com`. The Google
My Business API is now visible, but still shows Enable. OAuth was unconfigured.

The branding form is prepared as Pink Clinic Reviews, external audience, with
`khushbooc1995@gmail.com` as support/contact. It is paused at the unchecked
Google API Services User Data Policy agreement. No API was activated, terms
accepted, OAuth client created, permission granted or AWS configuration changed.

Explicit confirmation is required at the browser action accepting the Google
terms and creating/granting persistent OAuth access. Google offers the broad
`https://www.googleapis.com/auth/business.manage` scope for reviews; this is
not a read-only permission. The application code only performs review GETs.
Do not describe the OAuth grant itself as read-only.

## Implemented

The homepage can automatically display up to six written 4+ star reviews,
interleaved across both branches, from the latest 50 updated reviews per branch.
The public selection notice describes this limit. Review text is unchanged;
branch average/count values come from Google's complete branch totals.
Reviewer names/photos and Google Maps attribution are shown. GBP does not
provide reviewer profile or individual review URLs, so none are fabricated.
Both branch links remain available to read the complete public review lists.

Review responses are cached only in server memory for five minutes, with timer
removal. Concurrent requests share fetches. Expired data is not served after a
failure; a healthy branch still works if the other fails. A successful empty
response does not resurrect the manual selection. If neither branch connects,
the dated, previously verified manual selection remains available. Access tokens
refresh server-side, expire early, and are invalidated on a review API 401.
No review database table, persistent content copy, scheduled job or migration is
needed. The next homepage request after cache expiry refreshes the feed.

## Activation procedure after confirmation

1. Enable Google My Business API (`mybusiness.googleapis.com`), My Business
   Account Management API (`mybusinessaccountmanagement.googleapis.com`), and
   My Business Business Information API
   (`mybusinessbusinessinformation.googleapis.com`) in this approved project.
   Accept the applicable Google terms only after the owner's confirmation.
2. Finish OAuth branding and create a Desktop OAuth client in the approved
   project. Keep its downloaded JSON private and outside the repository.
   Use a production publishing state suitable for this owner-operated app
   before generating the final token: external apps left in Testing can have
   refresh tokens expire after seven days. Complete any Google-required
   verification; do not claim long-term activation while that remains pending.
3. Use Pink AWS credentials on the local machine (or an authorised local Pink
   role). The machine's default identity was checked on 29 October and is
   Pulkit account `186539744419`, which must not be used for changes. The
   system AWS executable also fails with a CPU architecture error; the Node
   AWS SDK works. The setup utility uses the SDK and refuses the wrong account.
4. Run `node scripts/connect-google-reviews.mjs /private/path/desktop-client.json`
   for verification, or add `--apply` to verify and configure. Consent as
   `khushbooc1995@gmail.com`. The loopback callback uses random state and PKCE;
   codes/tokens/review payloads are never printed. The tool verifies the approved
   project, discovers accounts/locations with pagination, uniquely matches both
   Pink Reading street addresses, and calls each authenticated reviews endpoint.
5. With `--apply`, credentials are merged into Pink's existing runtime secret
   `pink-clinic/dex0d2j1ekar0/main/runtime`; both full location resource names
   are merged into the target main branch environment. Existing secret values
   and branch environment settings are preserved. A secret version change
   during consent aborts the operation. No deployment is started by this tool.
6. Merge only after PR quality checks pass, deploy Pink main, and verify
   `https://main.dex0d2j1ekar0.amplifyapp.com`: health, both review branch
   totals, automatic selection notice, author attribution, Maps links and mobile
   presentation. Verify no client secret/refresh token appears in client assets.
   Record the deployment ID and authenticated review checks before calling it live.
7. To disconnect, revoke Pink Clinic Reviews in the manager's Google account
   connections and remove its OAuth values from Pink runtime secrets, then
   recycle/deploy the runtime. The dated manual selection is the fallback.

No source AWS resources, unrelated sites, DNS, Stripe settings or Google profile
content/replies are changed by this integration.

## Validation

Local lint, TypeScript, 314 tests across 33 files and a production build passed.
Targeted integration tests cover OAuth refresh/deduplication, written 4+ selection,
branch isolation, expiry/failure, successful empty results and revoked consent.
The setup utility's wrong-AWS-account guard was exercised and refused changes.
Live authenticated Google checks and Pink deployment remain pending activation.

## References

- https://developers.google.com/my-business/content/basic-setup
- https://developers.google.com/my-business/content/implement-oauth
- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.google.com/my-business/content/policies
- https://developers.google.com/identity/protocols/oauth2#expiration

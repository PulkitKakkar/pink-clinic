# Consultation autosave and monitoring — 21–22 October 2026

## Behaviour

Consultation drafts autosave two seconds after an edit, with a maximum wait of
15 seconds during continuous typing. Pristine forms do not create empty records.
Autosave does not validate incomplete drafts, move focus, disable typing or show a
success dialog. Required client answers, consent and signatures remain mandatory
when validating the client section or finalising the consultation.

Each new form has a stable creation UUID. Retries reuse that ID, including when a
save succeeded but its response was lost. The first successful save replaces the
current URL with the saved record URL without navigating; reloading then restores
the saved draft. Signatures and image metadata trigger autosave too.

Writes are serialised. An explicit save waits for an in-flight autosave, then
updates the same record. Changes made during a slow save remain dirty and are saved
again. PostgreSQL guards reject stale background writes after another tab finalises
the record or locks its client section. Locked answers stay protected on the API.
Answers and image metadata are written together for draft updates.

Autosave applies to drafts only. Finalised records require explicit saves. A failed
background save stays visibly unsaved; expired sessions prompt separate-tab sign-in.
Returning to the tab or reconnecting retries pending edits, except a record conflict,
which requires reopening the saved record. Navigation with unsaved changes raises
the browser's normal leave-page warning. No clinical data is persisted to localStorage
or sessionStorage. Closing a tab before its save completes can still lose unsaved edits.

## Logging coverage

- Every API handler records handled HTTP 4xx and 5xx outcomes using its static route
  template, status and a generated support reference. No response body is logged.
- Next `onRequestError` records uncaught server, rendering, action and proxy errors.
- Consultation create/update/autosave failures, validation failures, session expiry
  and successful autosaves have explicit structured event categories.
- Staff browser errors, unhandled promise rejections, failed saves and image uploads
  send fixed category codes to an authenticated, size-limited, rate-limited endpoint.
- Enquiry-delivery and per-recipient SMS failures are logged even when their HTTP
  response is a redirect or reports partial success.
- New structured logs exclude request bodies, patient details, signatures, images,
  credentials, cookies, request URLs, raw exception messages and stacks. Browser
  reports also exclude error text and URL/DOM contents. Offline reports cannot reach
  AWS until a connection exists; the form itself remains unsaved and retryable.

## AWS configuration

All resources belong to Pink account `417731044164`, region `eu-west-2`.
Source-account resources were not changed.

- Log group: `/aws/amplify/dex0d2j1ekar0` (existing unlimited retention preserved).
- Metric namespace: `PinkClinic/dex0d2j1ekar0`.
- Metrics: `ApplicationErrors`, `ClientErrors`, `SessionExpiries`,
  `ValidationFailures`, `DraftAutosaves`.
- Dashboard: `PinkClinic-Application`.
- SNS topic: `PinkClinic-Application-Alerts`. The owner's requested recipient must
  confirm AWS's subscription email before email delivery is enabled.
- Alarms: application errors >=1/5 minutes; client errors >=3/5 minutes;
  session expiries >=5/15 minutes; Amplify `5xxErrors` >=1/5 minutes.
- Missing metric data is not treated as failure. Recovery notifications are enabled.
- The SNS publish grant permits CloudWatch only from this account's `PinkClinic-*`
  alarms. No new runtime role or secret access is needed.

`python3 scripts/setup-cloudwatch-monitoring.py --email ADDRESS` is a read-only dry
run. Add `--apply` to configure/update the account-checked resources idempotently.
The script never shortens existing log retention and preserves unrelated policies.

## Operations

Open the dashboard in CloudWatch and review structured events around the reported
time. Match the support reference shown on a failed save to its log entry. Session
expiry and validation failures are warnings; database, runtime and failed-save errors
are errors. API 5xx monitoring is independent of the new structured log metrics.
A browser/network crash before a report reaches the server cannot be guaranteed to
produce a server-side log; saved/unsaved status is the user's immediate signal.

No schema migration or environment-variable change is required; the existing
consultation primary key and JSONB columns provide the draft guards and stable IDs.

## Release verification

Local lint, typecheck, all 294 tests and the production build passed on 22 October.
Browser checks verified quiet incomplete-draft saves, preserved focus and reopening
the saved draft URL. No schema migration is required.

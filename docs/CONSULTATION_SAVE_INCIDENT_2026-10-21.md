# Consultation save investigation — 21 October 2026

Staff reported the generic consultation save error on final submission, particularly
when a completed form had been set aside for a long time. Microneedling was suggested
as the affected treatment, but the exact failing request was unavailable.

## Findings

- Staff authentication cookies expire eight hours after sign-in. An already-open
  form remains visible after expiry; its next save receives HTTP 401 from the proxy.
- The consultation form previously discarded all non-success response bodies and
  showed the same generic save error for authentication, validation and server errors.
  A rejected network request also left the form stuck in its saving state.
- This reproduces the reported long-open-form failure mode. The individual staff
  request was not captured, so its precise cause cannot be proved retrospectively.
- Pink account identity was verified as `417731044164`. All nine expected migrations
  (001–009) are present. `/api/health` returned 200 with every check true.
- Live authenticated synthetic tests passed for draft creation, draft updates,
  finalisation, new microneedling finalisation and microneedling updates. The returned
  record retained the synthetic signature and decimal needle depth. Unauthenticated
  submission returned 401 as expected. Customer data remained inside AWS.

## Change

A 401 now explains that staff must keep the current form open and sign in in a new
tab, then return and save again. The form stays mounted with its answers, signature,
images and record ID. Server validation details are displayed. Network and non-JSON
server failures restore the save controls and explain how to retry. No clinical
answers are written to browser storage, and the session lifetime is unchanged.

## Verification

- Full local lint, typecheck, test and production build passed (264 tests before the
  additional microneedling recovery test).
- Consultation interaction suite passed with the additional microneedling recovery
  case (107 tests); CI runs the full suite on the final commit.
- Regression tests cover 401 and retry for both new and existing forms, signature
  and answer preservation, actual microneedling validation and decimal fields,
  network failure, server validation and non-JSON gateway responses.
- No schema or runtime-secret change is required.

## Immediate staff recovery

Keep the filled form open. Sign in to Pink in a separate tab in the same browser,
then return to the original tab and submit again. Do not refresh the filled form.

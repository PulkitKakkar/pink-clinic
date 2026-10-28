# Recover consultation DOB and occupation

The consultation save handlers previously omitted DOB and occupation when creating
booking-backed customer records. Saved consultation answers remain a recovery source.

Run `scripts/backfill-consultation-profiles.py` inside **Pink AWS CloudShell** in
account `417731044164`, region `eu-west-2`, with Python 3, AWS CLI and `psql`.
Do not export consultation or booking rows to a laptop. This script emits counts
only and suppresses database errors that could contain patient data.

1. Deploy the consultation field transfer fix to prevent new omissions.
2. Take a fresh manual snapshot of `pink-clinic-prod` and wait until available.
3. Upload the script to Pink CloudShell. Run the default dry run:

   ```sh
   python3 backfill-consultation-profiles.py
   ```

4. Review aggregate recovery and conflict counts, then apply using the fresh snapshot:

   ```sh
   python3 backfill-consultation-profiles.py --apply --snapshot SNAPSHOT_IDENTIFIER
   ```

5. Repeat the dry run; recoverable counts should be zero unless new records arrived.
   Verify recovered fields under **Edit customer record** using the authenticated
   Pink app. DOB and occupation are not currently displayed on the main customer card.

The script verifies the AWS account and that the runtime secret points to Pink's
active RDS instance. Apply requires an available snapshot less than 24 hours old.
All planning and updates occur in one serializable transaction with table locks
and timeouts. Schedule during a quiet period: writes can briefly wait for the lock.
Dry run rolls back. Apply preserves nonblank fields and leaves consent unchanged.

Only submitted consultations (`ready-for-treatment` or `completed`) with matching
email, first name, last name and nonempty normalized phone are considered. A field
must have one unique nonblank value across matched consultations and existing
bookings sharing the email; conflicting values are skipped. DOB must be an ISO
date between 1900 and today. Invalid dates are skipped and counted. Unmatched records require manual review;
no fuzzy matching or new customer records are created. Referral source, emergency
contact and GP details remain consultation-only and are outside this backfill.

Validation: Python syntax check and synthetic PostgreSQL execution passed for
rollback-only dry runs, recovery, existing-value preservation, conflicting answers,
draft exclusion, email/name/phone mismatch, invalid and future DOB, partial
recovery, and an idempotent second apply (10 synthetic profiles). Full application
checks passed: lint, typecheck, 309 tests, and production build.

Live execution and aggregate recovery results must be recorded after running in
Pink CloudShell. Do not treat the local synthetic checks as a production backfill.

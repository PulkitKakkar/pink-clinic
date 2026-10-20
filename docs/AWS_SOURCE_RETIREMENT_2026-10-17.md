# Source AWS retirement — 17 October 2026

Owner authorized retiring every old Pink resource in source account
`186539744419` except the old Amplify URL, conditional on verifying Pink's data.
The owner explicitly clarified that unrelated sites and personal DNS resources
must remain. Pink account `417731044164` is the active deployment.

## Verification

- Source identity: `186539744419`; Pink identity: `417731044164`.
- Pink Amplify `dex0d2j1ekar0/main`: deployment 8 succeeded.
- Pink `/api/health`: HTTP 200, all named checks true. This endpoint checks configuration and database connectivity; image access was tested separately.
- Authenticated `/admin/bookings`, `/academy-admin` and `/studio`: HTTP 200 at the requested path, without redirecting to login.
- Protected image view: HTTP 200 authenticated; HTTP 401 signed out.
- Database comparisons ran inside Pink CloudShell. Customer rows were not downloaded to the developer computer.
- `schema_migrations` filenames and checksums match. All 13 application tables have zero missing source primary keys.

| Table | Source rows | Different rows | Additional Pink rows |
| --- | ---: | ---: | ---: |
| bookings | 253 | 0 | 2 |
| consultations | 22 | 1 | 3 |
| learner_accounts | 1 | 0 | 0 |
| learner_enrolments | 1 | 0 | 0 |
| learner_sessions | 0 | 0 | 0 |
| learner_assignment_due_dates | 0 | 0 | 0 |
| learner_submissions | 1 | 0 | 0 |
| marketing_sms_campaigns | 2 | 0 | 0 |
| marketing_sms_deliveries | 2 | 0 | 0 |
| marketing_sms_opt_outs | 0 | 0 | 0 |
| booking_notification_deliveries | 38 | 0 | 5 |
| admin_activity_log | 82 | 0 | 4 |
| payment_orders | 2 | 0 | 1 |

The differing consultation contains newer Pink answers (updated 10 October versus
19 September in source). Preserve Pink's version; do not apply a source-authoritative
sync. The source-data archive in Pink preserves the previous version. The remaining public tables
are `schema_migrations` and transient `request_rate_limits`.

All six current source S3 objects (468,875 bytes) exist in Pink with matching keys,
sizes and ETags. Pink additionally holds a database dump. The source bucket has
seven object versions and one delete marker. Archived the one previously deleted
image version privately in Pink before removing the source bucket and all versions.

Pink uses its own RDS endpoint, runtime secret and image bucket. The bucket has
versioning and all four public-access blocks enabled. RDS is encrypted and
deletion-protected. Automated backup retention was increased from 7 to 14 days.

## Final source configuration and retirement actions

- Disabled automatic builds on source Amplify `d269wokvvip0dc/main`.
- Removed unused source EventBridge API destination `Pink_booking_reminders`,
  after verifying no rules target it.
- Removed its unused EventBridge connection `Pink_reminder` after checking no
  remaining API destination references it.
- Source manual safety snapshot `pink-before-retirement-20261017` and final
  snapshot `pink-retired-final-20261017` were verified available before cleanup;
  both have now been removed under the owner's expanded retirement request.
- Pink manual safety snapshot: `pink-before-source-retirement-20261017` — available.
- Repeated database comparison immediately before retirement: same results.
- Source database `pink-clinic-prod`: deletion complete, absent from RDS.
- Deleted all six source manual snapshots. Deleted the retained automated backup
  set `db-JJKY76BSRJ2WESB4Y7NWBERJVY`; it is absent from the retained-backup API.
  All sixteen automated snapshot entries subsequently cleared. Final checks show
  zero source Pink snapshots and `DBInstanceAutomatedBackupNotFound` for the old
  retained backup set. CloudTrail recorded the deletion without an error.
- Deleted source image bucket `pink-clinic-treatment-images-186539744419`, all
  seven object versions and the one delete marker. Removed the temporary,
  version-scoped cross-account archive-transfer policy with the bucket.
- Deleted source compute role `PinkClinicAmplifyComputeRole`, its inline policies,
  source logging role `AmplifySSRLoggingRole-84011cdb-a620-4c4e-b452-de0e10dde13d`,
  and its dedicated logging policy.
- Deleted source log group `/aws/amplify/d269wokvvip0dc`, database security group
  `sg-0e6a3b2dee020f9d9` and the unused RDS subnet group `default-vpc-170d467f`.
- Source runtime secret is disabled and scheduled for deletion on 24 October 2026
  with a seven-day recovery window. It is no longer used by the redirect.
- Removed source preview branches `codex/homepage-catalog-polish` and
  `codex/runtime-secrets-request-init`, plus the failed source `pinkclinic.co.uk`
  domain association. No DNS records were changed.
- Kept source Amplify `d269wokvvip0dc/main`, changed platform to `WEB`, detached
  compute and service roles, and blanked every application and branch environment
  value. Empty-map updates alone did not clear existing Amplify variables;
  verified zero nonempty values after explicitly blanking each existing key.
- Source hosting rule: `/<*>` →
  `https://main.dex0d2j1ekar0.amplifyapp.com/<*>`, HTTP 302. Root, staff paths,
  `/api/health` and query-string preservation were verified after dependencies
  were removed. No application server or runtime secret is required.
- Preserved all three unrelated Amplify apps, all five personal DNS hosted zones,
  unrelated S3 buckets and other shared/account infrastructure.
- Read-only inventory covered the relevant service APIs in all 17 enabled AWS
  regions without scan errors. Identified old Pink resources were in `eu-west-2`.

## Recovery data retained in Pink

Pink's independent RDS database, 14-day automated backups and fresh manual snapshot
remain. The source comparison export and deleted image version were archived under:

`s3://pink-clinic-treatment-images-417731044164/retirement-archive/186539744419/2026-10-17/`

- `source-database-rows.tar.gz`: all 13 source application tables, 404 rows;
  1,189,049 bytes. SHA-256:
  `51e4ab15bf06b4eb81a714d51b2401c4131e3b0b566e37e204fcb0c1ad727bef`.
- `deleted-object-versions/`: the previously deleted 7,093-byte image version,
  preserved as an archive rather than restored to the application's image prefix;
  content verified against source ETag and by byte comparison inside AWS.
- `manifest.json`: source table counts, archive checksum and provenance.

Archives use SSE-S3 encryption and the existing private bucket's public-access
blocks and versioning. Customer data stayed inside AWS. This is a source-row
archive, not a replacement for historical RDS point-in-time snapshots. Restore
only into an isolated database using matching migrations, then reconcile with
Pink's newer data. Do not overwrite the active Pink database from this archive.

## Scheduled jobs and remaining launch work

Neither account has an active EventBridge rule or Scheduler schedule for booking
reminders in `eu-west-2`; the actual scheduler is GitHub Actions
(`.github/workflows/booking-reminders.yml`). Its recent runs succeeded, including
run `39020208876` on 17 October. Set GitHub `BOOKING_REMINDER_URL` and `MONITOR_URL`
explicitly to Pink's hostname during retirement. Verified the runtime cron
credential matches across deployments without logging its value, and configured
GitHub `CRON_SECRET` to that verified Pink-compatible value. No reminder workflow
was manually dispatched, to avoid sending customer messages during verification.
Dispatched the read-only production health monitor after updating its URL.
Run `39028523640` completed successfully against Pink. Post-retirement-request
checks also confirmed Pink's health and all three staff login pages return 200,
and the source page redirect preserves its path and query string.
After removing the source bucket, IAM roles, database networking and backups,
rechecked authenticated Pink bookings, Academy, Studio and protected image access:
all returned HTTP 200 at their requested routes. Pink `/api/health` remained
healthy with every named check true. Source root, staff URL with query string and
API URL all returned the expected hosting-level 302 to Pink.

Custom-domain cutover and Stripe live activation remain separate. No live payment,
notification send, booking creation or image upload was performed by this audit.

"""Recover blank DOB/occupation in Pink CloudShell. Only aggregate counts leave psql."""
import argparse
import json
import os
import subprocess
from urllib.parse import unquote, urlparse

ACCOUNT = '417731044164'
REGION = 'eu-west-2'


def aws(*parts):
    result = subprocess.run(['aws', *parts, '--region', REGION, '--output', 'json'], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError('AWS operation failed; secret output suppressed.')
    return json.loads(result.stdout)


def query(apply):
    # Match email AND full name AND nonempty phone exactly after normalization.
    # Each field must have exactly one distinct value across all matched submitted
    # consultations AND existing bookings. Conflicts are never auto-resolved.
    return r"""
BEGIN ISOLATION LEVEL SERIALIZABLE;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='60s';
LOCK TABLE bookings, consultations IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE filename='004_customer_occupation_dob.sql')
 THEN RAISE EXCEPTION 'Required customer profile migration is not recorded'; END IF;
END $$;
CREATE OR REPLACE FUNCTION pg_temp.profile_dob(value text) RETURNS date LANGUAGE plpgsql AS $$
DECLARE parsed date;
BEGIN
 IF value IS NULL OR value !~ '^\d{4}-\d{2}-\d{2}$' THEN RETURN NULL; END IF;
 parsed := value::date;
 IF parsed BETWEEN DATE '1900-01-01' AND CURRENT_DATE THEN RETURN parsed; END IF;
 RETURN NULL;
EXCEPTION WHEN data_exception THEN RETURN NULL;
END $$;
CREATE TEMP TABLE profile_candidates ON COMMIT DROP AS
WITH matched AS (
 SELECT b.id, c.answers
 FROM bookings b JOIN consultations c
 ON lower(trim(b.customer_email)) = lower(trim(c.answers->>'email'))
 AND trim(b.customer_email) <> ''
 AND lower(trim(b.customer_first_name)) = lower(trim(c.answers->>'firstName'))
 AND lower(trim(b.customer_last_name)) = lower(trim(c.answers->>'lastName'))
 AND trim(b.customer_first_name) <> '' AND trim(b.customer_last_name) <> ''
 AND (regexp_replace(b.customer_phone, '\D', '', 'g') = regexp_replace(c.answers->>'contactNumber', '\D', '', 'g'))
 AND regexp_replace(b.customer_phone, '\D', '', 'g') <> ''
 WHERE coalesce(c.answers->>'recordStatus', 'draft') IN ('ready-for-treatment', 'completed')
), values_by_field AS (
 SELECT id, 'occupation' AS field, trim(answers->>'occupation') AS value FROM matched
 UNION ALL
 SELECT id, 'dob', trim(answers->>'dateOfBirth') FROM matched
 UNION ALL
 SELECT b.id, 'occupation', trim(other.customer_occupation)
 FROM bookings b JOIN bookings other ON lower(trim(b.customer_email)) = lower(trim(other.customer_email))
 AND trim(b.customer_email) <> ''
 UNION ALL
 SELECT b.id, 'dob', other.customer_date_of_birth::text
 FROM bookings b JOIN bookings other ON lower(trim(b.customer_email)) = lower(trim(other.customer_email))
 AND trim(b.customer_email) <> ''
)
SELECT id, field, min(value) AS value, count(DISTINCT value) AS variants
FROM values_by_field WHERE coalesce(value, '') <> '' GROUP BY id, field;
CREATE TEMP TABLE profile_plan ON COMMIT DROP AS
SELECT b.id,
 CASE WHEN o.variants=1 THEN o.value END AS occupation,
 CASE WHEN d.variants=1 THEN pg_temp.profile_dob(d.value) END AS dob
FROM bookings b
LEFT JOIN profile_candidates o ON o.id=b.id AND o.field='occupation'
LEFT JOIN profile_candidates d ON d.id=b.id AND d.field='dob'
WHERE EXISTS (SELECT 1 FROM consultations c
 WHERE lower(trim(b.customer_email))=lower(trim(c.answers->>'email'))
 AND trim(b.customer_email) <> ''
 AND lower(trim(b.customer_first_name))=lower(trim(c.answers->>'firstName'))
 AND lower(trim(b.customer_last_name))=lower(trim(c.answers->>'lastName'))
 AND regexp_replace(b.customer_phone, '\D', '', 'g')=regexp_replace(c.answers->>'contactNumber', '\D', '', 'g')
 AND regexp_replace(b.customer_phone, '\D', '', 'g') <> ''
 AND coalesce(c.answers->>'recordStatus', 'draft') IN ('ready-for-treatment', 'completed'));
SELECT json_build_object(
 'bookingRowsWithMatchedProfiles', (SELECT count(*) FROM profile_plan),
 'blankOccupationRecoverable', (SELECT count(*) FROM bookings b JOIN profile_plan p USING(id) WHERE trim(b.customer_occupation)='' AND p.occupation IS NOT NULL),
 'blankDobRecoverable', (SELECT count(*) FROM bookings b JOIN profile_plan p USING(id) WHERE b.customer_date_of_birth IS NULL AND p.dob IS NOT NULL),
 'conflictingFieldGroupsSkipped', (SELECT count(*) FROM profile_candidates WHERE variants>1),
 'invalidDobGroupsSkipped', (SELECT count(*) FROM profile_candidates WHERE field='dob' AND variants=1 AND pg_temp.profile_dob(value) IS NULL));
""" + (r"""
WITH changed AS (
 UPDATE bookings b SET
 customer_occupation=CASE WHEN trim(b.customer_occupation)='' THEN coalesce(p.occupation,b.customer_occupation) ELSE b.customer_occupation END,
 customer_date_of_birth=coalesce(b.customer_date_of_birth,p.dob), updated_at=now()
 FROM profile_plan p WHERE b.id=p.id AND
 ((trim(b.customer_occupation)='' AND p.occupation IS NOT NULL) OR (b.customer_date_of_birth IS NULL AND p.dob IS NOT NULL))
 RETURNING b.id
) SELECT json_build_object('bookingRowsUpdated', count(*)) FROM changed;
COMMIT;
""" if apply else 'ROLLBACK;')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--snapshot', help='Available pre-backfill Pink RDS snapshot; required for apply')
    args = parser.parse_args()
    if not os.environ.get('AWS_EXECUTION_ENV', '').startswith('CloudShell'):
        raise RuntimeError('Run inside Pink AWS CloudShell; do not retrieve customer data locally.')
    if aws('sts', 'get-caller-identity')['Account'] != ACCOUNT:
        raise RuntimeError('Wrong AWS account; Pink account required.')
    instance = aws('rds', 'describe-db-instances', '--db-instance-identifier', 'pink-clinic-prod')['DBInstances'][0]
    if args.apply:
        if not args.snapshot:
            raise RuntimeError('--snapshot is required when applying.')
        snapshot = aws('rds', 'describe-db-snapshots', '--db-snapshot-identifier', args.snapshot)['DBSnapshots'][0]
        from datetime import datetime, timezone
        snapshot_age = datetime.now(timezone.utc) - datetime.fromisoformat(snapshot['SnapshotCreateTime'].replace('Z', '+00:00'))
        if snapshot_age.total_seconds() < 0 or snapshot_age.total_seconds() > 86400:
            raise RuntimeError('Take a fresh pre-backfill snapshot within 24 hours.')
        if snapshot['Status'] != 'available' or snapshot['DBInstanceIdentifier'] != instance['DBInstanceIdentifier']:
            raise RuntimeError('Available Pink database snapshot required.')
    secret = json.loads(aws('secretsmanager', 'get-secret-value', '--secret-id', 'pink-clinic/dex0d2j1ekar0/main/runtime')['SecretString'])
    url = urlparse(secret['DATABASE_URL'])
    if url.hostname != instance['Endpoint']['Address']:
        raise RuntimeError('Runtime database does not match Pink RDS instance.')
    env = {**os.environ, 'PGHOST': url.hostname, 'PGPORT': str(url.port or 5432), 'PGUSER': unquote(url.username), 'PGPASSWORD': unquote(url.password), 'PGDATABASE': url.path[1:], 'PGSSLMODE': 'require', 'PGCONNECT_TIMEOUT': '10'}
    result = subprocess.run(['psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], input=query(args.apply), env=env, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError('Backfill failed and rolled back; database diagnostics suppressed to protect customer data.')
    print(result.stdout, end='')
    print('Backfill committed.' if args.apply else 'Dry run complete; no changes committed.')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        raise SystemExit('Backfill stopped. Check Pink CloudShell identity, snapshot and database connectivity; no sensitive diagnostics displayed.')

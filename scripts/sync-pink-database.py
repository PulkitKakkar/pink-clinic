"""Run inside Pink CloudShell; customer data never leaves AWS. Dry-run by default."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import urlparse, unquote

parser = argparse.ArgumentParser()
parser.add_argument('--connection', required=True, help='Private JSON with sourceDatabaseUrl and account IDs')
parser.add_argument('--snapshot', required=True, help='Available target pre-sync RDS snapshot')
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
os.umask(0o077)

def aws(*parts):
    return json.loads(subprocess.check_output(['aws', *parts, '--region', 'eu-west-2', '--output', 'json'], stderr=subprocess.PIPE))

connection = json.loads(Path(args.connection).read_text())
assert connection['sourceAccount'] == '186539744419'
assert connection['targetAccount'] == '417731044164'
assert aws('sts', 'get-caller-identity')['Account'] == connection['targetAccount']
snapshot = aws('rds', 'describe-db-snapshots', '--db-snapshot-identifier', args.snapshot)['DBSnapshots'][0]
assert snapshot['Status'] == 'available' and snapshot['DBInstanceIdentifier'] == 'pink-clinic-prod'
secret = json.loads(aws('secretsmanager', 'get-secret-value', '--secret-id', 'pink-clinic/dex0d2j1ekar0/main/runtime')['SecretString'])

def env(url):
    parsed = urlparse(url)
    assert parsed.scheme in ['postgres', 'postgresql']
    return {**os.environ, 'PGHOST': parsed.hostname, 'PGPORT': str(parsed.port or 5432), 'PGUSER': unquote(parsed.username), 'PGPASSWORD': unquote(parsed.password), 'PGDATABASE': parsed.path[1:], 'PGSSLMODE': 'require', 'PGCONNECT_TIMEOUT': '10', 'PGOPTIONS': '-c timezone=UTC'}

source_env, target_env = env(connection['sourceDatabaseUrl']), env(secret['DATABASE_URL'])
assert source_env['PGHOST'] != target_env['PGHOST']

def psql(sql, config):
    result = subprocess.run(['psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'], input=sql, text=True, env=config, capture_output=True)
    if result.returncode:
        # PostgreSQL diagnostics can include customer row values. Keep them private.
        raise RuntimeError('Database operation failed; no customer data logged. Transaction rolled back.')
    return result.stdout

# Compare migration records before reading application data.
assert psql('SELECT json_agg(t ORDER BY filename) FROM (SELECT filename,checksum FROM schema_migrations) t;', source_env) == psql('SELECT json_agg(t ORDER BY filename) FROM (SELECT filename,checksum FROM schema_migrations) t;', target_env)
tables = ['bookings', 'consultations', 'learner_accounts', 'learner_enrolments', 'learner_sessions', 'learner_assignment_due_dates', 'learner_submissions', 'marketing_sms_campaigns', 'marketing_sms_deliveries', 'marketing_sms_opt_outs', 'booking_notification_deliveries', 'admin_activity_log', 'payment_orders']
metadata = {}
for table in tables:
    columns = psql(f"SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}' ORDER BY ordinal_position;", source_env).splitlines()
    assert columns == psql(f"SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}' ORDER BY ordinal_position;", target_env).splitlines()
    keys = psql(f"SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey) WHERE i.indrelid='public.{table}'::regclass AND i.indisprimary ORDER BY a.attnum;", source_env).splitlines()
    assert keys and all(re.fullmatch('[a-z_]+', name) for name in columns + keys)
    metadata[table] = (columns, keys)

# Export all tables from one consistent, read-only snapshot, entirely within AWS.
work = Path(tempfile.mkdtemp(prefix='pink-data-sync-'))
export = ['BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;']
for table in tables:
    export.append(f"\\copy (SELECT row_to_json(t)::text FROM public.{table} t) TO '{work / (table + '.csv')}' WITH (FORMAT csv)")
export.append('COMMIT;')
psql('\n'.join(export), source_env)
queries = ['BEGIN;', "SET LOCAL lock_timeout='10s';", "SET LOCAL statement_timeout='60s';"]
for table in tables:
    columns, keys = metadata[table]
    joined = ' AND '.join(f't."{key}"=s."{key}"' for key in keys)
    queries += [f'CREATE TEMP TABLE raw_{table} (payload jsonb) ON COMMIT DROP;', f"\\copy raw_{table} FROM '{work / (table + '.csv')}' WITH (FORMAT csv)", f'CREATE TEMP TABLE stage_{table} (LIKE public.{table}) ON COMMIT DROP;', f'INSERT INTO stage_{table} SELECT (jsonb_populate_record(NULL::public.{table},payload)).* FROM raw_{table};']
    queries.append(f"SELECT json_build_object('table','{table}','source',(SELECT count(*) FROM stage_{table}),'missing',(SELECT count(*) FROM stage_{table} s WHERE NOT EXISTS(SELECT 1 FROM public.{table} t WHERE {joined})),'changed',(SELECT count(*) FROM stage_{table} s JOIN public.{table} t ON {joined} WHERE to_jsonb(t) IS DISTINCT FROM to_jsonb(s)),'targetOnly',(SELECT count(*) FROM public.{table} t WHERE NOT EXISTS(SELECT 1 FROM stage_{table} s WHERE {joined}))); ")
    if args.apply:
        fields = ','.join(f'"{column}"' for column in columns)
        conflict = ','.join(f'"{key}"' for key in keys)
        updates = ','.join(f'"{column}"=EXCLUDED."{column}"' for column in columns if column not in keys)
        action = 'DO UPDATE SET ' + updates if updates else 'DO NOTHING'
        queries.append(f'INSERT INTO public.{table} ({fields}) SELECT {fields} FROM stage_{table} WHERE true ON CONFLICT ({conflict}) {action};')
        queries.append(f"DO $$ BEGIN IF EXISTS(SELECT 1 FROM stage_{table} s LEFT JOIN public.{table} t ON {joined} WHERE to_jsonb(t) IS DISTINCT FROM to_jsonb(s)) THEN RAISE EXCEPTION 'Sync verification failed'; END IF; END $$;")
queries.append('COMMIT;' if args.apply else 'ROLLBACK;')
print(psql('\n'.join(queries), target_env), end='')
print('Source rows verified; target-only rows preserved.' if args.apply else 'Dry run complete; target database unchanged.')
print('Private AWS export directory:', str(work))

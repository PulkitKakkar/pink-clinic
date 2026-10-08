import { AmplifyClient, GetAppCommand, GetBranchCommand, UpdateAppCommand, UpdateBranchCommand } from '@aws-sdk/client-amplify';
import { SecretsManagerClient, GetSecretValueCommand, CreateSecretCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import secretKeys from '../lib/runtime-secret-keys.json' with { type: 'json' };

const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
const account = args.includes('--account') ? arg('--account') : '';
const appId = args.includes('--app') ? arg('--app') : '';
const branchName = args.includes('--branch') ? arg('--branch') : 'main';
const region = args.includes('--region') ? arg('--region') : 'eu-west-2';
const apply = args.includes('--apply');
const stage = args.includes('--stage');
if (!/^\d{12}$/.test(account) || !appId || (apply && stage)) throw new Error('Provide --account ACCOUNT_ID --app APP_ID; optionally --stage or --apply.');
const identity = await new STSClient({ region }).send(new GetCallerIdentityCommand({}));
if (identity.Account !== account) throw new Error('AWS account mismatch; nothing changed.');
const amplify = new AmplifyClient({ region });
const secrets = new SecretsManagerClient({ region });
const app = (await amplify.send(new GetAppCommand({ appId }))).app;
const branch = (await amplify.send(new GetBranchCommand({ appId, branchName }))).branch;
const configured = { ...app.environmentVariables, ...branch.environmentVariables };
const name = `pink-clinic/${appId}/${branchName}/runtime`;
let arn;
let existing = {};
try {
  const found = await secrets.send(new GetSecretValueCommand({ SecretId: name }));
  arn = found.ARN;
  existing = JSON.parse(found.SecretString);
} catch (error) {
  if (error.name !== 'ResourceNotFoundException') throw new Error('Unable to inspect runtime secret; nothing changed.');
}
if (!existing || typeof existing !== 'object' || Array.isArray(existing) || Object.entries(existing).some(([key,value]) => !secretKeys.includes(key) || typeof value !== 'string')) throw new Error('Existing secret is invalid; nothing changed.');
const values = { ...existing };
for (const key of secretKeys) if (configured[key]) values[key] = configured[key];
for (const key of ['DATABASE_URL','ADMIN_PASSWORD','ADMIN_SESSION_TOKEN']) if (!values[key]) throw new Error('Required runtime configuration is missing; nothing changed.');
console.log(JSON.stringify({ account, appId, branchName, secretName: name, secretKeys: Object.keys(values), mode: apply ? 'apply' : stage ? 'stage' : 'dry-run' }));
if (!stage && !apply) process.exit(0);
try {
  if (arn) await secrets.send(new PutSecretValueCommand({ SecretId: arn, SecretString: JSON.stringify(values) }));
  else arn = (await secrets.send(new CreateSecretCommand({ Name: name, SecretString: JSON.stringify(values), Description: 'Pink server runtime configuration; values are never included in deployment artifacts.' }))).ARN;
  if (apply) {
    const withoutSecrets = env => Object.fromEntries(Object.entries(env || {}).filter(([key]) => !secretKeys.includes(key)));
    await amplify.send(new UpdateBranchCommand({ appId, branchName, environmentVariables: { ...withoutSecrets(branch.environmentVariables), RUNTIME_SECRET_ARN: arn, RUNTIME_SECRET_REGION: region } }));
    await amplify.send(new UpdateAppCommand({ appId, environmentVariables: withoutSecrets(app.environmentVariables) }));
  }
  console.log(JSON.stringify({ secretArn: arn, staged: true, applied: apply }));
} catch {
  throw new Error('Secrets migration failed. Inspect configuration before retrying; secret values have not been logged.');
}

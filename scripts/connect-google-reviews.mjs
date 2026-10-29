#!/usr/bin/env node
// Run locally with Pink AWS credentials and a Google Desktop OAuth client JSON.
// Credentials, authorization codes and review payloads are never printed.
import { createServer } from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { AmplifyClient, GetBranchCommand, UpdateBranchCommand } from '@aws-sdk/client-amplify';

const account = '417731044164';
const appId = 'dex0d2j1ekar0';
const branchName = 'main';
const region = 'eu-west-2';
const secretId = `pink-clinic/${appId}/main/runtime`;
const projectNumber = '872208401226';
const args = process.argv.slice(2);
const clientPath = args.find(arg => !arg.startsWith('--'));
const apply = args.includes('--apply');
const prepare = args.includes('--prepare-cloudshell');
if (!clientPath || (apply && prepare) || args.some(arg => arg.startsWith('--') && !['--apply', '--prepare-cloudshell'].includes(arg))) {
  console.error('Usage: node scripts/connect-google-reviews.mjs /private/path/desktop-client.json [--apply | --prepare-cloudshell]');
  process.exit(1);
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Google request failed (${response.status}); response suppressed.`);
  return response.json();
}
async function main() {
  if (!prepare) {
    const identity = await new STSClient({ region }).send(new GetCallerIdentityCommand({}));
    if (identity.Account !== account) throw new Error(`Wrong AWS account; expected Pink ${account}. No changes made.`);
  }
  const config = JSON.parse(await readFile(clientPath, 'utf8')).installed;
  if (!config?.client_id?.startsWith(`${projectNumber}-`) || !config.client_secret || config.project_id !== 'pink-clinic-reviews-20261022') {
    throw new Error('Expected a Desktop OAuth client from approved Pink project 872208401226.');
  }
  const secrets = new SecretsManagerClient({ region });
  const amplify = new AmplifyClient({ region });
  // Verify access before opening OAuth. Retain the version for a lost-update guard.
  const original = prepare ? undefined : await secrets.send(new GetSecretValueCommand({ SecretId: secretId }));
  const values = original ? JSON.parse(original.SecretString) : {};
  const state = randomBytes(32).toString('hex');
  const verifier = randomBytes(32).toString('base64url');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const redirect = `http://127.0.0.1:${server.address().port}/oauth/callback`;
  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorization.search = new URLSearchParams({ client_id: config.client_id, redirect_uri: redirect,
    response_type: 'code', scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline', prompt: 'consent', login_hint: 'khushbooc1995@gmail.com', state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
  console.log('Open this Google consent URL as khushbooc1995@gmail.com. Google offers the business.manage scope; the website only reads reviews.');
  console.log(authorization.href);
  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { server.close(); reject(new Error('Google consent timed out.')); }, 10 * 60 * 1000);
    server.on('request', (req, res) => {
      res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer');
      const url = new URL(req.url, redirect);
      if (url.pathname !== '/oauth/callback') { res.writeHead(404).end(); return; }
      const received = Buffer.from(url.searchParams.get('state') || '');
      const expected = Buffer.from(state);
      if (received.length !== expected.length || !timingSafeEqual(received, expected)) { res.writeHead(400).end('Invalid state.'); return; }
      clearTimeout(timeout);
      const result = url.searchParams.get('code');
      res.writeHead(result ? 200 : 400, { 'Content-Type': 'text/plain' }).end(result ? 'Google connection received. You can close this tab.' : 'Google access was not granted.');
      server.close();
      if (result) resolve(result); else reject(new Error('Google access was not granted.'));
    });
  });
  const oauth = await request('https://oauth2.googleapis.com/token', { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.client_id, client_secret: config.client_secret, code,
      code_verifier: verifier, redirect_uri: redirect, grant_type: 'authorization_code' }) });
  if (!oauth.refresh_token || !oauth.access_token) throw new Error('Google did not grant offline access.');
  const headers = { Authorization: `Bearer ${oauth.access_token}` };
  const accounts = [];
  let accountPage;
  do {
    const url = new URL('https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
    if (accountPage) url.searchParams.set('pageToken', accountPage);
    const data = await request(url, { headers });
    accounts.push(...(data.accounts || [])); accountPage = data.nextPageToken;
  } while (accountPage);
  const matches = { west: [], watlington: [] };
  for (const owner of accounts) {
    let locationPage;
    do {
      const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${owner.name}/locations`);
      url.searchParams.set('readMask', 'name,title,storefrontAddress'); url.searchParams.set('pageSize', '100');
      if (locationPage) url.searchParams.set('pageToken', locationPage);
      const data = await request(url, { headers });
      for (const location of data.locations || []) {
        const address = location.storefrontAddress;
        const street = (address?.addressLines || []).join(' ').toLowerCase();
        const pink = /pink/i.test(location.title || '') && /reading/i.test(address?.locality || '') && address?.regionCode === 'GB';
        if (!pink) continue;
        const resource = `${owner.name}/${location.name}`;
        if (!/^accounts\/\d+\/locations\/\d+$/.test(resource)) continue;
        if (/\bwest street\b/.test(street) && /\b4\s*[-–/]\s*5\b/.test(street)) matches.west.push(resource);
        if (/\b25\s+watlington street\b/.test(street)) matches.watlington.push(resource);
      }
      locationPage = data.nextPageToken;
    } while (locationPage);
  }
  for (const branch of Object.keys(matches)) matches[branch] = [...new Set(matches[branch])];
  if (matches.west.length !== 1 || matches.watlington.length !== 1) throw new Error('Could not uniquely verify both Pink street addresses. No AWS changes made.');
  for (const [branch, resources] of Object.entries(matches)) {
    const data = await request(`https://mybusiness.googleapis.com/v4/${resources[0]}/reviews?pageSize=1`, { headers });
    console.log(`${branch}: authenticated review request succeeded; total reviews ${data.totalReviewCount ?? 0}.`);
  }
  if (prepare) {
    const target = join(dirname(clientPath), 'pink-google-connection.json');
    await writeFile(target, JSON.stringify({ account, appId, branchName, credentials: { GOOGLE_BUSINESS_CLIENT_ID: config.client_id, GOOGLE_BUSINESS_CLIENT_SECRET: config.client_secret, GOOGLE_BUSINESS_REFRESH_TOKEN: oauth.refresh_token }, locations: { GOOGLE_BUSINESS_WEST_STREET_LOCATION: matches.west[0], GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION: matches.watlington[0] } }), { mode: 0o600 });
    console.log('Verified Google connection saved privately alongside client JSON for upload to Pink CloudShell. No AWS credentials used or exported.');
    return;
  }
  if (!apply) { console.log('Verified only. Rerun with --apply to store credentials and configure Pink.'); return; }
  const latest = await secrets.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (latest.VersionId !== original?.VersionId) throw new Error('Runtime secret changed during setup; rerun to preserve concurrent updates.');
  Object.assign(values, { GOOGLE_BUSINESS_CLIENT_ID: config.client_id, GOOGLE_BUSINESS_CLIENT_SECRET: config.client_secret, GOOGLE_BUSINESS_REFRESH_TOKEN: oauth.refresh_token });
  await secrets.send(new PutSecretValueCommand({ SecretId: secretId, SecretString: JSON.stringify(values) }));
  const branch = await amplify.send(new GetBranchCommand({ appId, branchName }));
  await amplify.send(new UpdateBranchCommand({ appId, branchName, environmentVariables: {
    ...branch.branch.environmentVariables,
    GOOGLE_BUSINESS_WEST_STREET_LOCATION: matches.west[0], GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION: matches.watlington[0],
  } }));
  console.log('Pink runtime credentials and both verified branch locations saved. Deploy the integration and verify the live homepage.');
}
main().catch(error => { console.error(error.message?.startsWith('Google request failed') || /^(Wrong AWS|Expected a Desktop|Runtime secret changed|Could not uniquely|Google did not|Google access|Google consent)/.test(error.message) ? error.message : 'Google reviews setup failed; sensitive diagnostics suppressed.'); process.exitCode = 1; });

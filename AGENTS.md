# AWS migration working agreement

On 17 October 2026 the user authorized retiring all old Pink resources in
Pulkit's account except the old Amplify URL, after data verification. The user
explicitly excluded unrelated sites and personal DNS resources from retirement.
The verification passed and the source RDS instance has been deleted;
see `docs/AWS_SOURCE_RETIREMENT_2026-10-17.md` for evidence, recovery snapshots and
completion status. Pink is the active deployment. Do not recreate the retired
source database or resume source automatic builds as part of routine changes.
A Git merge alone does not migrate environment variables or databases.

| Environment | AWS account | Amplify app | Branch |
| --- | --- | --- | --- |
| Pulkit source | `186539744419` | `d269wokvvip0dc` | `main` |
| Pink target | `417731044164` | `dex0d2j1ekar0` | `main` |

- Verify the AWS account identity before any mutation. Local default credentials
  currently access Pulkit's account; they must not be assumed to access Pink's.
- Apply required schema migrations to Pink's active database and verify
  `schema_migrations`. Use the database protection steps in `docs/LAUNCH_RUNBOOK.md`.
- Keep database credentials, bucket names, site origins, runtime roles and webhook
  signing secrets specific to each deployment. Never log secret values.
- Verify Pink deployment success and application behaviour. Preserve the source
  hostname's page redirect while it remains provisioned; its retired backend is
  no longer a deployment health target.
- Retain only source Amplify `d269wokvvip0dc/main` as a static hosting-level
  redirect to Pink. It uses platform `WEB`, a wildcard 302 rule, no runtime roles,
  and no nonempty environment values. Keep automatic builds disabled.
- Recovery data and a historical file version were archived in Pink's private
  S3 storage before source snapshots and storage were retired. Preserve Pink's
  backups and archives. See the retirement report for locations and status.
- Leave unrelated Pulkit-account applications, DNS, IAM, networking and storage
  resources alone. Do not remove the retained Amplify URL without a user request.

Pink's current verification URL is
`https://main.dex0d2j1ekar0.amplifyapp.com`.
The custom domain and live Stripe activation remain separate launch steps.

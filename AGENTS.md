# AWS migration working agreement

Until the user confirms the migration is complete, keep both Pink deployments
updated and verified when making deployment, configuration, database, or storage
changes. A Git merge alone does not migrate environment variables or databases.

| Environment | AWS account | Amplify app | Branch |
| --- | --- | --- | --- |
| Pulkit source | `186539744419` | `d269wokvvip0dc` | `main` |
| Pink target | `417731044164` | `dex0d2j1ekar0` | `main` |

- Verify the AWS account identity before any mutation. Local default credentials
  currently access Pulkit's account; they must not be assumed to access Pink's.
- Apply required schema migrations to each account's own database and verify
  `schema_migrations`. Use the database protection steps in `docs/LAUNCH_RUNBOOK.md`.
- Keep database credentials, bucket names, site origins, runtime roles and webhook
  signing secrets specific to each deployment. Never log secret values.
- Verify deployment success and application behaviour in both accounts. Record
  any account that could not be updated rather than calling the work complete.
- Keep Pulkit's resources available until the user confirms Pink's resources,
  data and cutover are safe and authorizes source-resource removal.

Pink's current verification URL is
`https://main.dex0d2j1ekar0.amplifyapp.com`.
The custom domain and live Stripe activation remain separate launch steps.

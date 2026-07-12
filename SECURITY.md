# Security

## Reporting a vulnerability

Please report security issues privately to the repository owner. Do not open a
public GitHub issue containing credentials, customer information, or exploit
details.

## Production checklist

- Store credentials only in the deployment platform or GitHub Actions secrets.
- Use unique, randomly generated values for `ADMIN_PASSWORD`,
  `ADMIN_SESSION_TOKEN`, and `CRON_SECRET`.
- Restrict production database access and use encrypted connections.
- Keep `.env.local`, database dumps, customer exports, and generated admin data
  outside Git. The repository ignore rules cover the expected local files.
- Rotate a credential immediately if it is ever committed. Removing it in a
  later commit does not remove it from Git history.
- Review dependency and secret-scanning alerts before each production release.

The application has no production fallback admin credentials. Missing production
admin or database configuration causes protected functionality to fail closed.

# SWAIS SGS Frontend

This is a Next.js App Router application for Google-based sign-in and role-based onboarding for SWAIS SGS.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file from `.env.example`.

3. In Google Cloud Console, add this redirect URL for local development:

```text
http://localhost:3000/api/auth/callback/google
```

4. Start the app:

```bash
npm run dev
```

## Environment Variables

Use `.env.example` as the source of truth for required variables.

- `AUTH_SECRET`: long random secret for Auth.js session signing
- `AUTH_URL`: public base URL of the app, such as `http://localhost:3000` locally or your production HTTPS URL
- `AUTH_GOOGLE_ID`: Google OAuth client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret
- `DATABASE_URL`: preferred Postgres connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: optional discrete Postgres settings when `DATABASE_URL` is not supplied
- `SGS_BACKEND_URL`: backend API base URL used for SSO token handoff, without a trailing API path
- `SGS_SSO_SECRET`: shared secret sent to the backend SSO token endpoint
- `NEXT_PUBLIC_*_DASHBOARD_URL`: role-specific dashboard URLs used after login

## Deployment Notes

- For AWS RDS, set `DATABASE_URL` with the RDS endpoint and production credentials.
- Keep local and production connection settings separate. Local Postgres may not support SSL, while RDS commonly requires it in the connection string.
- Update Google OAuth with the production callback URL before launch:

```text
https://your-domain/api/auth/callback/google
```

## Notes

- `/` is the custom sign-in page.
- `/dashboard` is protected and requires an authenticated session.
- Student access is additionally validated against `student_master.student_email`.

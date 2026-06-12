# Supabase projects

## PHOS (production target)

| Field | Value |
|-------|-------|
| Project ref | `eiwkdtpgnvvsgeguxrfa` |
| API URL | `https://eiwkdtpgnvvsgeguxrfa.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/eiwkdtpgnvvsgeguxrfa |

Run migrations **001 → 002 → …** in SQL Editor on this project only.

`.env.local` and Vercel production must use this URL and its anon + service role keys.

## DIOS (legacy shared, Sean data source)

| Field | Value |
|-------|-------|
| Project ref | `lkfjiboswnmeoiyymqbu` |
| API URL | `https://lkfjiboswnmeoiyymqbu.supabase.co` |

Sean James TipTraQ nights and legacy `patient_profiles` live here until migrated.

Use `scripts/migrate-sean-dios-to-phos.mjs` with DIOS keys in `.env.dios.local` (or `../dios-health/.env.local`) and PHOS keys in `.env.local`.

Vercel production currently has empty Supabase placeholders — set all three PHOS vars in Vercel before redeploying.

## Local env

Copy `.env.example` to `.env.local` and add keys from PHOS dashboard (Settings → API):

- `NEXT_PUBLIC_SUPABASE_URL=https://eiwkdtpgnvvsgeguxrfa.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server and scripts only)

Optional for Sean James account repair scripts:

- `SEAN_TEMP_PASSWORD`

## Sean James scripts

```bash
npm run sean:migrate:dry-run
npm run sean:migrate
npm run sean:reset-password
```

When `SEAN_TEMP_PASSWORD` is set, migrate and reset-password sync Sean's auth password and verify sign-in.

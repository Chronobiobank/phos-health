# Supabase project

PHOS and DIOS currently share one Supabase project.

| Field | Value |
|-------|-------|
| Project ref | `lkfjiboswnmeoiyymqbu` |
| API URL | `https://lkfjiboswnmeoiyymqbu.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/lkfjiboswnmeoiyymqbu |

## Local env

Copy `.env.example` to `.env.local` and add keys from the Supabase dashboard (Settings → API):

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

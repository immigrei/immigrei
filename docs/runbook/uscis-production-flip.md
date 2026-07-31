# USCIS Torch API — Sandbox → Production Flip

What to do the day USCIS approves the demo and sends production credentials.

## What USCIS sends

An email with:
- Production `client_id` / `client_secret`
- Confirmation that `https://api.uscis.gov` is the live endpoint

Save these straight into a password manager — never leave them sitting in
an email thread or Slack message longer than necessary.

## Pre-flip checks (do these before touching prod)

- [ ] Confirm current sandbox behavior is still clean (see
      `_tmp`-style script pattern used for the sandbox test run, or hit
      `/api/uscis/case-status` from `/painel` with a known test receipt)
- [ ] Confirm `describeApiFailure()` in `lib/uscis.ts` still covers every
      code USCIS documents (it does as of this writing — 400/401/403/404/
      422/429/503 + a generic fallback)
- [ ] Confirm Sentry is receiving events from this project

## The flip (production Vercel env vars)

1. `USCIS_API_BASE` → `https://api.uscis.gov`
2. `USCIS_CLIENT_ID` → the new production client id
3. `USCIS_CLIENT_SECRET` → the new production client secret

`isUscisSandbox()` in `lib/uscis.ts` flips automatically off this variable —
no code change needed, just the env vars above (Project → Settings →
Environment Variables → Production, then redeploy).

## After the flip

1. Add a real receipt number from `/painel` → "Meu caso no USCIS" and
   confirm a real (non-test) status comes back.
2. Watch Sentry / Vercel logs for ~30 minutes for anything unusual (auth
   errors would mean the credentials didn't save correctly).
3. In `app/dashboard/CaseStatusCard.tsx`, `sandboxMode` is passed in from
   wherever the dashboard page reads `isUscisSandbox()` server-side — once
   flipped, that prop naturally becomes `false` and the sandbox banner
   disappears on its own. Just confirm it's actually gone after deploy.
4. Tell users if it feels warranted (email or in-app note) — up to you,
   not required.

## Rollback

If something's wrong, revert the three env vars to the sandbox values and
redeploy. This is reversible in minutes — there's no data migration tied
to the flip, just which USCIS environment the app talks to.

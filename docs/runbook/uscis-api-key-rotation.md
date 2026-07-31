# USCIS Torch API — Key Rotation Runbook

USCIS requires API keys to be rotated every 365 days (`api-key-management-policy`
on developer.uscis.gov). Non-compliance can mean losing Developer Portal access.

## Timeline (per key)

| Day | Event |
|-----|-------|
| 344 | USCIS emails a rotation notice (~21 days out) |
| 351 | Grace period starts — old + new key both valid |
| 365 | Old key expires (14-day grace window closes) |

Track this per credential set, starting from the date the current
`USCIS_CLIENT_ID` / `USCIS_CLIENT_SECRET` were issued. Put reminders on the
calendar for Day 344 and Day 365 the moment a new key goes live.

## How to rotate

1. Log in to the USCIS Developer Portal (developer.uscis.gov) → API Keys.
2. Generate a new `client_id` / `client_secret` pair. Do not revoke the old
   one yet — both are valid during the grace period.
3. Update Vercel env vars (Project → Settings → Environment Variables):
   - `USCIS_CLIENT_ID`
   - `USCIS_CLIENT_SECRET`
   Set for the `Production` environment; redeploy triggers automatically.
4. Verify against sandbox first if timing allows, otherwise verify directly
   in production with a real or known-good receipt number:
   ```bash
   set -a; source .env.local; set +a
   npx tsx -e "
   import('./lib/uscis').then(async ({ fetchCaseStatus }) => {
     console.log(await fetchCaseStatus('EAC9999103403'));
   });
   "
   ```
   Expect a normal status response, not an `auth_401` / `auth_403` error.
5. Confirm the app is healthy for ~15 minutes (Sentry, Vercel logs, or a
   manual check of `/painel`).
6. After the old key's 365-day mark passes, revoke it in the Developer
   Portal and delete it from any local `.env.local` copies.
7. Log the rotation below.

## Rotation log

| Date | Rotated by | Notes |
|------|-----------|-------|
| — | — | First key issued alongside sandbox onboarding (Jul 2026) |

## If a key is compromised

Don't wait for the 365-day cycle — rotate immediately:
1. Generate new credentials in the Developer Portal.
2. Update Vercel env vars right away (step 3 above).
3. Revoke the compromised key in the Developer Portal the moment the new
   one is confirmed working.
4. Check Sentry / Vercel access logs for anything unusual in the meantime.

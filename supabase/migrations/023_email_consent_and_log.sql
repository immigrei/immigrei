-- Email lifecycle infrastructure.
--
-- Two things the flows in content/marketing/email-flows/ depend on:
--
-- 1. Marketing consent, kept separate from transactional mail. Case-status
--    alerts, I-94 deadlines and dunning are service messages about the user's
--    own account and do not need this flag. Newsletter, upgrade nudges and
--    reactivation do (CAN-SPAM, and LGPD for users in Brazil).
--
-- 2. A send log, so a daily cron cannot mail the same person the same step
--    every night. Without it every lifecycle flow is unsafe to run.
--
-- NOT APPLIED YET — consent wording and the decision to collect it need
-- human sign-off first.

-- ── Marketing consent ───────────────────────────────────────────────────────
alter table profiles
  add column if not exists marketing_consent          boolean     not null default false,
  add column if not exists marketing_consent_at       timestamptz,
  -- Where consent came from ('signup', 'settings', 'import'). Proving *how*
  -- consent was given is the part that matters if it is ever challenged.
  add column if not exists marketing_consent_source   text;

comment on column profiles.marketing_consent is
  'Explicit opt-in for marketing email (newsletter, upgrade nudges, reactivation). Transactional mail about the user''s own case does not depend on this.';

-- ── Send log ────────────────────────────────────────────────────────────────
create table if not exists email_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references profiles(clerk_user_id) on delete cascade,
  flow        text not null,   -- '01-welcome', '03-free-to-paid', ...
  step        text not null,   -- 'email-1', 'toque-2', ...
  sent_at     timestamptz not null default now(),
  -- Resend message id, for tracing a delivery complaint back to a send.
  provider_id text
);

-- The uniqueness that makes daily crons safe to run.
create unique index if not exists email_log_once_per_step
  on email_log (user_id, flow, step);

create index if not exists email_log_user_sent
  on email_log (user_id, sent_at desc);

alter table email_log enable row level security;
-- Service role only: written by crons and webhooks, never read by the client.

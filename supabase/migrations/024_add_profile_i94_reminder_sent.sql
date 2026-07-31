-- Tracks whether the one-time "fill in your I-94" nudge was already sent,
-- so the daily i94-deadlines cron never re-mails a user who left the field
-- blank. Deliberately its own column instead of the email_log table in
-- 023 (not applied yet, pending consent-wording sign-off) — this alert is
-- transactional, like the deadline alerts already sent from the same cron,
-- and doesn't need that infrastructure.
alter table profiles
  add column if not exists i94_reminder_sent_at timestamptz;

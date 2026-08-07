-- Require approval from BOTH founders before a draft is considered approved.
-- A single ✅ is no longer sufficient — approved_by_users must contain every
-- Slack user ID listed in SLACK_REQUIRED_APPROVERS before status flips to
-- 'approved'.

ALTER TABLE content_pipeline
  ADD COLUMN approved_by_users text[] NOT NULL DEFAULT '{}';

-- approved_by / approved_at now mean "last approver / last approval timestamp"
-- (kept for backwards compat + quick "who approved most recently" queries).
-- approved_by_users is the source of truth for "has everyone approved".

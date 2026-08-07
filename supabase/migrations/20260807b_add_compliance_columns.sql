-- Add compliance-fact-check gate columns to content_pipeline
-- Every draft must pass through compliance-fact-check before a human sees
-- approval buttons — this tracks that verdict alongside the draft.

ALTER TABLE content_pipeline
  ADD COLUMN compliance_verdict text,
  -- compliance_verdict: PASS | PASS_WITH_FLAGS | FAIL | null (not yet checked)
  ADD COLUMN compliance_report text,
  ADD COLUMN compliance_checked_at timestamp with time zone;

-- Extend status check to include the compliance-gate outcome, so a FAIL never
-- reaches "pending_approval" and can't be accidentally approved.
-- status: pending_compliance | compliance_failed | pending_approval | approved
--         | rejected | edit_requested | published | failed

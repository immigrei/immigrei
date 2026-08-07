-- Create content_pipeline table for Slack → Content Agent → Postiz workflow
-- Tracks each content request from Slack through approval to publishing

CREATE TABLE IF NOT EXISTS content_pipeline (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trigger_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  channel_id text NOT NULL,
  topic text NOT NULL,
  draft_content text,
  status text NOT NULL DEFAULT 'pending_approval',
  -- status: pending_approval | approved | rejected | edit_requested | published | failed
  approved_by text,
  approved_at timestamp with time zone,
  published_by text,
  published_at timestamp with time zone,
  postiz_post_id text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index on status for querying pending approvals
CREATE INDEX idx_content_pipeline_status ON content_pipeline(status);

-- Index on user_id for user-specific queries
CREATE INDEX idx_content_pipeline_user_id ON content_pipeline(user_id);

-- Index on created_at for time-based queries
CREATE INDEX idx_content_pipeline_created_at ON content_pipeline(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for backend)
CREATE POLICY "Service role has full access" ON content_pipeline
  AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Optional: Allow authenticated users to read their own records
CREATE POLICY "Users can read their own records" ON content_pipeline
  FOR SELECT USING (
    auth.uid()::text = user_id OR auth.role() = 'service_role'
  );

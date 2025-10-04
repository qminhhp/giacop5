-- Drop existing table if it exists (to update schema)
DROP TABLE IF EXISTS goals CASCADE;

-- Create goals table for member monthly targets
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  member_id TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  activity_targets JSONB NOT NULL DEFAULT '[]', -- Array of {activityId: string, targetCount: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, month)
);

-- Create index for faster queries
CREATE INDEX idx_goals_member_month ON goals(member_id, month);

-- Add RLS policies (Row Level Security)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can customize this later)
CREATE POLICY "Enable all access for goals" ON goals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create work_schedules table for storing member work schedules
CREATE TABLE IF NOT EXISTS work_schedules (
  id SERIAL PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning TEXT,
  afternoon TEXT,
  evening TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- Enable Row Level Security
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no authentication is needed)
CREATE POLICY "Allow all operations on work_schedules" ON work_schedules FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_schedules_member_date ON work_schedules(member_id, date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_member_id ON work_schedules(member_id);

-- Create trigger for updated_at
CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON work_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE work_schedules IS 'Stores daily work schedules for members with morning, afternoon, and evening activity codes';
COMMENT ON COLUMN work_schedules.morning IS 'Activity code for morning session (e.g., 101, 102, 201)';
COMMENT ON COLUMN work_schedules.afternoon IS 'Activity code for afternoon session';
COMMENT ON COLUMN work_schedules.evening IS 'Activity code for evening session';
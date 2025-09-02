-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  date DATE NOT NULL,
  activities JSONB NOT NULL DEFAULT '{}',
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- Insert default members
INSERT INTO members (id, name) VALUES
  ('1', 'Vũ Huy Điệp'),
  ('2', 'Vũ Quang Minh'),
  ('3', 'Bùi Hồng Dương'),
  ('4', 'Hoàng Văn Đào'),
  ('5', 'Nguyễn Tiến Đạt'),
  ('6', 'Vương Văn Chính'),
  ('7', 'Ninh Văn Thành'),
  ('8', 'Ngô Ngọc Phúc'),
  ('9', 'Trương Đình Đạt'),
  ('10', 'Vũ Văn Bảng'),
  ('11', 'Nguyễn Ngọc Khanh'),
  ('12', 'Lê Trung Kiên'),
  ('13', 'Nguyễn Hồng Tam'),
  ('14', 'Đỗ Văn Thoại'),
  ('15', 'Nguyễn Văn Phương'),
  ('16', 'Lê Ngọc Trí'),
  ('17', 'Nguyễn Văn Khôi'),
  ('18', 'Khuất Thanh Duy'),
  ('19', 'Nguyễn Huy Công'),
  ('20', 'Nguyễn Văn Thắng'),
  ('21', 'Đỗ Long Thành'),
  ('22', 'Nguyễn Thái Ất')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is needed)
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on scores" ON scores FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_member_date ON scores(member_id, date);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
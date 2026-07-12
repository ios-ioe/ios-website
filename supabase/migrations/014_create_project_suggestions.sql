CREATE TABLE IF NOT EXISTS project_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,                         -- optional
  category TEXT NOT NULL,            -- required
  description TEXT NOT NULL,         -- required
  contact_info TEXT NOT NULL,        -- required (email / phone / discord etc.)
  status TEXT NOT NULL DEFAULT 'new', -- new | reviewed | building | declined
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a suggestion
CREATE POLICY "Public can submit project suggestions"
  ON project_suggestions FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read/update/delete
CREATE POLICY "Admins can view project suggestions"
  ON project_suggestions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update project suggestions"
  ON project_suggestions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete project suggestions"
  ON project_suggestions FOR DELETE
  USING (auth.role() = 'authenticated');
-- 1. Project status --------------------------------------------------------
CREATE TYPE project_status AS ENUM ('planning', 'ongoing', 'completed', 'on_hold');

ALTER TABLE projects
  ADD COLUMN status project_status NOT NULL DEFAULT 'ongoing';

-- (Public SELECT policy already covers the new column — no RLS change needed.)

-- 2. Join / apply applications ----------------------------------------------
-- Optional but recommended: keep a record of every application in the DB too,
-- even though the email itself is sent by Formspree client-side. Gives the
-- admin panel a "view applicants" screen and a backup if an email bounces.
CREATE TABLE IF NOT EXISTS join_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  faculty_or_role TEXT,
  interest_area TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new | reviewed | accepted | rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE join_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can submit an application
CREATE POLICY "Public can submit applications"
  ON join_applications FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read/update/delete applications
CREATE POLICY "Admins can view applications"
  ON join_applications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update applications"
  ON join_applications FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete applications"
  ON join_applications FOR DELETE
  USING (auth.role() = 'authenticated');

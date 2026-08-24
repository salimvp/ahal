-- ==========================================================
-- SSMO Institute of Teacher Education - Faculty Schema
-- Migration: 20260824000001_create_faculties.sql
-- ==========================================================

CREATE TABLE IF NOT EXISTS faculties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  qualification TEXT NOT NULL,
  expertise TEXT,
  department TEXT DEFAULT 'General',
  image_url TEXT,
  image_key TEXT,
  email TEXT,
  phone TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculties_active ON faculties(is_active, display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faculties_department ON faculties(department);

-- Enable RLS
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;

-- Public Read Policy
DROP POLICY IF EXISTS "Public can view active faculties" ON faculties;
CREATE POLICY "Public can view active faculties" ON faculties FOR SELECT USING (is_active = TRUE);

-- Service Role Full Access Policy
DROP POLICY IF EXISTS "Service role has full access to faculties" ON faculties;
CREATE POLICY "Service role has full access to faculties" ON faculties USING (TRUE) WITH CHECK (TRUE);

-- Seed Initial Faculties Data
INSERT INTO faculties (id, name, designation, qualification, expertise, department, image_url, display_order, is_active) VALUES
  ('fac-1', 'Shanavas Paravannur', 'Principal', 'M.Ed, M.Phil', 'Educational Leadership & Administration', 'Administration', '/principal.jpeg', 1, TRUE),
  ('fac-2', 'MK Bava Sahib', 'Manager', 'M.A, B.Ed', 'Institutional Management', 'Administration', '/manager.jpeg', 2, TRUE),
  ('fac-3', 'Dr. A. Basheer', 'Senior Lecturer, Pedagogy', 'M.Ed, Ph.D', 'Child Psychology & Curriculum Design', 'Pedagogy', '/principal.jpeg', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

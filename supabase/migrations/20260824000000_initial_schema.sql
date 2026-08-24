-- ==========================================================
-- SSMO Institute of Teacher Education - Supabase Schema
-- Migration: 20260824000000_initial_schema.sql
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  content TEXT,
  category TEXT DEFAULT 'Notices',
  badge TEXT DEFAULT 'NEW',
  link TEXT,
  image_key TEXT,
  attachment_key TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);

-- 3. Gallery Albums Table
CREATE TABLE IF NOT EXISTS gallery_albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  category TEXT DEFAULT 'Campus',
  cover_image_url TEXT,
  cover_image_key TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_published ON gallery_albums(is_published, display_order ASC, created_at DESC);

-- 4. Gallery Photos Table (With Album Foreign Key & Cascade Delete)
CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  album_id TEXT REFERENCES gallery_albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Campus',
  image_url TEXT NOT NULL,
  image_key TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_published ON gallery_photos(is_published, display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_category ON gallery_photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_album ON gallery_photos(album_id);

-- 5. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT DEFAULT 'Academic',
  year TEXT DEFAULT '2026',
  image_url TEXT,
  image_key TEXT,
  rank_badge TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_published ON achievements(is_published, display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- 6. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT DEFAULT 'General Query',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  is_read BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status, is_read, created_at DESC);

-- 7. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- Enable Row Level Security (RLS) & Policies
-- ==========================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public can view active announcements" ON announcements;
CREATE POLICY "Public can view active announcements" ON announcements FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view published albums" ON gallery_albums;
CREATE POLICY "Public can view published albums" ON gallery_albums FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public can view published photos" ON gallery_photos;
CREATE POLICY "Public can view published photos" ON gallery_photos FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public can view published achievements" ON achievements;
CREATE POLICY "Public can view published achievements" ON achievements FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can submit enquiries" ON enquiries;
CREATE POLICY "Public can submit enquiries" ON enquiries FOR INSERT WITH CHECK (TRUE);

-- Service Role Full Access Policies
DROP POLICY IF EXISTS "Service role has full access to announcements" ON announcements;
CREATE POLICY "Service role has full access to announcements" ON announcements USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to gallery_albums" ON gallery_albums;
CREATE POLICY "Service role has full access to gallery_albums" ON gallery_albums USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to gallery_photos" ON gallery_photos;
CREATE POLICY "Service role has full access to gallery_photos" ON gallery_photos USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to achievements" ON achievements;
CREATE POLICY "Service role has full access to achievements" ON achievements USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to enquiries" ON enquiries;
CREATE POLICY "Service role has full access to enquiries" ON enquiries USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to settings" ON settings;
CREATE POLICY "Service role has full access to settings" ON settings USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role has full access to admins" ON admins;
CREATE POLICY "Service role has full access to admins" ON admins USING (TRUE) WITH CHECK (TRUE);

-- ==========================================================
-- Storage Bucket Setup
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ssmo-assets', 'ssmo-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Public Read Policy
DROP POLICY IF EXISTS "Public can read ssmo-assets storage" ON storage.objects;
CREATE POLICY "Public can read ssmo-assets storage" ON storage.objects FOR SELECT USING (bucket_id = 'ssmo-assets');

DROP POLICY IF EXISTS "Service role can manage ssmo-assets storage" ON storage.objects;
CREATE POLICY "Service role can manage ssmo-assets storage" ON storage.objects USING (bucket_id = 'ssmo-assets') WITH CHECK (bucket_id = 'ssmo-assets');

-- ==========================================================
-- Seed Data
-- ==========================================================

INSERT INTO settings (key, value) VALUES
  ('tagline', 'Learn With Passion, Live With Purpose'),
  ('principal_name', 'Shanavas Paravannur'),
  ('principal_qualification', 'M.Ed., NET'),
  ('principal_designation', 'Principal, SSMO ITE Tirurangadi'),
  ('principal_image', '/principal.jpeg'),
  ('principal_message', 'Welcome to SSMO Institute of Teacher Education. For six decades, we have prepared educators who not only excel in primary pedagogy but also nurture the moral compass of the next generation. Our teacher trainees graduate with rigorous instructional practice, child psychology mastery, and a profound sense of social duty.'),
  ('manager_name', 'MK Bava Sahib'),
  ('manager_qualification', 'President'),
  ('manager_designation', 'Manager, Tirurangadi Muslim Orphanage Committee'),
  ('manager_image', '/manager.jpeg'),
  ('manager_message', 'The founding mission of the Tirurangadi Muslim Orphanage Committee is anchored in empowering society through high-quality, value-based education. ITE remains a jewel in our institutional network, continuing to provide state-of-the-art facilities, dedicated faculty, and student support to ensure excellence in teacher education.'),
  ('contact_phone', '+91 494 2460300'),
  ('contact_email', 'ssmottitirurangadi@gmail.com'),
  ('contact_address', 'Saudabad, Tirurangadi, Malappuram District, Kerala - 676306, India'),
  ('google_map_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.60155252877!2d75.9220002!3d11.0270002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64e43b18c6449%3A0xa64b3dfba5b0f47e!2sTirurangadi%20Muslim%20Orphanage%2C%20Saudabad%2C%20Tirurangadi%2C%20Kerala%20676306!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin')
ON CONFLICT (key) DO NOTHING;

INSERT INTO announcements (id, title, slug, content, category, badge, link, is_pinned, is_active, created_at) VALUES
  ('ann-1', 'D.El.Ed Admission Notification 2026-2028 Batch Open for Registration', 'deled-admission-2026-2028', 'Applications are invited from eligible candidates for admission to the two-year Diploma in Elementary Education (D.El.Ed) course for the academic session 2026-2028. Minimum qualification: Plus Two with 50% aggregate marks.', 'Admissions', 'IMPORTANT', '', TRUE, TRUE, '2026-08-01 10:00:00+00'),
  ('ann-2', 'First Year D.El.Ed Board Examination Timetable Released by Pareeksha Bhavan', 'first-year-deled-exam-timetable', 'Kerala Pareeksha Bhavan has published the final timetable for the First Year D.El.Ed curriculum examinations. Candidates can view dates and instructions on the Pareeksha Bhavan official portal.', 'Examinations', 'EXAM', 'https://pareekshabhavan.kerala.gov.in', TRUE, TRUE, '2026-08-10 11:30:00+00'),
  ('ann-3', 'School Internship Phase II Orientation for Second Year Teacher Trainees', 'school-internship-phase-2-orientation', 'All second-year teacher trainees are informed that the Phase II school internship orientation will commence at the Main Seminar Hall. Attendance is mandatory for lesson plan approval.', 'Academic', 'NEW', '', FALSE, TRUE, '2026-08-15 09:00:00+00'),
  ('ann-4', 'Annual Arts & Literary Fest "TARANG 2026" Schedule and Registration', 'annual-arts-fest-tarang-2026', 'The annual college cultural and literary festival TARANG 2026 will be held next month. Department coordinators are requested to submit participant lists by the end of the week.', 'Events', 'LATEST', '', FALSE, TRUE, '2026-08-18 14:00:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO achievements (id, title, subtitle, description, category, year, image_url, rank_badge, display_order, is_published, created_at) VALUES
  ('ach-1', '100% Pass in Kerala D.El.Ed Board Exam', '10th Consecutive Academic Year', 'Continuing our legacy of instructional distinction with 100% pass results in Kerala Pareeksha Bhavan board examinations.', 'Academic', '2025', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', '100% Pass', 1, TRUE, '2026-01-10 10:00:00+00'),
  ('ach-2', 'State Level Pedagogy Innovation Award', 'Kerala Council for Educational Research', 'Recognized for pioneering interactive TLM (Teaching Learning Material) methodologies for upper primary Malayalam & Mathematics.', 'Pedagogy', '2025', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop', 'State Award', 2, TRUE, '2026-02-15 10:00:00+00'),
  ('ach-3', 'Over 5,000 Teacher Alumni Placed in Schools', 'Across Kerala & GCC Educational Networks', 'Our alumni educators lead classrooms in Government, Aided, and premier private institutions across India and abroad.', 'Institutional', '2024', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop', '5000+ Alumni', 3, TRUE, '2026-03-01 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gallery_photos (id, title, category, image_url, description, display_order, is_published, created_at) VALUES
  ('gal-1', 'Smart Classroom Micro-Teaching Session', 'Academic', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop', 'Trainees conducting peer micro-teaching using interactive digital displays.', 1, TRUE, '2026-04-01 10:00:00+00'),
  ('gal-2', 'Historic Saudabad Campus Quadrangle', 'Campus', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop', 'The serene, heritage courtyard of the Tirurangadi educational campus.', 2, TRUE, '2026-04-05 10:00:00+00'),
  ('gal-3', 'TLM Workshop & Teaching Aid Exhibition', 'Academic', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop', 'Hands-on preparation of low-cost teaching learning materials.', 3, TRUE, '2026-04-10 10:00:00+00'),
  ('gal-4', 'Annual Sports & Athletic Meet', 'Arts & Sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop', 'Teacher trainees demonstrating athletic spirit on the campus grounds.', 4, TRUE, '2026-04-15 10:00:00+00'),
  ('gal-5', 'Community School Internship Program', 'Internship', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop', 'Practical teaching practice sessions in local elementary schools.', 5, TRUE, '2026-04-20 10:00:00+00'),
  ('gal-6', 'Campus Library & Reference Section', 'Campus', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop', 'Curriculum research and lesson planning at the institution library.', 6, TRUE, '2026-04-25 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

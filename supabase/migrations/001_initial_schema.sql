-- Kukatonon Database Schema
-- Liberian Civil War Victims Memorial App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORIES TABLE
-- ============================================
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) <= 140),
  slug TEXT NOT NULL,
  honoree_name TEXT NOT NULL CHECK (char_length(honoree_name) <= 120),
  summary TEXT,
  content_html TEXT CHECK (content_html IS NULL OR char_length(content_html) <= 20000),
  youtube_urls JSONB DEFAULT '[]'::jsonb,
  media_items JSONB DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  source_type TEXT NOT NULL CHECK (source_type IN ('admin', 'public_submission')),
  submitted_by_name TEXT,
  submitted_by_phone TEXT,
  submitted_by_whatsapp TEXT,
  submitted_by_email TEXT,
  consent_confirmed BOOLEAN DEFAULT false,
  review_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for public queries
CREATE INDEX idx_stories_status ON stories (status);
CREATE INDEX idx_stories_featured ON stories (is_featured) WHERE is_featured = true;
CREATE INDEX idx_stories_slug ON stories (slug);
CREATE INDEX idx_stories_created ON stories (created_at DESC);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX idx_audit_log_target ON audit_log (target_type, target_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PUBLIC STORIES VIEW (no contact info)
-- ============================================
CREATE VIEW public_stories AS
SELECT
  id, title, slug, honoree_name, summary, content_html,
  youtube_urls, media_items, cover_image_url,
  status, is_featured, source_type,
  submitted_by_name,
  created_at, updated_at
FROM stories
WHERE status = 'approved';

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STORIES POLICIES

-- Public can view approved stories (limited columns via API, but RLS filters rows)
CREATE POLICY "Public can view approved stories"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Public can submit stories
CREATE POLICY "Public can submit stories"
  ON stories FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND source_type = 'public_submission'
    AND consent_confirmed = true
  );

-- Admins can view all stories
CREATE POLICY "Admins can view all stories"
  ON stories FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update stories
CREATE POLICY "Admins can update stories"
  ON stories FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert stories directly
CREATE POLICY "Admins can create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()) AND source_type = 'admin');

-- Admins can delete stories
CREATE POLICY "Admins can delete stories"
  ON stories FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ADMINS POLICIES

-- Admins can view admin list
CREATE POLICY "Admins can view admins"
  ON admins FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- AUDIT LOG POLICIES

-- Admins can view audit log
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert audit log entries
CREATE POLICY "Admins can insert audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Service role can always insert audit logs (for API routes)
CREATE POLICY "Service role audit log"
  ON audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT DO NOTHING;

-- Public can read media
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow anonymous uploads (for public submissions)
CREATE POLICY "Anonymous can upload media"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'media');

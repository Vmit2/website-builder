-- Migration: Create user_content table for inline CMS editor
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  theme_name varchar NOT NULL,
  content_json jsonb DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, site_id, theme_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_site_id ON user_content(site_id);
CREATE INDEX IF NOT EXISTS idx_user_content_theme_name ON user_content(theme_name);
CREATE INDEX IF NOT EXISTS idx_user_content_last_updated ON user_content(last_updated);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_content_timestamp
  BEFORE UPDATE ON user_content
  FOR EACH ROW
  EXECUTE FUNCTION update_user_content_updated_at();

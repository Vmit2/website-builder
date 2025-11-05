-- Create user_site_settings table for design customizations
CREATE TABLE IF NOT EXISTS user_site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  font_family varchar DEFAULT 'Poppins',
  color_palette jsonb DEFAULT '{}',
  logo_url varchar,
  seo_title varchar,
  seo_description text,
  seo_keywords text[],
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_user_site_settings_user_id ON user_site_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_site_settings_site_id ON user_site_settings(site_id);

ALTER TABLE user_site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own site settings"
  ON user_site_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own site settings"
  ON user_site_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own site settings"
  ON user_site_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

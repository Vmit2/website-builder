-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar NOT NULL UNIQUE,
  username varchar NOT NULL UNIQUE,
  password_hash varchar,
  full_name varchar,
  avatar_url varchar,
  role varchar DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sites (Portfolios) table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username varchar NOT NULL UNIQUE,
  theme_slug varchar NOT NULL,
  palette_id varchar,
  status varchar DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  coming_soon boolean DEFAULT true,
  launch_time timestamptz,
  expires_at timestamptz, -- 24-hour trial expiry timestamp
  content jsonb DEFAULT '{}',
  images jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
  id serial PRIMARY KEY,
  slug varchar UNIQUE NOT NULL,
  name varchar NOT NULL,
  description text,
  demo_url varchar,
  preview_image_url varchar,
  coming_soon boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Image Library table
CREATE TABLE IF NOT EXISTS image_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id integer REFERENCES themes(id) ON DELETE CASCADE,
  url varchar NOT NULL,
  alt_text varchar,
  category varchar,
  created_at timestamptz DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id serial PRIMARY KEY,
  slug varchar UNIQUE NOT NULL,
  name varchar NOT NULL,
  description text,
  price_cents integer NOT NULL,
  interval varchar CHECK (interval IN ('one_time', 'monthly')),
  features jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  plan_id integer REFERENCES plans(id),
  razorpay_subscription_id varchar,
  status varchar CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar NOT NULL,
  resource_type varchar,
  resource_id varchar,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Inactive Users table (for trial expiry retention - 6 months)
CREATE TABLE IF NOT EXISTS inactive_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar NOT NULL,
  email varchar NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  trial_expired_at timestamptz NOT NULL,
  data_json jsonb DEFAULT '{}', -- Store site content, theme, etc. for retargeting
  retention_until timestamptz NOT NULL, -- 6 months from expiry
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_username ON sites(username);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_site_id ON subscriptions(site_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_image_library_theme_id ON image_library(theme_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sites_expires_at ON sites(expires_at);

-- Create indexes for inactive_users
CREATE INDEX IF NOT EXISTS idx_inactive_users_retention_until ON inactive_users(retention_until);
CREATE INDEX IF NOT EXISTS idx_inactive_users_username ON inactive_users(username);

-- Insert default themes
INSERT INTO themes (slug, name, description, demo_url) VALUES
  ('minimal-creative', 'Minimal Creative', 'Clean, whitespace-driven for designers', '/themes/minimal-creative/demo'),
  ('visual-grid', 'Visual Grid', 'Photography-first grid layout for models/photogs', '/themes/visual-grid/demo'),
  ('bold-portfolio', 'Bold Portfolio', 'Large hero, bold type for influencers', '/themes/bold-portfolio/demo'),
  ('fitness-pro', 'Fitness Pro', 'Energetic, CTA focused for trainers', '/themes/fitness-pro/demo'),
  ('lifestyle-blog', 'Lifestyle Blog', 'Blog + feed emphasis', '/themes/lifestyle-blog/demo'),
  ('music-stage', 'Music Stage', 'Dark, media heavy for musicians', '/themes/music-stage/demo'),
  ('tech-personal', 'Tech Personal', 'Developer portfolio, project tiles', '/themes/tech-personal/demo'),
  ('beauty-studio', 'Beauty Studio', 'Feminine palette for makeup artists', '/themes/beauty-studio/demo'),
  ('travel-log', 'Travel Log', 'Map + itinerary sections', '/themes/travel-log/demo'),
  ('ecommerce-lite', 'E-commerce Lite', 'Simple products + contact', '/themes/ecommerce-lite/demo')
ON CONFLICT (slug) DO NOTHING;

-- Insert default plans
INSERT INTO plans (slug, name, description, price_cents, interval, features) VALUES
  ('basic', 'Basic', 'One-time static portfolio', 199900, 'one_time', '["3 sections", "No custom domain", "Freemium images only"]'),
  ('pro', 'Pro', 'Monthly subscription with custom domain', 69900, 'monthly', '["Custom domain", "Pro email", "Brand kit", "Blogging", "Booking form", "Analytics"]'),
  ('premium', 'Premium', 'Premium features and support', 149900, 'monthly', '["Everything in Pro", "Premium animations", "SEO onboarding", "Content credits", "Priority support"]')
ON CONFLICT (slug) DO NOTHING;

-- Sample image library (to be populated with actual images)
-- This is a placeholder structure
INSERT INTO image_library (theme_id, url, alt_text, category) VALUES
  (1, 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500', 'Hero image 1', 'hero'),
  (1, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500', 'Hero image 2', 'hero'),
  (2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500', 'Portfolio image 1', 'gallery'),
  (2, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500', 'Portfolio image 2', 'gallery')
ON CONFLICT DO NOTHING;

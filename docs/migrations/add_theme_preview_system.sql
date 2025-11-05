-- Migration: Add Theme Preview & Live Editing System
-- Run this in Supabase SQL Editor

-- Step 1: Add draft and published content fields to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS draft_content_json jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS published_content_json jsonb DEFAULT '{}';

-- Step 2: Add plan field to sites table (if not exists)
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS plan varchar DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro'));

-- Step 3: Add json_config field to themes table for theme.json storage
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS json_config jsonb DEFAULT '{}';

-- Step 4: Create user_customization table for storing user's theme customizations
CREATE TABLE IF NOT EXISTS user_customization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  palette_json jsonb DEFAULT '{}',
  images_used jsonb DEFAULT '[]',
  layout_modifications jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id)
);

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_customization_site_id ON user_customization(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_plan ON sites(plan);

-- Step 6: Update existing sites to have default plan
UPDATE sites 
SET plan = 'free' 
WHERE plan IS NULL;

-- Migration: Add coming_soon field to themes table
-- Run this in Supabase SQL Editor to add coming_soon support

ALTER TABLE themes
ADD COLUMN IF NOT EXISTS coming_soon boolean DEFAULT false;

-- Update existing themes to be available (not coming soon)
UPDATE themes
SET coming_soon = false
WHERE coming_soon IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_themes_coming_soon ON themes(coming_soon);

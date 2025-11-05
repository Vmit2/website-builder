-- Migration: Add Trial Expiry Fields
-- Run this in Supabase SQL Editor to add trial expiry functionality

-- Step 1: Add expires_at column to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Step 2: Create inactive_users table for 6-month retention
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_expires_at ON sites(expires_at);
CREATE INDEX IF NOT EXISTS idx_inactive_users_retention_until ON inactive_users(retention_until);
CREATE INDEX IF NOT EXISTS idx_inactive_users_username ON inactive_users(username);

-- Step 4: Optional - Update existing sites without expires_at to have a default expiry
-- This sets expires_at to 24 hours from created_at for existing pending sites
UPDATE sites 
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL 
  AND status IN ('pending', 'rejected')
  AND created_at IS NOT NULL;

-- Verification query (run to check if migration succeeded)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'sites' AND column_name = 'expires_at';

-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'inactive_users';


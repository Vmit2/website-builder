-- Migration: Add Email Reminder Fields
-- Run this in Supabase SQL Editor to add email reminder tracking

-- Step 1: Add reminder tracking columns to sites table
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS expired_email_sent boolean DEFAULT false;

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_reminder_sent ON sites(reminder_sent) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_sites_expired_email_sent ON sites(expired_email_sent) WHERE expired_email_sent = false;
CREATE INDEX IF NOT EXISTS idx_sites_status_expires_at ON sites(status, expires_at) WHERE status IN ('pending', 'trial');

-- Step 3: Update existing sites to have default values
UPDATE sites
SET reminder_sent = false, expired_email_sent = false
WHERE reminder_sent IS NULL OR expired_email_sent IS NULL;

-- Verification query (run to check if migration succeeded)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'sites' 
--   AND column_name IN ('reminder_sent', 'expired_email_sent');

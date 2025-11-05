-- Migration: Add Email Verification and reCAPTCHA Fields
-- Run this in Supabase SQL Editor to add email verification functionality

-- Step 1: Add email verification fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS otp_code text,
ADD COLUMN IF NOT EXISTS otp_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS recaptcha_score float,
ADD COLUMN IF NOT EXISTS signup_stage varchar DEFAULT 'email_pending' CHECK (signup_stage IN ('email_pending', 'verified', 'trial_created'));

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_otp_expires_at ON users(otp_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_signup_stage ON users(signup_stage);

-- Step 3: Update existing users to have default signup_stage
UPDATE users
SET signup_stage = CASE
  WHEN email_verified IS NULL OR email_verified = false THEN 'email_pending'
  ELSE 'verified'
END
WHERE signup_stage IS NULL;

-- Verification query (run to check if migration succeeded)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
--   AND column_name IN ('email_verified', 'otp_code', 'otp_expires_at', 'recaptcha_score', 'signup_stage');

-- Migration: Add yearly pricing and highlighted field to plans table
-- Run this in Supabase SQL Editor

-- Step 1: Add yearly pricing column (nullable for one-time plans)
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS price_yearly_cents integer;

-- Step 2: Add highlighted column for "Most Popular" badge
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS highlighted boolean DEFAULT false;

-- Step 3: Add CTA label column
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS cta_label text DEFAULT 'Get Started';

-- Step 4: Update existing plans with yearly pricing (10 months price for yearly = ~17% discount)
-- Basic plan is one-time, so yearly doesn't apply
UPDATE plans
SET price_yearly_cents = CASE
  WHEN slug = 'pro' THEN 699000 -- 10 months of monthly price (₹699 * 10)
  WHEN slug = 'premium' THEN 1499000 -- 10 months of monthly price (₹1,499 * 10)
  ELSE NULL
END,
highlighted = CASE
  WHEN slug = 'pro' THEN true -- Mark Pro as "Most Popular"
  ELSE false
END,
cta_label = CASE
  WHEN slug = 'basic' THEN 'Start Free Trial'
  WHEN slug = 'pro' THEN 'Get Started'
  WHEN slug = 'premium' THEN 'Go Premium'
  ELSE 'Get Started'
END
WHERE slug IN ('basic', 'pro', 'premium');

-- Step 5: Create index for highlighted plans
CREATE INDEX IF NOT EXISTS idx_plans_highlighted ON plans(highlighted);

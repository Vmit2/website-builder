# Database Migration Guide - Trial Expiry Fields

## Problem
You're getting this error:
```
ERROR: 42703: column "expires_at" does not exist
```

This happens because the `sites` table doesn't have the `expires_at` column yet.

## Solution: Run Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migration Script

Copy and paste the entire contents of `docs/migrations/add_trial_expiry_fields.sql` into the SQL Editor and click **Run**.

**Or run these commands directly:**

```sql
-- Add expires_at column to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create inactive_users table for 6-month retention
CREATE TABLE IF NOT EXISTS inactive_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar NOT NULL,
  email varchar NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  trial_expired_at timestamptz NOT NULL,
  data_json jsonb DEFAULT '{}',
  retention_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_expires_at ON sites(expires_at);
CREATE INDEX IF NOT EXISTS idx_inactive_users_retention_until ON inactive_users(retention_until);
CREATE INDEX IF NOT EXISTS idx_inactive_users_username ON inactive_users(username);

-- Optional: Update existing sites without expires_at
UPDATE sites 
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL 
  AND status IN ('pending', 'rejected')
  AND created_at IS NOT NULL;
```

### Step 3: Verify Migration

Run this query to verify the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sites' AND column_name = 'expires_at';
```

You should see:
```
column_name | data_type
------------|----------
expires_at  | timestamp with time zone
```

And verify the inactive_users table exists:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'inactive_users';
```

You should see:
```
table_name
-----------
inactive_users
```

### Step 4: Restart Your Dev Server

After running the migration:

1. Stop your Next.js dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. The error should be resolved!

## What This Migration Does

1. **Adds `expires_at` column** to `sites` table for 24-hour trial expiry tracking
2. **Creates `inactive_users` table** for storing expired trial data for 6 months (retargeting)
3. **Adds indexes** for better query performance
4. **Optionally updates existing sites** to have a default expiry date (24 hours from creation)

## Troubleshooting

### Error: "relation already exists"
- This means the `inactive_users` table already exists. The migration uses `IF NOT EXISTS`, so this is safe to ignore.

### Error: "column already exists"
- This means `expires_at` already exists. The migration uses `IF NOT EXISTS`, so this is safe to ignore.

### Still getting errors?
- Make sure you ran the migration in the correct Supabase project
- Check that you're connected to the right database
- Restart your dev server after running the migration

## Next Steps

After migration succeeds:
1. ✅ Restart dev server
2. ✅ Test signup flow - new sites should have `expires_at` set
3. ✅ Test trial expiry - visit an expired site to see redirect
4. ✅ Set up CRON job for cleanup (see `TRIAL_SYSTEM_IMPLEMENTATION.md`)


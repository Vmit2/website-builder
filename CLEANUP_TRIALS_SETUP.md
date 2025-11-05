# Cleanup Trials Edge Function - Setup Guide

## 🎯 Overview

Automated cleanup function that runs every 6 hours to:
- Find expired trial sites older than 48 hours
- Move them to `inactive_users` table (6-month retention for retargeting)
- Delete site records
- Clean up storage/deployments (if applicable)
- Log cleanup actions

---

## 📋 Prerequisites

1. ✅ Supabase project with database schema
2. ✅ `sites` table with `expires_at` and `status` columns
3. ✅ `inactive_users` table created (for retention)

---

## 🗄️ Database Requirements

The function expects:

### Sites Table
- `id` (uuid)
- `username` (varchar) - subdomain name
- `expires_at` (timestamptz) - expiry timestamp
- `status` (varchar) - must be 'expired' for cleanup
- `user_id` (uuid) - foreign key to users
- `content` (jsonb) - site content to preserve
- `theme_slug` (varchar) - theme used

### Inactive Users Table
- Already exists from trial expiry migration
- Stores expired trial data for 6 months

---

## 🚀 Step 1: Deploy Edge Function

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **Edge Functions** in the left sidebar

2. **Create New Function**
   - Click **Create a new function**
   - Function name: `cleanup-trials`
   - Click **Create**

3. **Upload Function Code**
   - Replace the default code with contents from `supabase/functions/cleanup-trials/index.ts`
   - Click **Deploy**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy cleanup-trials
```

---

## 🔐 Step 2: Set Environment Variables

1. **Go to Supabase Dashboard**
   - Navigate to **Edge Functions** → **Settings**
   - Or go to **Project Settings** → **Edge Functions**

2. **Add Environment Variables** (if not already set)

   | Variable | Value | Source |
   |----------|-------|--------|
   | `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Settings → API (service_role) |

   **Note**: These should already be set if you deployed `check-trials` function.

3. **Save Changes**

---

## ⏰ Step 3: Setup Supabase Scheduler

1. **Go to Supabase Dashboard**
   - Navigate to **Edge Functions** → **Scheduler**
   - Or go to **Database** → **Scheduler**

2. **Create New Scheduled Job**

   - **Function**: `cleanup-trials`
   - **Cron Expression**: `0 */6 * * *` (runs every 6 hours at minute 0)
   - **Description**: "Clean up expired trial sites older than 48 hours"

3. **Alternative Cron Patterns:**

   | Pattern | Frequency | Use Case |
   |---------|-----------|----------|
   | `0 */6 * * *` | Every 6 hours | Recommended |
   | `0 2 * * *` | Once daily at 2 AM | Lower frequency |
   | `0 */12 * * *` | Every 12 hours | Balanced |

4. **Save the Scheduled Job**

---

## 🧪 Step 4: Test the Function

### Manual Test (via Dashboard)

1. **Create a Test Expired Site**

   ```sql
   -- Run in Supabase SQL Editor
   UPDATE sites
   SET expires_at = NOW() - INTERVAL '50 hours',
       status = 'expired'
   WHERE username = 'your-test-username';
   ```

2. **Invoke Function Manually**

   - Go to **Edge Functions** → `cleanup-trials`
   - Click **Invoke** button
   - Check the logs for execution results

3. **Verify Cleanup**

   ```sql
   -- Check if site was deleted
   SELECT * FROM sites WHERE username = 'your-test-username';
   -- Should return no rows

   -- Check if moved to inactive_users
   SELECT * FROM inactive_users WHERE username = 'your-test-username';
   -- Should return the record
   ```

---

## 📊 Step 5: Monitor Function Execution

### View Function Logs

1. Go to **Edge Functions** → `cleanup-trials`
2. Click **Logs** tab
3. View execution history and errors

### Check Cleanup Statistics

The function returns statistics:

```json
{
  "success": true,
  "message": "Processed 5 expired trials...",
  "stats": {
    "processed": 5,
    "movedToInactive": 5,
    "deleted": 5,
    "storageCleaned": 0,
    "errors": []
  }
}
```

---

## ✅ Verification Checklist

- [ ] Edge Function `cleanup-trials` created and deployed
- [ ] Environment variables set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Scheduled job created with cron: `0 */6 * * *`
- [ ] Test cleanup executed successfully
- [ ] Sites moved to `inactive_users` table
- [ ] Site records deleted from `sites` table
- [ ] Function logs show successful execution

---

## 🔧 Configuration Options

### Storage Bucket Name

If you use Supabase Storage for static site builds, update the bucket name:

```typescript
// In cleanup-trials/index.ts
const storageBucket = 'trial-sites'; // Change to your bucket name
```

### Retention Period

The retention period is **6 months** by default. To change it:

```typescript
// In cleanup-trials/index.ts
const retentionUntil = new Date(expiryDate);
retentionUntil.setMonth(retentionUntil.getMonth() + 6); // Change 6 to desired months
```

### Cleanup Age Threshold

The function cleans up sites older than **48 hours**. To change:

```typescript
// In cleanup-trials/index.ts
const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
// Change 48 to desired hours
```

---

## 🔧 Troubleshooting

### Function Fails with "Missing environment variables"

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart the function after adding variables

### Sites Not Being Cleaned Up

**Check:**
1. Sites have `status = 'expired'`
2. Sites have `expires_at` older than 48 hours
3. Function logs for specific errors

### Storage Cleanup Errors

**Note:**
- Storage cleanup is **optional** - errors are logged but don't fail the function
- If you don't use storage for static builds, these warnings can be ignored

### Foreign Key Constraint Errors

**Check:**
1. `inactive_users` table exists
2. Foreign key relationship between `sites` and `users` is correct
3. User records exist for all sites

---

## 📈 Function Flow

```
1. Query expired sites (> 48 hours old, status = 'expired')
   ↓
2. For each site:
   ├─ Move to inactive_users (6-month retention)
   ├─ Clean up storage (optional)
   ├─ Log to audit_logs (optional)
   └─ Delete site record
   ↓
3. Return statistics
```

---

## 🎯 Integration with Other Functions

This function works alongside:

1. **`check-trials`** - Marks sites as expired after 24h
2. **Email reminders** - Sends expiry notifications

**Complete Flow:**
```
24h: check-trials marks site as 'expired' → Email sent
48h: cleanup-trials runs → Site moved to inactive_users → Site deleted
6 months: Retention period ends (manual cleanup of inactive_users)
```

---

## 🚀 Advanced: Cloudflare Subdomain Cleanup

To remove subdomain DNS records, add Cloudflare API integration:

```typescript
// Optional: Add to cleanup-trials/index.ts
async function removeSubdomainMapping(subdomain: string) {
  const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
  const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    return; // Skip if not configured
  }
  
  // Delete DNS record via Cloudflare API
  // Implementation depends on your DNS setup
}
```

---

## 📝 Cost Estimates

### Supabase
- **Edge Functions**: Free tier includes 500,000 invocations/month
- **Scheduler**: Included with Supabase Pro plan (or free with usage limits)

**Estimated Usage:**
- Runs 4 times/day (every 6 hours) = ~120 invocations/month = **FREE** ✅

---

## ✅ Next Steps

1. ✅ Deploy function and schedule
2. ✅ Monitor first few executions
3. ✅ Verify cleanup is working correctly
4. ✅ Optional: Add Cloudflare DNS cleanup
5. ✅ Optional: Add email notifications for cleanup summary

---

**Status:** ✅ Ready for deployment

**Last Updated:** [Current Date]

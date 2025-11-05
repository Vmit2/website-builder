# Email Reminder System Setup Guide

## 🎯 Overview

Automated email reminders for free trial websites that:
- Send a **3-hour warning** email before trial expiry
- Send an **expiry notification** email after trial expires
- Runs **100% on Supabase** using Edge Functions + Scheduler

---

## 📋 Prerequisites

1. ✅ Supabase project with database schema
2. ✅ Resend API account (free tier: 3,000 emails/month)
3. ✅ Supabase CLI installed (optional, for local testing)

---

## 🗄️ Step 1: Database Migration

Add reminder tracking fields to the `sites` table.

### Run in Supabase SQL Editor:

```sql
-- Add reminder tracking columns
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS expired_email_sent boolean DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_reminder_sent ON sites(reminder_sent) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_sites_expired_email_sent ON sites(expired_email_sent) WHERE expired_email_sent = false;
CREATE INDEX IF NOT EXISTS idx_sites_status_expires_at ON sites(status, expires_at) WHERE status IN ('pending', 'trial');

-- Update existing sites
UPDATE sites
SET reminder_sent = false, expired_email_sent = false
WHERE reminder_sent IS NULL OR expired_email_sent IS NULL;
```

**Or use the migration file:**
- Copy contents of `docs/migrations/add_email_reminder_fields.sql`
- Paste into Supabase SQL Editor
- Click **Run**

---

## 🔑 Step 2: Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account (or log in)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name: "Supabase Trial Reminders"
6. Copy the API key (starts with `re_...`)

⚠️ **Important**: Save this key securely - you'll need it in the next step.

---

## 📦 Step 3: Create Supabase Edge Function

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **Edge Functions** in the left sidebar

2. **Create New Function**
   - Click **Create a new function**
   - Function name: `check-trials`
   - Click **Create**

3. **Upload Function Code**
   - Replace the default code with contents from `supabase/functions/check-trials/index.ts`
   - Click **Deploy**

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy check-trials
```

---

## 🔐 Step 4: Set Environment Variables

1. **Go to Supabase Dashboard**
   - Navigate to **Edge Functions** → **Settings**
   - Or go to **Project Settings** → **Edge Functions**

2. **Add Environment Variables**

   | Variable | Value | Source |
   |----------|-------|--------|
   | `RESEND_API_KEY` | `re_...` | Resend dashboard |
   | `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Settings → API (service_role) |

3. **Save Changes**

   These environment variables will be available to the Edge Function at runtime.

---

## ⏰ Step 5: Setup Supabase Scheduler

1. **Go to Supabase Dashboard**
   - Navigate to **Edge Functions** → **Scheduler**
   - Or go to **Database** → **Scheduler** (depending on your Supabase version)

2. **Create New Scheduled Job**

   - **Function**: `check-trials`
   - **Cron Expression**: `0 * * * *` (runs every hour at minute 0)
   - **Description**: "Check for expiring trials and send email reminders"

3. **Alternative Cron Patterns:**

   | Pattern | Frequency | Use Case |
   |---------|-----------|----------|
   | `0 * * * *` | Every hour | Recommended |
   | `*/15 * * * *` | Every 15 minutes | For testing |
   | `0 9,15,21 * * *` | 3 times daily (9am, 3pm, 9pm) | Lower frequency |

4. **Save the Scheduled Job**

---

## 🧪 Step 6: Test the Function

### Manual Test (via Dashboard)

1. Go to **Edge Functions** → `check-trials`
2. Click **Invoke** button
3. Check the logs for execution results
4. Verify emails were sent

### Test with a Real Trial Site

1. **Create a test site** with expiry in 30 minutes:
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE sites
   SET expires_at = NOW() + INTERVAL '30 minutes',
       reminder_sent = false,
       status = 'pending'
   WHERE username = 'your-test-username';
   ```

2. **Manually invoke the function** (or wait for next scheduled run)

3. **Check your email** - you should receive the reminder email

4. **Verify database flags updated**:
   ```sql
   SELECT username, reminder_sent, expires_at
   FROM sites
   WHERE username = 'your-test-username';
   ```

---

## 📊 Step 7: Monitor Function Execution

### View Function Logs

1. Go to **Edge Functions** → `check-trials`
2. Click **Logs** tab
3. View execution history and errors

### Check Scheduled Jobs

1. Go to **Database** → **Scheduler**
2. View job execution history
3. Check for any failures

---

## ✅ Verification Checklist

- [ ] Migration ran successfully (fields added to `sites` table)
- [ ] Resend API key obtained and added to environment variables
- [ ] Edge Function `check-trials` created and deployed
- [ ] Environment variables set (RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Scheduled job created with cron: `0 * * * *`
- [ ] Test email sent successfully
- [ ] Database flags (`reminder_sent`, `expired_email_sent`) updating correctly

---

## 🔧 Troubleshooting

### Function Fails with "Missing environment variables"

**Solution:**
- Verify all 3 environment variables are set in Supabase Edge Functions settings
- Restart the function after adding variables

### Emails Not Sending

**Check:**
1. Resend API key is valid (test at https://resend.com/api-keys)
2. Resend account has email credits remaining
3. Email addresses in database are valid
4. Check function logs for specific errors

### Scheduler Not Running

**Check:**
1. Scheduler job is enabled (not paused)
2. Cron expression is correct
3. Function name matches exactly
4. Check Scheduler logs for errors

### Database Query Errors

**Check:**
1. Migration was run successfully
2. `reminder_sent` and `expired_email_sent` columns exist
3. Foreign key relationship between `sites` and `users` is correct

---

## 📧 Email Templates

The function includes two HTML email templates:

### 1. Expiring Reminder (3 hours before)
- **Subject**: "⚠️ Your free trial expires in X hours!"
- **Content**: Warning message with upgrade CTA
- **Triggers**: When `expires_at` is between now and 3 hours later

### 2. Expiry Notification (after expiry)
- **Subject**: "Your free trial has expired 😔"
- **Content**: Expiry notification with reactivation CTA
- **Triggers**: When `expires_at` is in the past

Both emails are fully responsive and include:
- Branded styling
- Clear CTAs
- Links to upgrade page and dashboard
- Professional footer

---

## 🚀 Advanced Configuration

### Custom Email Templates

Edit the HTML in `supabase/functions/check-trials/index.ts`:

```typescript
const emailHtml = `
  <!-- Your custom HTML template here -->
`;
```

### Change Reminder Timing

Modify the 3-hour window:

```typescript
// Change from 3 hours to 6 hours
const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
```

### Add Email Logging

Create an `email_logs` table to track all sent emails:

```sql
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id),
  email_type varchar, -- 'reminder' or 'expired'
  recipient_email varchar,
  sent_at timestamptz DEFAULT now(),
  success boolean,
  error_message text
);
```

---

## 📈 Cost Estimates

### Supabase
- **Edge Functions**: Free tier includes 500,000 invocations/month
- **Scheduler**: Included with Supabase Pro plan (or free with usage limits)

### Resend
- **Free Tier**: 3,000 emails/month
- **Paid Tier**: $20/month for 50,000 emails

**Estimated Monthly Cost:**
- 1,000 trials/month = ~2,000 emails (1 reminder + 1 expiry) = **FREE** ✅
- 10,000 trials/month = ~20,000 emails = **$20/month** 💰

---

## 📝 Next Steps

1. ✅ Monitor function execution for first few days
2. ✅ Adjust email templates based on user feedback
3. ✅ Set up email delivery tracking (optional)
4. ✅ Add A/B testing for email content (optional)
5. ✅ Implement email throttling if volume is high (optional)

---

**Status:** ✅ Ready for deployment

**Last Updated:** [Current Date]

# Email Reminder System - Quick Start

## 📋 What It Does

Automatically sends email reminders to users:
- **3 hours before** trial expires → "⚠️ Your trial expires soon!"
- **After trial expires** → "😔 Your trial has expired"

## ⚡ Quick Setup (5 Steps)

### 1. Run Database Migration

```sql
-- Copy and paste into Supabase SQL Editor
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS expired_email_sent boolean DEFAULT false;
```

### 2. Get Resend API Key

1. Sign up at https://resend.com
2. Go to API Keys → Create API Key
3. Copy the key (starts with `re_...`)

### 3. Deploy Edge Function

1. Go to Supabase Dashboard → Edge Functions
2. Create new function: `check-trials`
3. Copy code from `supabase/functions/check-trials/index.ts`
4. Deploy

### 4. Set Environment Variables

In Supabase → Edge Functions → Settings, add:

- `RESEND_API_KEY` = Your Resend API key
- `SUPABASE_URL` = Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

### 5. Schedule the Function

1. Go to Supabase → Edge Functions → Scheduler
2. Create job:
   - Function: `check-trials`
   - Cron: `0 * * * *` (every hour)

## ✅ Test It

```sql
-- Create test site expiring in 30 minutes
UPDATE sites
SET expires_at = NOW() + INTERVAL '30 minutes',
    reminder_sent = false
WHERE username = 'your-username';
```

Then manually invoke the function or wait for next scheduled run.

## 📚 Full Documentation

See `EMAIL_REMINDER_SETUP.md` for detailed instructions.

## 🆘 Troubleshooting

**Emails not sending?**
- Check Resend API key is valid
- Verify email addresses in database
- Check function logs for errors

**Function not running?**
- Verify scheduler is enabled
- Check cron expression is correct
- Review function logs

## 💰 Cost

- **Supabase**: Free (500K invocations/month)
- **Resend**: Free (3K emails/month)
- **Total**: **$0/month** for < 3K emails ✅

---

**Status:** ✅ Ready to deploy

---

## 🔗 Related Functions

- **`check-trials`** - Sends email reminders (3h before expiry, after expiry)
- **`cleanup-trials`** - Cleans up expired sites (>48h old) - See `CLEANUP_TRIALS_SETUP.md`

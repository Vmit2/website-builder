# Email Verification + reCAPTCHA Integration Setup Guide

## 🎯 Overview

This guide covers setting up email verification with OTP codes and Google reCAPTCHA v3 protection for the free trial signup flow.

---

## 📋 Prerequisites

1. ✅ Supabase project with database schema
2. ✅ Resend account for sending emails
3. ✅ Google reCAPTCHA v3 account
4. ✅ Environment variables configured

---

## 🗄️ Step 1: Database Migration

### Run Migration SQL

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run Migration Script**
   - Copy contents of `docs/migrations/add_email_verification_fields.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify Migration**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
     AND column_name IN ('email_verified', 'otp_code', 'otp_expires_at', 'recaptcha_score', 'signup_stage');
   ```

   You should see all 5 columns.

---

## 🔐 Step 2: Setup Google reCAPTCHA v3

### 2.1 Create reCAPTCHA Site

1. Go to https://www.google.com/recaptcha/admin/create
2. Fill in the form:
   - **Label**: Solvexx Forms
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - `at-solvexx.com`
     - `localhost` (for development)
   - **Owners**: Your email
3. Click **Submit**
4. Copy your **Site Key** and **Secret Key**

### 2.2 Add Environment Variables

Add to `.env.local`:
```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

---

## 📧 Step 3: Setup Resend Email

### 3.1 Create Resend Account

1. Go to https://resend.com
2. Sign up for free account
3. Verify your email

### 3.2 Add Domain

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Add `at-solvexx.com`
4. Follow DNS setup instructions (add SPF, DKIM, DMARC records)

### 3.3 Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Copy the API key

### 3.4 Add Environment Variables

Add to `.env.local`:
```bash
# Resend Email
RESEND_API_KEY=re_your_api_key_here
```

### 3.5 Add to Supabase Edge Functions

1. Go to **Supabase Dashboard** → **Edge Functions** → **Settings**
2. Add environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key

---

## 🚀 Step 4: Deploy Supabase Edge Functions

### 4.1 Deploy send-otp Function

**Option A: Using Supabase Dashboard**

1. Go to **Edge Functions** → **Create a new function**
2. Name: `send-otp`
3. Copy code from `supabase/functions/send-otp/index.ts`
4. Click **Deploy**

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy send-otp
```

### 4.2 Deploy cleanup-otps Function

Same process as above, name it `cleanup-otps`.

### 4.3 Set Environment Variables for Functions

For each function, add in Supabase Dashboard:
- `SUPABASE_URL` (already set)
- `SUPABASE_SERVICE_ROLE_KEY` (already set)
- `RESEND_API_KEY` (add this)

---

## ⏰ Step 5: Schedule Cleanup Function

1. Go to **Supabase Dashboard** → **Edge Functions** → **Scheduler**
2. Create new scheduled job:
   - **Function**: `cleanup-otps`
   - **Cron Expression**: `*/30 * * * *` (every 30 minutes)
   - **Description**: "Clean up expired OTP codes"

---

## 📦 Step 6: Install Dependencies

```bash
# Install Resend SDK (if not already installed)
npm install resend

# Install Next.js Script component (already included in Next.js)
# No additional packages needed for reCAPTCHA
```

---

## ✅ Step 7: Verify Setup

### 7.1 Test reCAPTCHA

1. Start dev server: `npm run dev`
2. Visit landing page
3. Open browser console
4. Check for reCAPTCHA script loading
5. Submit form - should trigger reCAPTCHA verification

### 7.2 Test Email Sending

1. Submit signup form with valid email
2. Check email inbox for OTP code
3. Verify email format and code display

### 7.3 Test OTP Verification

1. Enter OTP code on verification page
2. Verify redirects to themes page on success
3. Check user record in Supabase:
   - `email_verified = true`
   - `signup_stage = 'verified'`
   - `otp_code = null`

---

## 🔄 User Flow

```
1. User fills signup form
   ↓
2. reCAPTCHA v3 executes silently
   ↓
3. Backend verifies reCAPTCHA score
   ↓
4. User record created with email_verified=false
   ↓
5. OTP email sent via Resend
   ↓
6. User redirected to /verify-email
   ↓
7. User enters 6-digit OTP
   ↓
8. Backend verifies OTP and updates user
   ↓
9. Welcome email sent
   ↓
10. User redirected to /themes (verified=true)
   ↓
11. User can now create trial site
```

---

## 🧪 Testing Checklist

- [ ] reCAPTCHA script loads on landing page
- [ ] Form submission triggers reCAPTCHA verification
- [ ] OTP email received within 30 seconds
- [ ] OTP code is 6 digits
- [ ] Invalid OTP shows error message
- [ ] Expired OTP shows expiration message
- [ ] Valid OTP redirects to themes page
- [ ] User record updated with email_verified=true
- [ ] Welcome email sent after verification
- [ ] Resend OTP button works with cooldown
- [ ] Signup API blocks unverified users
- [ ] Cleanup function runs every 30 minutes

---

## 🔧 Troubleshooting

### reCAPTCHA Not Loading

**Check:**
1. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in `.env.local`
2. Domain is added to reCAPTCHA console
3. Script tag is loading (check browser console)

### OTP Email Not Received

**Check:**
1. `RESEND_API_KEY` is set correctly
2. Resend domain is verified
3. Email address is valid
4. Check Resend dashboard for failed sends
5. Check Supabase Edge Function logs

### OTP Verification Fails

**Check:**
1. OTP not expired (10 minute window)
2. OTP matches database record
3. User record exists
4. Check Supabase logs for errors

### Edge Function Errors

**Check:**
1. Environment variables are set in Supabase
2. Function is deployed
3. Check function logs in Supabase dashboard
4. Verify Resend API key is correct

---

## 📝 Environment Variables Summary

### Next.js (.env.local)
```bash
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Resend
RESEND_API_KEY=re_your_api_key

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Supabase Edge Functions
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

---

## 🚀 Production Deployment

1. **Add Production Domain to reCAPTCHA**
   - Add `at-solvexx.com` to reCAPTCHA domains

2. **Verify Resend Domain**
   - Complete DNS setup for production domain

3. **Update Environment Variables**
   - Set production values in Vercel/production environment

4. **Deploy Functions**
   - Redeploy Edge Functions to production Supabase project

5. **Test End-to-End**
   - Complete signup flow on production
   - Verify emails are delivered
   - Test OTP verification

---

## 📚 Related Files

- `docs/migrations/add_email_verification_fields.sql` - Database migration
- `supabase/functions/send-otp/index.ts` - OTP email sender
- `supabase/functions/cleanup-otps/index.ts` - OTP cleanup function
- `apps/web/app/api/verify-recaptcha/route.ts` - reCAPTCHA verification
- `apps/web/app/api/auth/send-otp/route.ts` - Send OTP API
- `apps/web/app/api/auth/verify-otp/route.ts` - Verify OTP API
- `apps/web/app/verify-email/page.tsx` - OTP verification page
- `apps/web/components/LandingPage.tsx` - Updated signup form

---

**Status:** ✅ Ready for deployment

**Last Updated:** [Current Date]

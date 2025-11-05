# Detailed Setup Guide

This guide provides step-by-step instructions for setting up all external services required for the At-Solvexx MVP.

## Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Razorpay Setup](#razorpay-setup)
3. [Cloudflare Setup](#cloudflare-setup)
4. [Resend Email Setup](#resend-email-setup)
5. [Local Development](#local-development)
6. [Testing](#testing)

## Supabase Setup

### 1.1 Create Project

1. Go to https://supabase.com
2. Click "New Project"
3. Enter project details:
   - **Name**: portfolio-builder
   - **Database Password**: Generate secure password
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait for initialization (5-10 minutes)

### 1.2 Get API Keys

Once project is created:

1. Go to **Settings** → **API**
2. Copy and save:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Initialize Database Schema

1. Go to **SQL Editor**
2. Create new query
3. Copy entire content from `docs/schema.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Verify all tables created successfully

### 1.4 Verify Tables

In **Table Editor**, verify these tables exist:
- `users`
- `sites`
- `themes`
- `image_library`
- `plans`
- `subscriptions`
- `audit_logs`

### 1.5 Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. For each table, enable RLS:

```sql
-- Run in SQL Editor for each table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 1.6 Setup Authentication

1. Go to **Authentication** → **Providers**
2. Enable Email/Password (default)
3. (Optional) Enable OAuth:
   - Google
   - GitHub
   - Discord

### 1.7 Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add Redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Staging: `https://staging.at-solvexx.com/auth/callback`
   - Production: `https://at-solvexx.com/auth/callback`

## Razorpay Setup

### 2.1 Create Account

1. Go to https://razorpay.com
2. Sign up with business email
3. Complete KYC verification:
   - Business details
   - Bank account
   - GST (if applicable)
4. Verification takes 1-3 business days

### 2.2 Get API Keys

Once verified:

1. Go to **Settings** → **API Keys**
2. Copy and save:
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

### 2.3 Create Subscription Plans

1. Go to **Products** → **Subscriptions** → **Plans**
2. Create Plan 1 (Basic - One-time):
   - **Plan Name**: Basic Portfolio
   - **Description**: Static 3-section portfolio
   - **Amount**: ₹1,999 (199900 paise)
   - **Interval**: One-time
   - **Period**: N/A
   - Click "Create Plan"

3. Create Plan 2 (Pro - Monthly):
   - **Plan Name**: Pro Portfolio
   - **Description**: Custom domain + pro features
   - **Amount**: ₹699 (69900 paise)
   - **Interval**: Monthly
   - **Period**: 1 month
   - Click "Create Plan"

4. Create Plan 3 (Premium - Monthly):
   - **Plan Name**: Premium Portfolio
   - **Description**: Premium features + priority support
   - **Amount**: ₹1,499 (149900 paise)
   - **Interval**: Monthly
   - **Period**: 1 month
   - Click "Create Plan"

### 2.4 Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Click "Add New Webhook"
3. Enter webhook URL: `https://at-solvexx.com/api/webhooks/razorpay`
4. Select events:
   - `subscription.activated`
   - `subscription.paused`
   - `subscription.cancelled`
   - `payment.failed`
5. Click "Create Webhook"
6. Copy **Webhook Secret** (if provided)

### 2.5 Test in Sandbox

For development, use Razorpay's test keys:

1. In Razorpay dashboard, toggle "Test Mode"
2. Use test card numbers:
   - **Visa**: 4111 1111 1111 1111
   - **Mastercard**: 5555 5555 5555 4444
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

## Cloudflare Setup

### 3.1 Add Domain

1. Go to https://cloudflare.com
2. Click "Add Site"
3. Enter your domain: `at-solvexx.com`
4. Select plan (Free tier is fine for MVP)
5. Cloudflare will scan DNS records
6. Update nameservers at your registrar:
   - Replace current nameservers with Cloudflare's
   - Nameservers provided in Cloudflare dashboard
7. Wait for DNS propagation (up to 48 hours)

### 3.2 Create API Token

1. Go to **My Profile** → **API Tokens**
2. Click "Create Token"
3. Use template: "Edit zone DNS"
4. Configure permissions:
   - **Permissions**: Zone → DNS → Edit
   - **Zone Resources**: Include → Specific zone → at-solvexx.com
5. Click "Continue to summary"
6. Review and click "Create Token"
7. Copy token → `CLOUDFLARE_TOKEN`

### 3.3 Get Account ID and Zone ID

1. Go to **Websites** → Select at-solvexx.com
2. Right sidebar shows:
   - **Account ID** → `CLOUDFLARE_ACCOUNT_ID`
   - **Zone ID** → `CLOUDFLARE_ZONE_ID`

### 3.4 Create Wildcard CNAME Record

1. In Cloudflare dashboard, go to **DNS**
2. Click "Add Record"
3. Configure:
   - **Type**: CNAME
   - **Name**: *.at-solvexx (wildcard for all subdomains)
   - **Target**: your-vercel-alias.vercel.app
   - **TTL**: Auto
   - **Proxy Status**: Proxied (orange cloud)
4. Click "Save"

### 3.5 SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Select encryption mode: **Full (strict)**
3. Go to **Edge Certificates**
4. Enable:
   - Always Use HTTPS
   - Minimum TLS Version: 1.2
   - Opportunistic Encryption

## Resend Email Setup

### 4.1 Create Account

1. Go to https://resend.com
2. Sign up with email
3. Verify email address

### 4.2 Get API Key

1. Go to **API Keys**
2. Click "Create API Key"
3. Name it: "At-Solvexx"
4. Copy key → `RESEND_API_KEY`

### 4.3 Add Domain

1. Go to **Domains**
2. Click "Add Domain"
3. Enter: `noreply.at-solvexx.com`
4. Add DNS records to Cloudflare:
   - **DKIM Record**: Copy from Resend
   - **SPF Record**: Copy from Resend
5. Verify domain in Resend

### 4.4 Create Email Templates

In Resend dashboard, create templates for:

1. **Welcome Email**
   - Subject: "Welcome to At-Solvexx"
   - Content: Signup confirmation + preview link

2. **Approval Email**
   - Subject: "Your Portfolio is Now Live!"
   - Content: Site approved + link to portfolio

3. **Payment Confirmation**
   - Subject: "Subscription Activated"
   - Content: Plan details + features

4. **Trial Expiry Reminder**
   - Subject: "Your Free Trial Ends Soon"
   - Content: Upgrade offer + link to plans

## Local Development

### 5.1 Clone Repository

```bash
git clone https://github.com/Vmit2/website-builder.git
cd website-builder
git checkout feature/mvp-website-builder
```

### 5.2 Install Dependencies

```bash
npm install
cd apps/web
npm install
cd ../..
```

### 5.3 Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your-secret
   CLOUDFLARE_TOKEN=your-token
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   CLOUDFLARE_ZONE_ID=your-zone-id
   RESEND_API_KEY=your-resend-key
   ```

### 5.4 Setup Local Hosts

Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 at-solvexx.test
127.0.0.1 alice.at-solvexx.test
127.0.0.1 bob.at-solvexx.test
127.0.0.1 admin.at-solvexx.test
```

### 5.5 Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

### 5.6 Test Subdomains Locally

```bash
# User portfolio
http://alice.at-solvexx.test:3000

# Admin panel
http://admin.at-solvexx.test:3000/admin
```

## Testing

### 6.1 Unit Tests

```bash
npm run test
```

### 6.2 Integration Tests

```bash
npm run test:integration
```

### 6.3 E2E Tests

```bash
npm run test:e2e
```

### 6.4 Manual Testing Checklist

- [ ] Signup with email
- [ ] Choose theme and palette
- [ ] Preview site
- [ ] Start free trial
- [ ] Access user dashboard
- [ ] Update site content
- [ ] View analytics
- [ ] Admin login
- [ ] View pending sites
- [ ] Approve site
- [ ] Receive approval email
- [ ] Upgrade to Pro plan
- [ ] Complete Razorpay payment
- [ ] Verify subscription activated

## Troubleshooting

### Issue: Supabase connection fails

**Solution**:
1. Verify `SUPABASE_URL` and keys are correct
2. Check Supabase project is active
3. Ensure IP is not blocked (Supabase → Settings → Network)

### Issue: Razorpay payment fails

**Solution**:
1. Verify API keys are for test mode
2. Use test card numbers provided by Razorpay
3. Check webhook URL is accessible

### Issue: Subdomain not resolving

**Solution**:
1. Verify Cloudflare DNS record is created
2. Check CNAME target is correct
3. Wait for DNS propagation (up to 48 hours)
4. Clear browser cache and DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   
   # Windows
   ipconfig /flushdns
   ```

### Issue: Email not sending

**Solution**:
1. Verify Resend API key is correct
2. Check domain is verified in Resend
3. Review Resend logs for errors
4. Test with `curl`:
   ```bash
   curl -X POST "https://api.resend.com/emails" \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@at-solvexx.com",
       "to": "test@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

## Support

For setup issues:
- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
- Cloudflare Docs: https://developers.cloudflare.com
- Resend Docs: https://resend.com/docs

---

**Last Updated**: October 2025

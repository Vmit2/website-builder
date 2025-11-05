# 📧 Complete Guide: Adding Your Domain & Email to Resend

## Step 1: Verify Your Domain in Resend

### 1.1 Login to Resend
1. Go to https://resend.com
2. Sign up or log in to your account
3. Navigate to **Domains** in the sidebar

### 1.2 Add Your Domain
1. Click **"Add Domain"** button
2. Enter your domain name (e.g., `at-solvexx.com`)
   - ⚠️ Don't include `www` or subdomains here
3. Click **"Add Domain"**

### 1.3 Get DNS Records
Resend will show you DNS records to add:
- **DKIM Records** (usually 2-3 records)
- **SPF Record** (TXT record)
- **DMARC Record** (TXT record - optional but recommended)

### 1.4 Add DNS Records to Your Domain Provider

**If using Cloudflare:**
1. Go to your Cloudflare dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **"Add Record"**
5. Add each DNS record Resend provided:
   - **Type**: TXT
   - **Name**: (copy from Resend)
   - **Content/Value**: (copy from Resend)
   - **TTL**: Auto
6. Click **"Save"** for each record

**If using GoDaddy/Namecheap/Other:**
1. Log in to your domain registrar
2. Find **DNS Management** or **Advanced DNS**
3. Add the TXT records provided by Resend
4. Save changes

### 1.5 Verify Domain
1. Go back to Resend dashboard
2. Click **"Verify"** button next to your domain
3. Wait a few minutes for DNS propagation
4. Status should change to **"Verified"** ✅

---

## Step 2: Configure Email Address in Your Code

### 2.1 Update Environment Variables

Add to your `apps/web/.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=At-Solvexx <noreply@your-domain.com>
```

**Important Notes:**
- Replace `your-domain.com` with your actual verified domain (e.g., `at-solvexx.com`)
- The email address before the `<` is the display name
- The email inside `<>` must use your verified domain

### 2.2 Restart Dev Server

After updating `.env.local`, restart your development server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 3: Test Email Sending

### 3.1 Test via API Route

Try sending a test email:

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "username": "testuser"
  }'
```

### 3.2 Check Resend Dashboard

1. Go to https://resend.com/emails
2. You should see sent emails with status
3. Check for any errors

---

## Common Email Addresses to Use

### For Development:
```bash
RESEND_FROM_EMAIL=At-Solvexx <onboarding@resend.dev>
```
- ✅ Works immediately (no domain verification needed)
- ❌ Only for testing/development

### For Production:
```bash
RESEND_FROM_EMAIL=At-Solvexx <noreply@at-solvexx.com>
```
- ✅ Professional
- ✅ Uses your verified domain
- ✅ Better deliverability

**Other options:**
- `support@at-solvexx.com` - For customer support
- `notifications@at-solvexx.com` - For system notifications
- `hello@at-solvexx.com` - For general inquiries

---

## Troubleshooting

### Issue: Domain Verification Failed

**Check:**
1. DNS records are correct (copy-paste exact values)
2. Wait 5-10 minutes for DNS propagation
3. Verify records using DNS lookup tools

### Issue: "API key is invalid"

**Solution:**
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy the full key (starts with `re_`)
4. Update `RESEND_API_KEY` in `.env.local`
5. Restart dev server

### Issue: "Domain not verified"

**Solution:**
1. Ensure domain is verified in Resend dashboard
2. Check that `RESEND_FROM_EMAIL` uses your verified domain
3. The email must match exactly: `something@your-verified-domain.com`

---

## Quick Reference

**Resend Dashboard Links:**
- Domains: https://resend.com/domains
- API Keys: https://resend.com/api-keys
- Emails (logs): https://resend.com/emails

**Your Environment Variables:**
```bash
RESEND_API_KEY=re_...           # Get from API Keys page
RESEND_FROM_EMAIL=Name <email@your-domain.com>  # Use verified domain
```

**Restart dev server after changes!** 🔄

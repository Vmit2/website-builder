# Google reCAPTCHA v3 Setup Guide

## Quick Setup

### Step 1: Get reCAPTCHA Keys from Google

1. Go to https://www.google.com/recaptcha/admin/create
2. Sign in with your Google account
3. Fill in the form:
   - **Label**: At-Solvexx (or any name you prefer)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: 
     - For local development: `localhost`, `127.0.0.1`
     - For production: `at-solvexx.com`, `*.at-solvexx.com`
   - Accept the terms
   - Click **Submit**

4. You'll see two keys:
   - **Site Key** (Public) - This is `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Secret Key** (Private) - This is `RECAPTCHA_SECRET_KEY`

### Step 2: Add Keys to Environment File

Open `apps/web/.env.local` and add:

```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important Notes**:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` starts with `NEXT_PUBLIC_` - this makes it available to the browser
- `RECAPTCHA_SECRET_KEY` is server-side only - never expose it in client code

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test reCAPTCHA

1. Navigate to the landing page: `http://localhost:3000`
2. Try to submit the signup form
3. The reCAPTCHA should work silently in the background
4. No "I'm not a robot" checkbox - it's invisible!

## Domain Configuration

### Local Development

For local testing, add these domains in Google reCAPTCHA admin:
- `localhost`
- `127.0.0.1`
- `at-solvexx.test` (if using custom local domain)

### Production

For production, add:
- Your main domain: `at-solvexx.com`
- Subdomain wildcard: `*.at-solvexx.com` (for user sites)

**How to add domains**:
1. Go to https://www.google.com/recaptcha/admin
2. Click on your reCAPTCHA site
3. Click **Settings** (gear icon)
4. Scroll to **Domains**
5. Click **+ Add** and enter each domain
6. Click **Save**

## Troubleshooting

### Error: "reCAPTCHA not configured. Please contact support."

**Solution**: Make sure both environment variables are set in `.env.local`:
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-key-here
RECAPTCHA_SECRET_KEY=your-secret-here
```

### Error: "reCAPTCHA is loading. Please wait and try again."

**Solution**: 
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Make sure the domain is added in Google reCAPTCHA admin
- Check browser console for errors

### Error: "Suspicious activity detected"

**Solution**:
- This means reCAPTCHA score is below 0.5 (threshold)
- Normal user behavior should score 0.9+
- If you're testing repeatedly, Google may flag it
- Try clearing browser cache or using a different browser

### reCAPTCHA Script Not Loading

**Check**:
1. Browser console for CORS or script loading errors
2. Ad blockers - they may block reCAPTCHA
3. Network connectivity

## How reCAPTCHA v3 Works

Unlike v2, reCAPTCHA v3:
- ✅ No "I'm not a robot" checkbox
- ✅ Works invisibly in the background
- ✅ Returns a score (0.0 to 1.0) instead of pass/fail
- ✅ Scores user behavior on your site
- ✅ Higher score = more likely human

**Score Threshold**: The app uses 0.5 as the threshold
- Score ≥ 0.5 = Human (allow)
- Score < 0.5 = Bot (reject)

## Security Best Practices

1. **Never expose `RECAPTCHA_SECRET_KEY`** in client-side code
2. **Always verify on server-side** - don't trust client-side verification alone
3. **Use environment variables** - never hardcode keys
4. **Rotate keys periodically** if compromised
5. **Monitor suspicious activity** in Google reCAPTCHA admin dashboard

## Free Tier Limits

Google reCAPTCHA v3 is **free** for:
- Up to **1 million calls per month**
- For most sites, this is more than enough

If you exceed the limit:
- Google may temporarily disable your site
- Consider upgrading to reCAPTCHA Enterprise

## Additional Resources

- Google reCAPTCHA Admin: https://www.google.com/recaptcha/admin
- reCAPTCHA v3 Documentation: https://developers.google.com/recaptcha/docs/v3
- Best Practices: https://developers.google.com/recaptcha/docs/v3#best_practices

# Deployment Guide

This guide covers deploying the At-Solvexx to production on Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with access to the repository
- Supabase project (https://supabase.com)
- Razorpay account (https://razorpay.com)
- Cloudflare account (https://cloudflare.com)
- Domain name

## Step 1: Prepare Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create a new project
3. Note down:
   - Project URL
   - Anon Key
   - Service Role Key

### 1.2 Initialize Database

1. In Supabase dashboard, go to SQL Editor
2. Run the SQL schema from `docs/schema.sql`
3. Verify all tables are created:
   - `users`
   - `sites`
   - `themes`
   - `image_library`
   - `plans`
   - `subscriptions`
   - `audit_logs`

### 1.3 Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for sites table
CREATE POLICY "Users can view their own sites" ON sites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sites" ON sites
  FOR UPDATE USING (user_id = auth.uid());

-- Create policies for admin access
CREATE POLICY "Admins can view all sites" ON sites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
```

### 1.4 Setup Supabase Auth

1. Go to Authentication settings
2. Configure OAuth providers (optional):
   - Google
   - GitHub
3. Set redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://at-solvexx.com/auth/callback`

## Step 2: Configure Razorpay

### 2.1 Create Razorpay Account

1. Sign up at https://razorpay.com
2. Complete KYC verification
3. Go to Settings → API Keys
4. Note down:
   - Key ID (public)
   - Key Secret (keep secure)

### 2.2 Create Subscription Plans

In Razorpay Dashboard:

```
Plan 1: Basic
- Amount: ₹1,999 (one-time)
- Interval: N/A

Plan 2: Pro
- Amount: ₹69,900 (699 × 100 paise)
- Interval: Monthly
- Period: 1 month

Plan 3: Premium
- Amount: ₹149,900 (1,499 × 100 paise)
- Interval: Monthly
- Period: 1 month
```

### 2.3 Configure Webhooks

1. Go to Settings → Webhooks
2. Add webhook URL: `https://at-solvexx.com/api/webhooks/razorpay`
3. Select events:
   - `subscription.activated`
   - `subscription.paused`
   - `subscription.cancelled`
   - `payment.failed`

## Step 3: Setup Cloudflare

### 3.1 Add Domain

1. Go to https://cloudflare.com
2. Add your domain
3. Update nameservers at your domain registrar
4. Wait for DNS propagation (up to 48 hours)

### 3.2 Create API Token

1. Go to My Profile → API Tokens
2. Create token with permissions:
   - Zone → DNS → Edit
   - Zone → Zone → Read
3. Note down the token

### 3.3 Create Wildcard CNAME

In Cloudflare DNS settings:

```
Type: CNAME
Name: *.at-solvexx (wildcard)
Content: your-vercel-alias.vercel.app
TTL: Auto
Proxy: Proxied
```

This allows all subdomains to point to Vercel.

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select `website-builder` repo
5. Select `feature/mvp-website-builder` branch

### 4.2 Configure Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SITE_URL=https://at-solvexx.com
NEXT_PUBLIC_APP_NAME=At-Solvexx

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret

# Cloudflare
CLOUDFLARE_TOKEN=your-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ZONE_ID=your-zone-id

# Resend
RESEND_API_KEY=your-resend-key

# Admin
ADMIN_EMAIL=admin@at-solvexx.com
```

### 4.3 Configure Custom Domain

1. In Vercel project, go to Settings → Domains
2. Add custom domain: `at-solvexx.com`
3. Add www subdomain: `www.at-solvexx.com`
4. Verify DNS configuration

### 4.4 Enable Preview Deployments

1. Go to Settings → Git
2. Enable "Preview Deployments"
3. Set preview branch to `feature/mvp-website-builder`

## Step 5: Setup n8n (Optional)

### 5.1 Self-Hosted n8n

```bash
# Using Docker
docker run -d \
  -p 5678:5678 \
  -e DB_TYPE=postgres \
  -e DB_POSTGRESDB_HOST=your-db-host \
  -e DB_POSTGRESDB_PORT=5432 \
  -e DB_POSTGRESDB_DATABASE=n8n \
  -e DB_POSTGRESDB_USER=n8n_user \
  -e DB_POSTGRESDB_PASSWORD=secure_password \
  -e N8N_HOST=n8n.at-solvexx.com \
  -e N8N_PROTOCOL=https \
  -e NODE_ENV=production \
  n8nio/n8n:latest
```

### 5.2 Configure Webhooks

1. Import workflow JSON files from `services/n8n-workflows/`
2. Update webhook URLs to point to production
3. Test each workflow

## Step 6: Setup Email (Resend)

### 6.1 Create Resend Account

1. Go to https://resend.com
2. Sign up and verify email
3. Go to API Keys
4. Create new API key
5. Note down the key

### 6.2 Configure Domain

1. Add your domain to Resend
2. Add DKIM and SPF records to Cloudflare DNS
3. Verify domain

### 6.3 Email Templates

Create email templates in Resend:
- Welcome email
- Approval notification
- Payment confirmation
- Trial expiry reminder

## Step 7: Setup Analytics (Plausible)

### 7.1 Create Plausible Account

1. Go to https://plausible.io
2. Sign up
3. Add site: `at-solvexx.com`
4. Get tracking code

### 7.2 Add Tracking Script

Add to `apps/web/app/layout.tsx`:

```tsx
<script
  defer
  data-domain="at-solvexx.com"
  src="https://plausible.io/js/script.js"
></script>
```

## Step 8: SSL/TLS Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. No additional configuration needed.

## Step 9: Monitoring & Logging

### 9.1 Setup Sentry (Optional)

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```js
const withSentry = require('@sentry/nextjs').withSentry;

module.exports = withSentry({
  // ... next config
}, {
  org: 'your-org',
  project: 'portfolio-builder',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

### 9.2 Monitor Vercel Deployments

1. Enable Vercel Analytics
2. Setup error tracking
3. Configure alerts

## Step 10: Database Backups

### 10.1 Supabase Backups

Supabase automatically backs up your database. To enable additional backups:

1. Go to Supabase dashboard
2. Settings → Backups
3. Enable daily backups
4. Download backups regularly

### 10.2 Manual Backup

```bash
# Backup Supabase database
pg_dump "postgresql://user:password@db.supabase.co:5432/postgres" > backup.sql

# Restore from backup
psql "postgresql://user:password@db.supabase.co:5432/postgres" < backup.sql
```

## Step 11: Performance Optimization

### 11.1 Enable Caching

In `next.config.js`:

```js
module.exports = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400'
        }
      ]
    }
  ]
};
```

### 11.2 Image Optimization

Use Cloudinary for image optimization:

```tsx
import Image from 'next/image';

<Image
  src="https://res.cloudinary.com/..."
  alt="Portfolio image"
  width={800}
  height={600}
  quality={80}
/>
```

## Step 12: Security

### 12.1 Environment Variables

- Never commit `.env.local` to Git
- Use Vercel's environment variable UI
- Rotate API keys regularly

### 12.2 CORS Configuration

Configure CORS in `next.config.js`:

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL
          }
        ]
      }
    ];
  }
};
```

### 12.3 Rate Limiting

Implement rate limiting on API routes:

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit('api');
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  // ... handler
}
```

## Step 13: Testing Production

### 13.1 Smoke Tests

```bash
# Test signup
curl -X POST https://at-solvexx.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","fullName":"Test User"}'

# Test themes endpoint
curl https://at-solvexx.com/api/themes

# Test admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://at-solvexx.com/api/admin/sites
```

### 13.2 End-to-End Tests

```bash
# Run Playwright tests
npm run test:e2e
```

## Step 14: Monitoring & Alerts

### 14.1 Vercel Analytics

Monitor in Vercel dashboard:
- Page load times
- Core Web Vitals
- Error rates

### 14.2 Uptime Monitoring

Setup uptime monitoring with:
- Pingdom
- UptimeRobot
- Healthchecks.io

### 14.3 Alert Configuration

Configure alerts for:
- Failed deployments
- High error rates
- Slow page loads
- Database connection issues

## Rollback Procedure

If something goes wrong:

```bash
# Revert to previous deployment
vercel rollback

# Or manually select a previous deployment in Vercel dashboard
```

## Troubleshooting

### Issue: Subdomain not resolving

**Solution**:
1. Check Cloudflare DNS records
2. Verify CNAME points to Vercel alias
3. Wait for DNS propagation (up to 48 hours)
4. Clear browser cache

### Issue: Supabase connection timeout

**Solution**:
1. Check Supabase project status
2. Verify environment variables
3. Check network connectivity
4. Review Supabase logs

### Issue: Razorpay webhook not firing

**Solution**:
1. Verify webhook URL in Razorpay dashboard
2. Check webhook signature verification
3. Review Razorpay logs
4. Test webhook manually

### Issue: Email not sending

**Solution**:
1. Verify Resend API key
2. Check email domain verification
3. Review Resend logs
4. Test with test email address

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
- GitHub Issues: https://github.com/Vmit2/website-builder/issues

---

**Last Updated**: October 2025

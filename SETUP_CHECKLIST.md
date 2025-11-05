# At-Solvexx Setup Checklist

This checklist will help you set up the At-Solvexx project step by step.

## ✅ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)

## ✅ Step 1: Clone & Install

- [ ] Clone repository
  ```bash
  git clone https://github.com/Vmit2/website-builder.git
  cd website-builder
  git checkout feature/mvp-website-builder
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Run setup script (optional)
  ```bash
  ./scripts/setup.sh
  ```

## ✅ Step 2: Environment Variables

- [ ] Create `.env.local` in `apps/web/`
  ```bash
  cp apps/web/.env.local.example apps/web/.env.local
  # OR
  cp docs/ENV.example apps/web/.env.local
  ```

- [ ] Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## ✅ Step 3: Supabase Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project
- [ ] Get API keys from Settings → API:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Update `apps/web/.env.local` with Supabase keys

### Database Schema

- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `docs/schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created:
  - [ ] `users`
  - [ ] `sites`
  - [ ] `themes`
  - [ ] `image_library`
  - [ ] `plans`
  - [ ] `subscriptions`
  - [ ] `audit_logs`

### Row Level Security (RLS)

- [ ] Enable RLS on all tables (run in SQL Editor):
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  ```

### Seed Data (Optional)

- [ ] Insert sample themes into `themes` table
- [ ] Insert sample images into `image_library` table
- [ ] Insert pricing plans into `plans` table

## ✅ Step 4: Local Development Setup

- [ ] Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
  ```
  127.0.0.1 at-solvexx.test
  127.0.0.1 alice.at-solvexx.test
  127.0.0.1 bob.at-solvexx.test
  127.0.0.1 admin.at-solvexx.test
  ```

- [ ] Start development server
  ```bash
  npm run dev
  ```

- [ ] Visit http://localhost:3000
- [ ] Verify landing page loads

## ✅ Step 5: Test API Endpoints

- [ ] Test signup endpoint:
  ```bash
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","username":"testuser","fullName":"Test User"}'
  ```

- [ ] Test themes endpoint:
  ```bash
  curl http://localhost:3000/api/themes
  ```

## ✅ Step 6: Optional Services (for full functionality)

### Razorpay (Payments)

- [ ] Create Razorpay account at https://razorpay.com
- [ ] Complete KYC verification
- [ ] Get API keys from Settings → API Keys:
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - [ ] `RAZORPAY_KEY_SECRET`
- [ ] Create subscription plans in Razorpay dashboard
- [ ] Configure webhooks (in production)

### Cloudflare (DNS)

- [ ] Create Cloudflare account
- [ ] Add domain
- [ ] Create API token with DNS edit permissions
- [ ] Get tokens:
  - [ ] `CLOUDFLARE_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `CLOUDFLARE_ZONE_ID`

### Resend (Email)

- [ ] Create Resend account at https://resend.com
- [ ] Get API key
- [ ] Add to `.env.local` as `RESEND_API_KEY`
- [ ] Verify domain (in production)

### Cloudinary (Images)

- [ ] Create Cloudinary account
- [ ] Get credentials:
  - [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`

## ✅ Step 7: Verify Setup

- [ ] Type check passes:
  ```bash
  npm run type-check
  ```

- [ ] Linter passes:
  ```bash
  npm run lint
  ```

- [ ] Dev server starts without errors
- [ ] Landing page displays correctly
- [ ] Signup form works
- [ ] Database connection works

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Run `npm install` in both root and `apps/web` directories

### Issue: "Cannot connect to Supabase"
**Solution**: 
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify network connectivity

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
npm run dev -- -p 3001
```

### Issue: Subdomains not working locally
**Solution**: 
- Verify `/etc/hosts` entries
- Clear browser cache
- Restart dev server

## 📚 Documentation

- **README.md** - Project overview
- **docs/QUICKSTART.md** - 5-minute quick start
- **docs/SETUP.md** - Detailed setup guide
- **docs/API.md** - API documentation
- **docs/DEPLOYMENT.md** - Production deployment

## 🆘 Need Help?

- Check documentation in `/docs` folder
- Review error messages in terminal
- Check Supabase logs
- Open issue on GitHub

---

**Last Updated**: November 2024

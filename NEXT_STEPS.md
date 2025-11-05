# Next Steps After Adding Environment Variables

## ✅ Step 1: Verify Your Environment File

Make sure you've added your credentials to `apps/web/.env.local` (NOT `.env.local.example`):

```bash
# Open the file
nano apps/web/.env.local
# OR
code apps/web/.env.local  # VS Code
```

Your file should have:
```bash
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your actual key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your actual key
```

⚠️ **Important**: 
- Add credentials to `.env.local` (NOT `.env.local.example`)
- `.env.local` is gitignored and won't be committed
- `.env.local.example` is tracked in git (use for templates only)

---

## ✅ Step 2: Set Up Database Schema

Your database needs tables before the app can work.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open `docs/schema.sql` from this project
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
9. Verify success message

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Verify Tables Were Created

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ `users`
   - ✅ `sites`
   - ✅ `themes`
   - ✅ `image_library`
   - ✅ `plans`
   - ✅ `subscriptions`
   - ✅ `audit_logs`

---

## ✅ Step 3: Enable Row Level Security (RLS)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Step 4: Test Your Connection

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Visit**: http://localhost:3000
   - You should see the landing page

3. **Test the API** (in another terminal):
   ```bash
   # Test themes endpoint
   curl http://localhost:3000/api/themes
   
   # Test signup endpoint
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "fullName": "Test User"
     }'
   ```

---

## ✅ Step 5: (Optional) Add Sample Data

If you want to test with themes and plans:

### Add Sample Themes

Run in Supabase SQL Editor:

```sql
-- Insert sample themes
INSERT INTO themes (slug, name, description) VALUES
('minimal-creative', 'Minimal Creative', 'Clean, whitespace-driven design'),
('bold-portfolio', 'Bold Portfolio', 'Large hero, bold typography'),
('tech-personal', 'Tech Personal', 'Developer portfolio theme');
```

### Add Sample Plans

```sql
-- Insert sample plans
INSERT INTO plans (slug, name, description, price_cents, interval, features) VALUES
('basic', 'Basic', 'One-time payment plan', 199900, 'one_time', '["Static portfolio", "3 sections", "Basic support"]'),
('pro', 'Pro', 'Monthly subscription', 69900, 'monthly', '["Custom domain", "Unlimited sections", "Priority support"]'),
('premium', 'Premium', 'Premium subscription', 149900, 'monthly', '["All Pro features", "Advanced analytics", "24/7 support"]');
```

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" or connection errors

**Solution**:
1. Verify environment variables are correct:
   ```bash
   cat apps/web/.env.local | grep SUPABASE
   ```
2. Check Supabase project is active (not paused)
3. Verify you copied the correct keys (no extra spaces)
4. Restart dev server after changing `.env.local`

### Error: "relation does not exist" or "table does not exist"

**Solution**:
- Database schema not created yet
- Go to Step 2 and run `docs/schema.sql` in Supabase SQL Editor

### Error: "Invalid API key"

**Solution**:
- Verify you copied the entire key (no truncation)
- Check if keys have quotes (they shouldn't)
- Make sure you're using the right keys (anon vs service_role)

---

## 📋 Checklist

Before starting the dev server, ensure:

- [ ] `.env.local` exists in `apps/web/` directory
- [ ] `SUPABASE_URL` is set (not placeholder)
- [ ] `SUPABASE_ANON_KEY` is set (not placeholder)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (not placeholder)
- [ ] Database schema has been run (`docs/schema.sql`)
- [ ] All 7 tables exist in Supabase Table Editor
- [ ] RLS is enabled on tables

---

## 🚀 Ready to Start?

Once everything is set up:

```bash
npm run dev
```

Visit http://localhost:3000 and you should see your landing page!

---

**Need help?** Check:
- `SETUP_CHECKLIST.md` - Detailed setup guide
- `FIND_CREDENTIALS.md` - How to find Supabase credentials
- `docs/SETUP.md` - Comprehensive setup documentation

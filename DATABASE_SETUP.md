# Database Setup - Fix "Could not find the table 'public.users'" Error

## 🚨 Error You're Seeing

```
Error creating user: {
  code: 'PGRST205',
  message: "Could not find the table 'public.users' in the schema cache"
}
```

This means the database tables haven't been created yet in your Supabase project.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query** (or use the existing query editor)

### Step 2: Run the Schema

1. Open the file `docs/schema.sql` from this project
2. Copy **ALL** the contents (the entire file)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `users`
   - ✅ `sites`
   - ✅ `themes`
   - ✅ `image_library`
   - ✅ `plans`
   - ✅ `subscriptions`
   - ✅ `audit_logs`

### Step 4: Enable Row Level Security (RLS)

Go back to **SQL Editor** and run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

Click **Run** again.

### Step 5: Restart Your Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Test It Works

Try signing up again on http://localhost:3000 - the error should be gone!

---

## 🔍 What the Schema Does

The `docs/schema.sql` file creates:

1. **Extensions**: Enables UUID and crypto functions
2. **7 Tables**:
   - `users` - User accounts
   - `sites` - Portfolio sites
   - `themes` - Available themes
   - `image_library` - Pre-curated images
   - `plans` - Pricing plans
   - `subscriptions` - User subscriptions
   - `audit_logs` - Activity logs
3. **Indexes**: For better query performance

---

## 🐛 Still Getting Errors?

### Error: "permission denied"
- Make sure you're running the SQL as the postgres user
- The SQL Editor should have full permissions by default

### Error: "relation already exists"
- Tables might already exist
- Check Table Editor to see what's there
- If you need to start fresh, drop tables first (careful!)

### Error: Still can't find tables
- Wait a few seconds after running SQL (cache refresh)
- Refresh the Table Editor page
- Restart your dev server

---

**After running the schema, your app should work! 🎉**

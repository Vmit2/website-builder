# Run Database Schema - Quick Guide

## 🚨 Error You're Seeing

```
Database tables not found. Please ensure the database schema has been run in Supabase.
```

This means you need to create the database tables in your Supabase project.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. **Login** to your account
3. **Select your project** (the one you're using for this app)
4. In the left sidebar, click **SQL Editor** (icon looks like `</>` or search for "SQL")
5. Click **New query** button (or use the existing query editor)

### Step 2: Open the Schema File

1. In your code editor, open: `docs/schema.sql`
2. **Select ALL** the contents (Cmd+A / Ctrl+A)
3. **Copy** it (Cmd+C / Ctrl+C)

### Step 3: Paste and Run in Supabase

1. Go back to the Supabase SQL Editor
2. **Paste** the schema into the editor (Cmd+V / Ctrl+V)
3. **Click "Run"** button (or press `Cmd+Enter` on Mac / `Ctrl+Enter` on Windows)
4. Wait for the execution to complete (usually 1-5 seconds)

### Step 4: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see these **7 tables**:
   - ✅ `users`
   - ✅ `sites`
   - ✅ `themes`
   - ✅ `image_library`
   - ✅ `plans`
   - ✅ `subscriptions`
   - ✅ `audit_logs`

### Step 5: Enable Row Level Security (RLS)

Go back to **SQL Editor** and run this:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

Click **Run** again.

### Step 6: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## ✅ Test It Works

Try signing up again on http://localhost:3000 - the error should be gone!

---

## 🎥 Visual Guide

### 1. Navigate to SQL Editor:
```
Supabase Dashboard → Your Project → SQL Editor (left sidebar)
```

### 2. Open Schema File:
```
Your code editor → docs/schema.sql → Select All → Copy
```

### 3. Paste and Run:
```
SQL Editor → Paste → Click "Run" button
```

### 4. Verify in Table Editor:
```
Supabase Dashboard → Table Editor → See 7 tables listed
```

---

## 🐛 Common Issues

### Issue: "permission denied" error

**Solution**: 
- Make sure you're logged in as the project owner
- The SQL Editor should have full permissions by default
- If still failing, check you're in the right project

### Issue: "relation already exists" error

**Solution**:
- Tables might already exist
- Check Table Editor to see what's there
- If you need to start fresh, you can drop tables first (be careful!):
  ```sql
  DROP TABLE IF EXISTS audit_logs CASCADE;
  DROP TABLE IF EXISTS subscriptions CASCADE;
  DROP TABLE IF EXISTS plans CASCADE;
  DROP TABLE IF EXISTS image_library CASCADE;
  DROP TABLE IF EXISTS themes CASCADE;
  DROP TABLE IF EXISTS sites CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
  Then run the schema again.

### Issue: Still getting "table not found" after running schema

**Solution**:
- Wait 5-10 seconds (cache refresh)
- Refresh the Table Editor page
- Restart your dev server
- Check the schema ran successfully (look for green checkmark in SQL Editor)

### Issue: Can't find schema.sql file

**Solution**:
- Make sure you're in the project root directory
- The file should be at: `docs/schema.sql`
- If missing, check: `ls docs/schema.sql` in terminal

---

## 📋 Checklist

Before testing your app:

- [ ] Opened Supabase SQL Editor
- [ ] Copied entire contents of `docs/schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run" and saw success message
- [ ] Verified 7 tables exist in Table Editor
- [ ] Ran RLS enable commands
- [ ] Restarted dev server
- [ ] Tested signup endpoint

---

## 🆘 Still Need Help?

1. **Check Supabase logs**: Go to Logs → Postgres Logs to see any errors
2. **Verify connection**: Make sure your `.env.local` has correct Supabase credentials
3. **Check project status**: Ensure your Supabase project isn't paused
4. **Database URL**: Verify you're using the correct project in Supabase dashboard

---

**After running the schema successfully, your app should work! 🎉**

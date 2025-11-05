# How to Find Supabase Credentials

## 🔑 Required Credentials

### 1. SUPABASE_URL

**Location**: Supabase Dashboard → Settings → API

**Steps**:
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** under Project Settings
5. Find **Project URL** in the "Project API keys" section
6. Copy the URL (format: `https://xxxxx.supabase.co`)

**Example**:
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

---

### 2. SUPABASE_ANON_KEY ✅

**Location**: Same as above (Settings → API)

**Steps**:
1. Same location as SUPABASE_URL
2. Find **anon public** key
3. Click **Reveal** or copy button
4. Copy the key

**Example**:
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. SUPABASE_SERVICE_ROLE_KEY ✅

**Location**: Same as above (Settings → API)

**Steps**:
1. Same location as SUPABASE_URL
2. Scroll down to find **service_role secret** key
3. Click **Reveal** (⚠️ Keep this secret!)
4. Copy the key

**Example**:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Warning**: The service_role key has admin access. Never expose it in client-side code!

---

### 4. DATABASE_URL (Optional)

**Location**: Supabase Dashboard → Settings → Database

**Steps**:
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **Database**
4. Find **Connection string** section
5. Choose **Connection pooling** (recommended) or **Direct connection**
6. Copy the URI

**Example** (Connection Pooling):
```
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Example** (Direct Connection):
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

⚠️ **Note**: For this project, `DATABASE_URL` is **NOT required**. The code uses `SUPABASE_URL` with the API keys instead.

---

## 📝 Quick Reference

| Variable | Where to Find | Required? |
|----------|---------------|-----------|
| `SUPABASE_URL` | Settings → API → Project URL | ✅ Yes |
| `SUPABASE_ANON_KEY` | Settings → API → anon public | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role secret | ✅ Yes |
| `DATABASE_URL` | Settings → Database → Connection string | ❌ No |

---

## 🎯 Your Current Status

✅ **You have**: 
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

⏳ **You need**:
- `SUPABASE_URL` (from Settings → API → Project URL)

---

## 📸 Visual Guide

1. **Navigate to API Settings**:
   ```
   Dashboard → Project → Settings (⚙️) → API
   ```

2. **Find Project URL**:
   ```
   Project API keys
   ┌─────────────────────────────────────┐
   │ Project URL                         │
   │ https://xxxxx.supabase.co          │ ← Copy this
   │ [Copy]                              │
   └─────────────────────────────────────┘
   ```

3. **Update your `.env.local`**:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your-existing-key
   SUPABASE_SERVICE_ROLE_KEY=your-existing-key
   ```

---

## ✅ Verification

After adding `SUPABASE_URL` to your `.env.local`, verify it's correct:

```bash
# Check your .env.local file
cat apps/web/.env.local | grep SUPABASE_URL

# Should output something like:
# SUPABASE_URL=https://xxxxx.supabase.co
```

If you see `https://your-project.supabase.co` (the placeholder), replace it with your actual URL from the dashboard.

---

## 🆘 Still Can't Find It?

1. Make sure you're logged into the correct Supabase account
2. Verify your project is active (not paused)
3. Check you're looking at the right project
4. Try refreshing the dashboard page

---

**Next Step**: Once you have all three values, update your `apps/web/.env.local` file and restart your dev server!

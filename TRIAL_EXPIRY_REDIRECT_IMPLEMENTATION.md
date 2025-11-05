# Trial Expiry Redirect Implementation

## ✅ Implementation Summary

Updated the middleware and routing logic to align with the new Supabase scheduled functions (`check-trials` and `cleanup-trials`). The system now handles all trial states correctly.

---

## 🔄 State Machine

| Status | Condition | Middleware Behavior | Redirect Destination |
|--------|-----------|---------------------|---------------------|
| `approved` | Always | Render site | N/A |
| `pending` / `trial` | `expires_at > now()` | Render site | N/A |
| `pending` / `trial` | `expires_at <= now()` | Redirect | `/trial-expired?subdomain={name}` |
| `expired` | Always | Redirect | `/upgrade?from={subdomain}` |
| `deleted` | Always | Redirect | `/deleted-site?subdomain={name}` |
| Not found | No record | Redirect | `/subdomain-availability?username={name}` |

---

## 📁 Updated Files

### 1. `apps/web/app/page.tsx`
**Changes:**
- ✅ Updated to handle all trial states (`approved`, `pending`, `trial`, `expired`, `deleted`, `rejected`)
- ✅ Proper expiry checking for `pending`/`trial` status
- ✅ Redirects to appropriate pages based on status

**Key Logic:**
```typescript
// 1. Approved sites - always render
if (status === 'approved') return <SitePage />;

// 2. Deleted sites - redirect to deleted-site page
if (status === 'deleted') redirect('/deleted-site?subdomain=...');

// 3. Expired status - redirect to upgrade
if (status === 'expired') redirect('/upgrade?from=...');

// 4. Pending/trial - check expiry
if (status === 'pending' || status === 'trial') {
  if (expiresAt && now > expiresAt) {
    redirect('/trial-expired?subdomain=...');
  }
  return <SitePage />;
}
```

### 2. `apps/web/app/trial-expired/page.tsx`
**Changes:**
- ✅ Updated message: "This free trial website has expired. Please upgrade to continue your portfolio journey."
- ✅ Supports both `subdomain` and `username` query params (backward compatibility)
- ✅ Upgrade button links to `/upgrade?from={subdomain}`

### 3. `apps/web/app/deleted-site/page.tsx` (NEW)
**Changes:**
- ✅ New page created
- ✅ Message: "This trial has been permanently removed after 48 hours of inactivity."
- ✅ CTA: "Start a New Trial" → `/`
- ✅ Secondary CTA: "View Pricing Plans" → `/upgrade`

### 4. `apps/web/app/upgrade/page.tsx`
**Changes:**
- ✅ Supports both `from` and `username` query params (backward compatibility)
- ✅ Shows subdomain in heading if provided

### 5. `apps/web/app/api/get-site-status/route.ts` (NEW)
**Changes:**
- ✅ Lightweight API endpoint for middleware (optional)
- ✅ Returns routing decisions without heavy DB queries
- ✅ Can be used by middleware to avoid direct DB calls

---

## 🔗 Complete Flow

### Active Trial (0-24 hours)
```
User visits username.at-solvexx.com
  → Middleware extracts subdomain
  → app/page.tsx checks status = 'pending'/'trial', expires_at > now()
  → Renders SitePage with countdown banner
```

### Trial Expires (24+ hours)
```
User visits username.at-solvexx.com
  → app/page.tsx checks status = 'pending'/'trial', expires_at <= now()
  → Redirects to /trial-expired?subdomain={username}
  → Shows: "This free trial website has expired..."
  → Upgrade button → /upgrade?from={username}

Meanwhile:
  → check-trials function runs (hourly)
  → Marks status = 'expired' for expired trials
```

### Expired Status (Marked by check-trials)
```
User visits username.at-solvexx.com
  → app/page.tsx checks status = 'expired'
  → Redirects to /upgrade?from={username}
  → Shows pricing plans
```

### Deleted Status (48+ hours after expiry)
```
User visits username.at-solvexx.com
  → app/page.tsx checks status = 'deleted'
  → Redirects to /deleted-site?subdomain={username}
  → Shows: "This trial has been permanently removed after 48 hours..."
  → CTA: "Start a New Trial" → /

Meanwhile:
  → cleanup-trials function runs (every 6 hours)
  → Finds expired sites > 48h old
  → Moves to inactive_users
  → Deletes site (or marks as 'deleted' if soft delete)
```

### Site Not Found
```
User visits nonexistent.at-solvexx.com
  → app/page.tsx queries DB → No record found
  → Redirects to /subdomain-availability?username=nonexistent
  → Shows: "Yes, this subdomain name is available..."
  → CTA: "Get Started" → /
```

---

## 🧪 Testing Checklist

### 1. Active Trial
- [ ] Visit active trial site → Should render normally
- [ ] Countdown banner shows time remaining
- [ ] Upgrade link works

### 2. Expired Trial (Before check-trials runs)
- [ ] Set `expires_at` to past, `status = 'pending'`
- [ ] Visit site → Should redirect to `/trial-expired?subdomain=...`
- [ ] Page shows correct message and upgrade button

### 3. Expired Status (After check-trials runs)
- [ ] Set `status = 'expired'`
- [ ] Visit site → Should redirect to `/upgrade?from=...`
- [ ] Upgrade page shows pricing plans

### 4. Deleted Status
- [ ] Set `status = 'deleted'`
- [ ] Visit site → Should redirect to `/deleted-site?subdomain=...`
- [ ] Page shows removal message
- [ ] "Start a New Trial" button works

### 5. Site Not Found
- [ ] Visit non-existent subdomain → Should redirect to `/subdomain-availability`
- [ ] Page shows availability message

### 6. Approved Site
- [ ] Set `status = 'approved'`
- [ ] Visit site → Should render normally (no redirects)
- [ ] No expiry checks should apply

---

## 🔧 Integration with Supabase Functions

### check-trials Function (Hourly)
- Marks `status = 'expired'` for sites where `expires_at < now()`
- Sends reminder emails
- After this runs, expired sites redirect to `/upgrade`

### cleanup-trials Function (Every 6 hours)
- Finds expired sites older than 48 hours
- Moves to `inactive_users` table
- Deletes site records (or marks as 'deleted')
- After this runs, deleted sites redirect to `/deleted-site`

---

## 📝 Query Parameters

### Backward Compatibility
All pages support both old and new query parameter names:

| Page | Old Param | New Param | Notes |
|------|-----------|-----------|-------|
| `/trial-expired` | `username` | `subdomain` | Both supported |
| `/upgrade` | `username` | `from` | Both supported |
| `/deleted-site` | N/A | `subdomain` | New page |
| `/subdomain-availability` | `username` | `username` | Unchanged |

---

## 🚀 Deployment Notes

1. **No Database Changes Required** - Uses existing `sites` table with `status` and `expires_at` columns
2. **No Environment Variables** - All logic uses existing setup
3. **Backward Compatible** - Old query params still work
4. **Supabase Functions** - Must be deployed separately (see `CLEANUP_TRIALS_SETUP.md` and `EMAIL_REMINDER_SETUP.md`)

---

## ✅ Verification

After deployment, verify:

1. ✅ Active trials render normally
2. ✅ Expired trials redirect correctly
3. ✅ Deleted sites show removal message
4. ✅ Non-existent subdomains show availability page
5. ✅ All redirects use correct query params
6. ✅ Upgrade flow works from all entry points

---

**Status:** ✅ Ready for deployment

**Last Updated:** [Current Date]

# Persistent Trial Banner & Floating Upgrade CTA - Implementation

## ✅ Features Implemented

### 1. Persistent Trial Banner (`TrialBanner.tsx`)

**Location:** `apps/web/components/TrialBanner.tsx`

**Features:**
- ✅ Fixed bottom banner on all free trial websites
- ✅ Real-time countdown showing remaining hours
- ✅ Expired state message
- ✅ Upgrade link that includes username
- ✅ Protected from user removal (data attribute + watchdog)
- ✅ Responsive design (stacks on mobile)
- ✅ Only shows for free/trial plans

**Styling:**
- Gradient background (red → orange → red)
- Fixed position at bottom
- z-index: 9999
- White text with semi-transparent upgrade button
- Responsive padding and text sizing

**Behavior:**
- Updates every minute with remaining hours
- Shows "Trial expired" message when expired
- Automatically hides for paid users (starter/pro plans)

---

### 2. Floating Upgrade CTA (`UpgradeCTA.tsx`)

**Location:** `apps/web/components/UpgradeCTA.tsx`

**Features:**
- ✅ Appears automatically when < 3 hours remain
- ✅ Floating button in bottom-right (desktop) / bottom-center (mobile)
- ✅ Pulse animation to draw attention
- ✅ Click redirects to upgrade page
- ✅ Optional Google Analytics tracking
- ✅ Protected from user removal
- ✅ Only shows for free/trial plans

**Styling:**
- Gradient background (red → pink)
- Fixed position
- z-index: 10000 (above banner)
- Rounded pill shape
- Smooth hover animations
- Pulse shadow effect

**Behavior:**
- Checks remaining time every minute
- Shows when ≤ 3 hours remaining
- Hides when expired or > 3 hours
- Tracks analytics events (if gtag available)

---

## 🔗 Integration Points

### Preview Page (`/preview/[themeId]`)
- Both components integrated
- Shows based on user's plan and expiry time
- Works with theme preview system

### Live Site Page (`SitePage.tsx`)
- Both components integrated
- Shows on all free trial subdomains
- Respects site status and plan

---

## 🛡️ Protection Mechanisms

### 1. Data Attributes
- `data-trial-banner="protected"`
- `data-upgrade-cta="protected"`
- Used for CSS targeting and detection

### 2. ContentEditable Protection
- `contentEditable={false}`
- Prevents inline editing
- `suppressContentEditableWarning` to avoid React warnings

### 3. CSS Protection
- `!important` flags on critical styles
- Forced positioning and z-index
- Pointer events forced to auto

### 4. DOM Watchdog (TrialBanner)
- MutationObserver watches for removal
- Can trigger re-render if needed
- React's state management handles most cases

---

## 📱 Responsive Design

### Desktop (> 768px)
- Banner: Full width, horizontal layout
- CTA: Bottom-right corner

### Mobile (≤ 768px)
- Banner: Stacks vertically, smaller text
- CTA: Bottom-center, transforms to center

---

## 🎨 Styling Details

### Trial Banner
```css
- Background: linear-gradient(90deg, #ff4d4d, #ff9a00, #ff4d4d)
- Position: fixed bottom
- Padding: 12px vertical, 16px horizontal
- Font: 0.9rem, weight 500
- z-index: 9999
```

### Upgrade CTA
```css
- Background: linear-gradient(135deg, #ff6b6b, #f06595)
- Position: fixed, bottom-right
- Border-radius: 50px (pill shape)
- Padding: 12px 24px
- Animation: pulse 2s infinite
- z-index: 10000
```

---

## 📊 Analytics Integration

### Events Tracked (Optional)
1. **trial_cta_shown**
   - Fired when CTA appears
   - Includes: `remaining_hours`

2. **trial_cta_clicked**
   - Fired when user clicks CTA
   - Includes: `remaining_hours`

### Setup
Add Google Analytics gtag to your app:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

Components automatically detect and use gtag if available.

---

## 🔄 Update Frequency

- **Trial Banner**: Updates every 60 seconds (1 minute)
- **Upgrade CTA**: Checks every 60 seconds (1 minute)
- Both use `setInterval` with cleanup on unmount

---

## 🚫 Hiding for Paid Users

Components automatically hide when:
- `plan === 'starter'`
- `plan === 'pro'`
- `plan === 'approved'` (for backwards compatibility)

Only shows for:
- `plan === 'free'`
- `plan === 'trial'`
- `plan === undefined` (defaults to free)

---

## 📝 Banner Messages

### Active Trial (< 24 hours remaining)
- **Option 1:** "⚠️ This website will expire in X hours."
- **Option 2:** "🚀 Trial ending soon! Upgrade now to keep your live site running."

### Expired Trial
- "⚠️ Trial expired. Please upgrade to relaunch your site."

### CTA Message (< 3 hours)
- "🔥 Trial ending soon — Upgrade Now"
- "🔥 Trial ending in Xm — Upgrade Now" (when < 1 hour)

---

## ✅ Checklist

- ✅ Trial banner component created
- ✅ Upgrade CTA component created
- ✅ Integrated into preview page
- ✅ Integrated into live site page
- ✅ Protected from removal
- ✅ Responsive design
- ✅ Real-time countdown
- ✅ Plan-based visibility
- ✅ Analytics tracking (optional)
- ✅ CSS protection styles
- ✅ Expiry state handling

---

## 🚀 Next Steps (Optional Enhancements)

1. **A/B Testing**: Add feature flag for banner message variants
2. **Customization**: Allow admins to edit banner text via dashboard
3. **Multiple CTAs**: Show different CTAs based on remaining time
4. **Exit Intent**: Add exit-intent popup for expiring trials
5. **Email Reminders**: Send email when CTA appears
6. **Conversion Tracking**: Track banner → upgrade conversion rate

---

**Status:** ✅ Fully implemented and integrated

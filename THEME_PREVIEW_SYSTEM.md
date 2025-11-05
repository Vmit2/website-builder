# Theme Preview + Live Editing System - Implementation Summary

## ✅ What's Been Implemented

### 1. Theme JSON Configuration Files
**Location:** `apps/web/themes/[theme-id]/theme.json`

Created 5 theme configuration files:
- ✅ `minimal-creative/theme.json`
- ✅ `fitness-pro/theme.json`
- ✅ `lifestyle-blog/theme.json`
- ✅ `beauty-studio/theme.json`
- ✅ `music-stage/theme.json`

Each theme.json includes:
- Colors (primary, secondary, accent, background, text)
- Fonts (heading, body)
- Layout sections
- Component configurations

### 2. Database Migration
**File:** `docs/migrations/add_theme_preview_system.sql`

Adds:
- `draft_content_json` field to `sites` table
- `published_content_json` field to `sites` table
- `plan` field to `sites` table (free/starter/pro)
- `json_config` field to `themes` table
- `user_customization` table for theme customizations

**⚠️ Action Required:** Run this migration in Supabase SQL Editor before using the preview system.

### 3. Theme Context Hook
**File:** `apps/web/lib/hooks/useTheme.tsx`

- Dynamically loads theme.json files
- Provides theme configuration via React Context
- Isolated from root theme (doesn't affect main site styling)

### 4. Plan Restrictions Hook
**File:** `apps/web/lib/hooks/usePlanRestrictions.tsx`

Implements plan-based feature restrictions:
- Free: 5 themes (preview only), 5 images (pre-uploaded), limited colors
- Starter: 5 themes (publish 1), 10 images, full features
- Pro: Unlimited themes, unlimited images, all features

### 5. Theme Gallery Page
**File:** `apps/web/app/themes/page.tsx`

- Displays all 5 preview themes
- Shows plan-based messaging
- "Preview & Customize" buttons
- Links to dashboard

### 6. Preview Page with Live Editor
**File:** `apps/web/app/preview/[themeId]/page.tsx`

Features:
- Theme preview with ThemeProvider
- Loads user's draft content
- Plan-based restrictions display
- Theme switcher integration
- Placeholder modals for Advanced Settings and Add Content

### 7. Preview Toolbar
**File:** `apps/web/components/theme-preview/PreviewToolbar.tsx`

Toolbar with:
- Theme switcher dropdown
- "Add Content" button
- "Advanced Settings" button
- "Save Draft" button
- Plan indicator badge

### 8. Save Draft API
**File:** `apps/web/app/api/preview/save-draft/route.ts`

- Saves draft content to database
- Updates theme_slug
- Returns success/error response

---

## 🚧 What Still Needs Implementation

### 1. Inline Text Editing
**Priority: High**

Need to implement:
- ContentEditable components for text editing
- Click-to-edit functionality
- Save changes to draft_content_json
- Consider using `react-contenteditable` or `tiptap`

**Suggested Implementation:**
```tsx
<EditableText
  value={content.headline}
  onChange={(newValue) => updateDraftContent({ headline: newValue })}
/>
```

### 2. Drag & Drop Section Reordering
**Priority: High**

Need to install and implement:
```bash
npm install react-dnd react-dnd-html5-backend
```

Then add drag handlers to theme sections to reorder layout.

### 3. Advanced Settings Panel (Color Picker)
**Priority: Medium**

Need to install and implement:
```bash
npm install react-color
```

Features:
- Color picker for primary, secondary, accent colors
- Preset palettes (3 for free, unlimited for paid)
- Font selector (if plan allows)
- Save customizations to `user_customization` table

### 4. Add Content Panel
**Priority: Medium**

Features:
- Add text blocks
- Add images (with plan restrictions)
- Add sections
- Image upload (plan-restricted)
- Image selection from library (free users)

### 5. Image Management System
**Priority: Medium**

For free users:
- Show 5 pre-uploaded theme images
- Disable upload button with upgrade prompt
- Images stored in `/public/images/defaults/[theme-id]/`

For paid users:
- Upload images (Supabase Storage or Cloudinary)
- Plan-based limits (Starter: 10, Pro: unlimited)
- Image library management

### 6. Authentication Integration
**Priority: High**

Fix the save-draft API to properly authenticate users:
- Use Supabase Auth session
- Get userId from session instead of request body
- Update preview page to send auth token

### 7. Additional Theme Components
**Priority: Low**

Currently only `minimal-creative` is fully integrated. Need to create or integrate:
- `fitness-pro` component
- `lifestyle-blog` component
- `beauty-studio` component
- `music-stage` component

Or create placeholder components that use the theme.json config.

### 8. Publish Site API
**Priority: Medium**

Create `/api/preview/publish` endpoint:
- Move `draft_content_json` → `published_content_json`
- Update site status
- Plan-based restrictions (free can't publish)

---

## 📋 Setup Checklist

1. ✅ Theme JSON files created
2. ✅ Database migration SQL created
3. ⚠️ **Run database migration** in Supabase
4. ✅ Theme Context hook created
5. ✅ Plan restrictions hook created
6. ✅ Theme gallery page created
7. ✅ Preview page created
8. ✅ Toolbar component created
9. ✅ Save draft API created
10. ⚠️ **Install dependencies** (if needed):
    ```bash
    npm install react-color react-dnd react-dnd-html5-backend
    # Optional: npm install react-contenteditable tiptap
    ```
11. ⚠️ **Fix authentication** in save-draft API
12. ⚠️ **Add link to themes page** from dashboard
13. ⚠️ **Implement inline editing**
14. ⚠️ **Implement drag & drop**
15. ⚠️ **Implement advanced settings panel**
16. ⚠️ **Implement add content panel**
17. ⚠️ **Implement image management**

---

## 🔗 Navigation Flow

```
Dashboard → /themes → /preview/[themeId]
           ↓
    [Select Theme]
           ↓
    [Preview & Edit]
           ↓
    [Save Draft]
           ↓
    [Publish] (if paid)
```

---

## 🎨 Theme Isolation

The preview system is **isolated from the root theme**:
- Root site uses its own theme configuration
- Preview mode uses `ThemeProvider` with separate theme.json files
- No interference between preview and published sites

---

## 📝 Notes

1. **Free Trial Users:**
   - Can preview all 5 themes
   - Can save drafts (but can't publish)
   - Limited to 5 pre-uploaded images
   - Limited color palette (3 presets)

2. **Paid Users:**
   - Can preview and publish themes (based on plan)
   - Full color customization
   - Can upload images (plan-based limits)
   - All advanced features unlocked

3. **Draft vs Published:**
   - `draft_content_json`: Working copy (always editable)
   - `published_content_json`: Live site content (updated on publish)

---

## 🚀 Next Steps

1. Run the database migration
2. Test the theme gallery page (`/themes`)
3. Test the preview page (`/preview/minimal-creative`)
4. Implement inline editing
5. Implement drag & drop
6. Complete advanced settings panel
7. Complete add content panel
8. Test plan restrictions
9. Deploy and test in production

---

**Status:** ✅ Core infrastructure complete. 🚧 Advanced editing features pending.

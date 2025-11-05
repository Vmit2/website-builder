# CMS Sidebar Implementation Status

## ✅ Completed:
1. **CmsSidebar.tsx** - Main sidebar component with tabs
2. **DesignTab.tsx** - Font, color palette, logo customization
3. **Database migration** - user_site_settings table schema

## ⏳ Remaining Tasks:

### 1. Update CmsSidebar to import DesignTab
   - Replace placeholder DesignTab with actual component
   - Add proper props passing

### 2. Update editable-schema.json files
   - Add "section" field to group related items (hero, about, services, etc.)
   - Update minimal-creative/editable-schema.json

### 3. Integrate sidebar into preview page
   - Add sidebar to preview/[themeId]/page.tsx
   - Show sidebar only in edit mode
   - Handle section selection and scrolling

### 4. Section highlighting
   - Add border glow to active sections
   - Auto-scroll when section is clicked in sidebar

### 5. API endpoints
   - POST /api/dashboard/settings - Save design settings
   - GET /api/dashboard/settings - Load design settings
   - Merge settings with theme content

### 6. Auto-save integration
   - Save design settings along with content
   - Update auto-save handler

## Files to modify:
- apps/web/app/preview/[themeId]/page.tsx
- apps/web/components/cms/CmsSidebar.tsx
- apps/web/themes/minimal-creative/editable-schema.json
- apps/web/app/api/dashboard/settings/route.ts (new)

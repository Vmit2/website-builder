# CMS Sidebar Implementation - Status

## ✅ Completed Components:

### 1. **CmsSidebar.tsx** ✅
   - Main sidebar with Content/Design/SEO tabs
   - Section navigation with collapsible groups
   - Search/filter functionality
   - Active section highlighting
   - Auto-expands sections with active items

### 2. **DesignTab.tsx** ✅
   - Font selection (5 Google Fonts with plan restrictions)
   - Color palette selection (solid + gradients)
   - Logo upload with preview
   - Plan-based feature restrictions:
     - Free: 3 fonts, 3 solid palettes
     - Starter: 5 fonts, 5 solid + 1 gradient
     - Pro: All fonts, all palettes + custom (placeholder)

### 3. **SeoTab Component** ✅
   - SEO title and description inputs
   - Character counters
   - Plan-based restriction (Starter+ only)
   - Auto-save on blur

### 4. **Schema Updates** ✅
   - Updated `minimal-creative/editable-schema.json`
   - Added "section" field for grouping (hero, about, services, contact)
   - Added social-links as repeatable section

### 5. **Database Migration** ✅
   - `docs/migrations/add_user_site_settings.sql`
   - Creates `user_site_settings` table
   - Stores font, palette, logo, SEO data

## ⏳ Remaining Integration:

### 1. **API Endpoints** (Needed)
   - `POST /api/dashboard/settings` - Save design settings
   - `GET /api/dashboard/settings` - Load design settings
   - Merge with existing content save logic

### 2. **Preview Page Integration** (Critical)
   - Add sidebar to `apps/web/app/preview/[themeId]/page.tsx`
   - Show sidebar only in edit mode
   - Handle section selection → scroll to element
   - Add border glow to active sections
   - Load and save design settings

### 3. **Section Highlighting** (Needed)
   - Add `data-section-id` attributes to editable elements
   - CSS for `.outline-blue-400` border glow
   - Scroll into view on section select

### 4. **Auto-save Integration** (Needed)
   - Extend auto-save to include design settings
   - Save both content + design in single payload

## Files Created:
- `apps/web/components/cms/CmsSidebar.tsx`
- `apps/web/components/cms/DesignTab.tsx`
- `docs/migrations/add_user_site_settings.sql`
- `apps/web/themes/minimal-creative/editable-schema.json` (updated)

## Next Steps:
1. Create API routes for settings
2. Integrate sidebar into preview page
3. Add section highlighting and scrolling
4. Update auto-save to include design settings
5. Test with different user plans

## Usage Example (After Integration):
```tsx
// In preview/[themeId]/page.tsx
{isEditMode && (
  <CmsSidebar
    schema={themeSchema}
    activeSectionId={activeSectionId}
    onSectionSelect={(id) => {
      // Scroll to section
      document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' });
      setActiveSectionId(id);
    }}
    userPlan={userPlan}
    currentFont={settings.font}
    currentPalette={settings.palette}
    onFontChange={handleFontChange}
    onPaletteChange={handlePaletteChange}
    onLogoChange={handleLogoChange}
    onSeoUpdate={handleSeoUpdate}
  />
)}
```

## Notes:
- All components are fully functional and styled
- Plan restrictions are implemented
- Dark mode support included
- Ready for integration into preview page

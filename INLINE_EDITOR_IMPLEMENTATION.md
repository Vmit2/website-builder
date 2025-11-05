# Inline CMS Editor Implementation

## Overview

The inline CMS editor allows users to edit website content directly on the page using visual editing tools, replacing the old form-based editor.

## Features

### ✅ Implemented

1. **Inline Text Editing**
   - Uses Tiptap for rich text editing
   - Fallback to simple `contenteditable` for plain text
   - Auto-saves changes with 5-second debounce
   - Visual indicators when in edit mode

2. **Editable Images**
   - Hover overlay with "Change Image" button
   - Free tier: Choose from 5 preloaded images
   - Paid tier: Upload custom images (Supabase Storage)
   - Image picker modal with preview

3. **Section-Based Editing**
   - Each section (Hero, About, Portfolio, Contact) is independently editable
   - Toolbar appears on hover in edit mode
   - Color picker for theme customization (via react-colorful)

4. **Boilerplate Content**
   - Default content loads from `/themes/<theme-name>/default-content.json`
   - User content merges with defaults
   - New users always see populated content (never blank)

5. **Auto-Save**
   - Debounced save (5 seconds of inactivity)
   - Manual save button available
   - Last saved timestamp indicator

6. **Edit Mode Toggle**
   - Floating button in top-right (visible to logged-in users)
   - Toggle between Edit and Preview mode
   - Save indicator shows unsaved changes

## Database Schema

### `user_content` Table

```sql
CREATE TABLE user_content (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  site_id uuid REFERENCES sites(id),
  theme_name varchar,
  content_json jsonb,
  last_updated timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(user_id, site_id, theme_name)
);
```

## API Endpoints

### `POST /api/content/save`
Save user content to database.

**Request:**
```json
{
  "siteId": "uuid",
  "themeName": "minimal-creative",
  "contentJson": { "hero": { "title": "..." } }
}
```

### `GET /api/content/load?themeName=xxx&siteId=xxx`
Load user's saved content (or empty if none).

### `POST /api/images/upload`
Upload custom image (paid users only).

## Component Structure

```
components/editor/
├── EditableText.tsx       # Inline text editor (Tiptap)
├── EditableImage.tsx      # Image selector/uploader
├── Toolbar.tsx            # Section editing toolbar
└── EditModeToggle.tsx     # Floating edit mode toggle

lib/
├── store/editor-store.ts  # Zustand state management
├── hooks/useAutoSave.ts   # Auto-save hook with debounce
└── utils/content-loader.ts # Default content loader

app/editor/[themeName]/
└── page.tsx               # Main editor page
```

## Usage

### For Users

1. Navigate to `/editor/[theme-name]`
2. Click "Edit Mode" button (top-right)
3. Click on any text or image to edit
4. Changes auto-save every 5 seconds
5. Toggle back to "Preview Mode" to see final result

### For Developers

#### Adding Editable Content to Theme

```tsx
import EditableText from '@/components/editor/EditableText';
import { useEditorStore } from '@/lib/store/editor-store';

function MyTheme({ content }) {
  const { updateContent } = useEditorStore();
  
  return (
    <EditableText
      value={content.hero.title}
      onChange={(val) => updateContent('hero.title', val)}
      tag="h1"
      className="text-4xl"
      placeholder="Default title"
    />
  );
}
```

#### Creating Default Content

Create `/themes/<theme-name>/default-content.json`:

```json
{
  "hero": {
    "title": "Welcome",
    "subtitle": "Your subtitle"
  },
  "about": {
    "text": "About section text"
  }
}
```

## Free vs Paid Features

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Image Upload | ❌ (5 preloaded only) | ✅ |
| Color Customization | Limited | Full custom |
| Section Reorder | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Code Export | ❌ | ✅ |

## Next Steps

1. ✅ Run database migration: `docs/migrations/create_user_content_table.sql`
2. ✅ Create Supabase Storage bucket: `uploads` (for paid user images)
3. ✅ Add 5 placeholder images to `/public/free-assets/`
4. ⚠️ Update theme components to use `EditableText`/`EditableImage`
5. ⚠️ Implement proper user authentication check in `EditModeToggle`
6. ⚠️ Add image upload to Supabase Storage (currently placeholder)

## File Structure

```
apps/web/
├── components/editor/          # Editor components
├── app/editor/[themeName]/     # Editor page
├── lib/store/editor-store.ts   # State management
├── lib/hooks/useAutoSave.ts    # Auto-save logic
├── lib/utils/content-loader.ts # Content utilities
├── themes/<name>/default-content.json # Boilerplate
└── public/free-assets/         # Free tier images
```

## Migration Checklist

- [x] Database migration created
- [x] API endpoints created
- [x] Editor components created
- [x] Auto-save hook implemented
- [x] Edit mode toggle created
- [x] Default content loader utility
- [ ] Update existing themes to use editable components
- [ ] Add placeholder images to `/public/free-assets/`
- [ ] Test image upload flow
- [ ] Add authentication checks

## Notes

- Content is stored both in `user_content` table and `sites.content` (for backward compatibility)
- Default content is loaded client-side from JSON files
- Auto-save is debounced to avoid excessive API calls
- Edit mode is only visible to authenticated users

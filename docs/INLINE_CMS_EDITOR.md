# Inline CMS Editor System - Implementation Guide

## ✅ Completed Components

### 1. Core Editor Components

#### `EditableText` (`apps/web/components/editor/EditableText.tsx`)
- Inline text editing using `react-contenteditable`
- Visual indicators: hover outlines, focus states
- Placeholder text support
- Plan-based restrictions support
- Tag-aware rendering (h1, h2, h3, p, span, div)

#### `EditableImage` (`apps/web/components/editor/EditableImage.tsx`)
- Click-to-edit image functionality
- Hover overlay with "Change Image" button
- Plan restrictions:
  - Free: Cannot edit images (shows upgrade message)
  - Starter: Can choose from 10 predefined images
  - Pro: Can upload custom images + choose from predefined
- Inline image picker modal

#### `FloatingToolbar` (`apps/web/components/editor/FloatingToolbar.tsx`)
- Appears when text is selected in edit mode
- Formatting options:
  - Bold, Italic
  - Add Link
  - Font Size
  - Text Color (15 color presets)
  - Undo/Redo
  - Save/Exit buttons
- Positioned dynamically above selected text

### 2. Theme Schema System

#### Theme JSON Schemas
Each theme can define its editable zones via JSON:

**Example**: `apps/web/themes/minimal-creative/editable-schema.json`
```json
{
  "themeSlug": "minimal-creative",
  "sections": [
    {
      "id": "hero-title",
      "type": "text",
      "default": "I'm a Creative Designer",
      "editable": true,
      "tag": "h1",
      "placeholder": "Your awesome headline here"
    },
    {
      "id": "hero-image",
      "type": "image",
      "default": "https://images.unsplash.com/...",
      "editable": true,
      "placeholder": "/placeholder-hero.jpg"
    }
  ]
}
```

#### Schema Loader (`apps/web/lib/utils/theme-schema-loader.ts`)
- `loadThemeEditableSchema(themeSlug)`: Loads schema JSON
- `getDefaultContentFromSchema(schema)`: Extracts default content
- `getSectionsByType(schema, type)`: Filters sections by type

### 3. State Management

#### Editor Store (`apps/web/lib/store/editor-store.ts`)
Zustand store for editor state:
- `isEditMode`: Boolean toggle
- `content`: Current draft content
- `isSaving`: Save in progress
- `lastSaved`: Timestamp of last save
- `hasUnsavedChanges`: Dirty state flag

### 4. Auto-Save System

#### Auto-Save Utility (`apps/web/lib/utils/auto-save.ts`)
- Debounced save handler (3-second delay by default)
- `createAutoSaveHandler()`: Creates debounced save function
- `saveContentToSupabase()`: Saves to `/api/preview/save-draft`

### 5. Updated Components

#### PreviewToolbar (`apps/web/components/theme-preview/PreviewToolbar.tsx`)
- **Edit Mode Toggle**: 🖊️ Edit Mode / 👁️ Preview Mode
- **Save Button**: Shows save state and last saved time
- Conditionally shows/hides buttons based on edit mode

### 6. Type Definitions

#### Editor Types (`apps/web/lib/types/editor.ts`)
- `EditableSection`: Schema definition
- `DraftContent`: Content storage format
- `ThemeEditableSchema`: Complete theme schema

---

## 🔧 Integration Steps (To Complete)

### Step 1: Update Theme Components

Each theme component needs to use `EditableText` and `EditableImage`:

**Example**: Update `apps/web/components/themes/minimal-creative/index.tsx`

```tsx
import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import { useEditorStore } from '@/lib/store/editor-store';

export default function MinimalCreative({ content = {}, ... }) {
  const { isEditMode, updateContent } = useEditorStore();
  
  return (
    <div>
      {/* Hero Section */}
      <section>
        <EditableText
          id="hero-title"
          value={content['hero-title'] || ''}
          defaultValue="I'm a Creative Designer"
          onChange={(value) => updateContent('hero-title', value)}
          tag="h1"
          className="text-4xl font-bold"
        />
        
        <EditableImage
          id="hero-image"
          src={content['hero-image']}
          defaultSrc="https://images.unsplash.com/..."
          onChange={(src) => updateContent('hero-image', src)}
          userPlan={userPlan}
          className="w-full h-96 object-cover"
        />
      </section>
      
      {/* About Section */}
      <section>
        <EditableText
          id="about-bio"
          value={content['about-bio'] || ''}
          defaultValue="About your work here..."
          onChange={(value) => updateContent('about-bio', value)}
          tag="p"
        />
      </section>
    </div>
  );
}
```

### Step 2: Update Preview Page

Update `apps/web/app/preview/[themeId]/page.tsx` to:

1. **Load theme schema** and merge with user content
2. **Initialize editor store** with content
3. **Set up auto-save** with debouncing
4. **Render FloatingToolbar**
5. **Handle keyboard shortcuts** (Ctrl+S to save, Esc to exit)

**Key code additions**:

```tsx
import { loadThemeEditableSchema, getDefaultContentFromSchema } from '@/lib/utils/theme-schema-loader';
import { createAutoSaveHandler, saveContentToSupabase } from '@/lib/utils/auto-save';
import FloatingToolbar from '@/components/editor/FloatingToolbar';
import { useEditorStore } from '@/lib/store/editor-store';

function PreviewContent({ themeId }) {
  const { setEditMode, setContent, updateContent, ... } = useEditorStore();
  const [schema, setSchema] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  
  // Load theme schema and content
  useEffect(() => {
    const loadData = async () => {
      // Load schema
      const themeSchema = await loadThemeEditableSchema(themeId);
      setSchema(themeSchema);
      
      // Load user content (from API)
      const siteData = await fetch('/api/dashboard/site?username=...').then(r => r.json());
      
      // Merge defaults with user content
      const defaults = getDefaultContentFromSchema(themeSchema);
      const merged = { ...defaults, ...(siteData.site?.content || {}) };
      
      setContent(merged);
    };
    loadData();
  }, [themeId]);
  
  // Set up auto-save
  useEffect(() => {
    const autoSave = createAutoSaveHandler({
      onSave: async (content) => {
        await saveContentToSupabase(userId, themeId, content);
        setLastSaved(new Date());
        markUnsavedChanges(false);
      },
    });
    
    // Trigger auto-save on content changes
    // (This should be connected to updateContent calls)
    
    return () => {
      autoSave.cancel?.(); // Cancel pending saves on unmount
    };
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && isEditMode) {
        setEditMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode]);
  
  return (
    <div>
      <PreviewToolbar {...toolbarProps} />
      <FloatingToolbar onSave={handleSave} onExit={() => setEditMode(false)} />
      
      {/* Render theme component with editable content */}
      <MinimalCreative content={content} userPlan={userPlan} />
      
      {/* Auto-save indicator */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
          {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved ✓'}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Update API Endpoint

Ensure `/api/preview/save-draft` exists and saves to `sites.content`:

```typescript
// apps/web/app/api/preview/save-draft/route.ts
export async function POST(request: NextRequest) {
  const { userId, themeId, content } = await request.json();
  
  // Save to Supabase
  await supabaseAdmin
    .from('sites')
    .update({ 
      content: content,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  return NextResponse.json({ success: true });
}
```

---

## 🎨 Plan-Based Restrictions

### Free Plan
- ✅ Can edit text
- ❌ Cannot edit images (shows upgrade overlay)
- ✅ Auto-save enabled

### Starter Plan
- ✅ Can edit text
- ✅ Can choose from 10 predefined images
- ❌ Cannot upload custom images
- ✅ Auto-save enabled

### Pro Plan
- ✅ Can edit text
- ✅ Can choose from predefined images
- ✅ Can upload custom images
- ✅ Auto-save enabled

---

## 🚀 Usage Flow

1. **User selects theme** → Lands on `/preview/[themeId]`
2. **Clicks "Edit Mode"** → Sections become editable
3. **Clicks text/image** → Direct inline editing
4. **Types or selects** → Changes reflect instantly
5. **Auto-save triggers** → After 3 seconds of inactivity
6. **Manual save** → Click "Save" or press Ctrl+S
7. **Exit edit mode** → Click "Preview Mode" or press Esc

---

## 📝 Next Steps

1. ✅ Core components created
2. ✅ Theme schemas created (minimal-creative, fitness-pro)
3. ✅ Auto-save utilities created
4. ✅ Editor store updated
5. ✅ PreviewToolbar updated
6. ⏳ **Update theme components** to use EditableText/EditableImage
7. ⏳ **Update preview page** to integrate auto-save and schema loading
8. ⏳ **Create remaining theme schemas** (bold-portfolio, tech-personal, etc.)
9. ⏳ **Test end-to-end flow**

---

## 🔍 Testing Checklist

- [ ] Text editing works inline
- [ ] Image editing respects plan restrictions
- [ ] Auto-save triggers after 3 seconds
- [ ] Manual save works (Ctrl+S)
- [ ] Edit mode toggle works
- [ ] Floating toolbar appears on text selection
- [ ] Theme schemas load correctly
- [ ] Default content appears for new users
- [ ] Plan restrictions enforced correctly
- [ ] Content persists after page refresh

---

## 📚 File Structure

```
apps/web/
├── components/
│   ├── editor/
│   │   ├── EditableText.tsx          ✅
│   │   ├── EditableImage.tsx         ✅
│   │   └── FloatingToolbar.tsx       ✅
│   ├── theme-preview/
│   │   └── PreviewToolbar.tsx        ✅ (updated)
│   └── themes/
│       └── minimal-creative/
│           └── index.tsx             ⏳ (needs update)
├── lib/
│   ├── store/
│   │   └── editor-store.ts           ✅
│   ├── types/
│   │   └── editor.ts                 ✅
│   ├── hooks/
│   │   └── usePlanRestrictions.tsx   ✅ (updated)
│   └── utils/
│       ├── auto-save.ts              ✅
│       └── theme-schema-loader.ts    ✅
├── themes/
│   ├── minimal-creative/
│   │   └── editable-schema.json      ✅
│   └── fitness-pro/
│       └── editable-schema.json      ✅
└── app/
    └── preview/
        └── [themeId]/
            └── page.tsx               ⏳ (needs update)
```

---

## 💡 Tips

1. **Schema-first approach**: Always define editable zones in theme JSON first
2. **Default content**: Always provide defaults so sections never appear blank
3. **Plan restrictions**: Check `canEditImages` and `canUploadImages` before enabling image editing
4. **Auto-save**: Use debouncing to avoid excessive API calls
5. **User feedback**: Show clear save states and last saved time

---

**Status**: Core infrastructure complete ✅ | Theme integration pending ⏳

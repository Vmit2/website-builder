# Tiptap SSR Hydration Fix

## Issue
Tiptap was throwing an error: "SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches."

## Solution Applied

1. **Added `immediatelyRender: false`** to the `useEditor` config
2. **Added client-side mounting check** using `useState` and `useEffect`
3. **Conditional editor initialization** - only initialize Tiptap when component is mounted on client
4. **Proper fallback rendering** - show plain HTML during SSR

## Changes Made

### `EditableText.tsx`
- Added `isMounted` state to track client-side mounting
- Set `immediatelyRender: false` in useEditor config
- Only initialize editor when `isMounted` is true
- Added proper dependency array to useEditor
- Show fallback HTML during SSR/before mount

## How It Works

1. Component renders on server with fallback HTML (no Tiptap)
2. Component mounts on client, `isMounted` becomes true
3. Tiptap editor initializes with `immediatelyRender: false`
4. Editor content syncs with props
5. No hydration mismatch because SSR and client both start with same HTML

## Testing

The editor should now work without SSR errors:
- Navigate to `/editor/minimal-creative`
- Text should render properly
- Edit mode should work after component mounts
- No console errors about SSR/hydration


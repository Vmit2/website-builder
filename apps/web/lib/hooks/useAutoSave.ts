import { useEffect, useRef } from 'react';
import { debounce } from 'lodash.debounce';
import { useEditorStore } from '@/lib/store/editor-store';

interface UseAutoSaveOptions {
  userId: string;
  siteId: string;
  themeName: string;
  saveFn: (content: Record<string, any>) => Promise<void>;
  debounceMs?: number;
}

export function useAutoSave({
  userId,
  siteId,
  themeName,
  saveFn,
  debounceMs = 5000,
}: UseAutoSaveOptions) {
  const { content, hasUnsavedChanges, setIsSaving, setLastSaved, markUnsavedChanges } =
    useEditorStore();
  const isMountedRef = useRef(true);

  // Create debounced save function
  const debouncedSave = useRef(
    debounce(async (contentToSave: Record<string, any>) => {
      if (!isMountedRef.current) return;

      setIsSaving(true);
      try {
        await saveFn(contentToSave);
        setLastSaved(new Date());
        markUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Optionally show error toast
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, debounceMs)
  ).current;

  // Auto-save when content changes (only if we have valid IDs)
  useEffect(() => {
    if (hasUnsavedChanges && Object.keys(content).length > 0 && userId !== 'anonymous' && siteId !== 'anonymous') {
      debouncedSave(content);
    }
  }, [content, hasUnsavedChanges, debouncedSave, userId, siteId]);

  // Manual save function
  const saveNow = async () => {
    setIsSaving(true);
    try {
      await saveFn(content);
      setLastSaved(new Date());
      markUnsavedChanges(false);
      // Cancel pending debounced save
      debouncedSave.cancel();
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return { saveNow };
}

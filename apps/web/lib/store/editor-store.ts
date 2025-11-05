import { create } from 'zustand';

interface EditorState {
  isEditMode: boolean;
  content: Record<string, any>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  setEditMode: (enabled: boolean) => void;
  updateContent: (key: string, value: any) => void;
  setContent: (content: Record<string, any>) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  markUnsavedChanges: (hasChanges: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isEditMode: false,
  content: {},
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  setEditMode: (enabled) => set({ isEditMode: enabled }),
  updateContent: (key, value) =>
    set((state) => ({
      content: { ...state.content, [key]: value },
      hasUnsavedChanges: true,
    })),
  setContent: (content) => set({ content, hasUnsavedChanges: false }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  markUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
}));

'use client';

import { useEffect, useState } from 'react';
import { Edit3, Eye, Save, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';
import { cn } from '@/lib/utils';

interface EditModeToggleProps {
  onSave?: () => Promise<void>;
  className?: string;
}

export default function EditModeToggle({ onSave, className = '' }: EditModeToggleProps) {
  const { isEditMode, setEditMode, isSaving, hasUnsavedChanges, lastSaved } = useEditorStore();
  const [isVisible, setIsVisible] = useState(false);

  // Show toggle on editor pages (allow anonymous users too)
  useEffect(() => {
    const isInEditor = window.location.pathname.includes('/editor') || 
                       window.location.pathname.includes('/dashboard') ||
                       window.location.pathname.includes('/preview');
    setIsVisible(isInEditor);
  }, []);

  const handleToggle = () => {
    setEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
      } catch (error) {
        console.error('Save failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save. Please try again.';
        if (errorMessage.includes('Anonymous') || errorMessage.includes('Unauthorized')) {
          alert('Please log in to save your changes.');
        } else {
          alert(errorMessage);
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-2',
        className
      )}
    >
      {/* Save Button (if has unsaved changes) */}
      {hasUnsavedChanges && isEditMode && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors',
            isSaving && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      )}

      {/* Edit Mode Toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          'bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200',
          isEditMode && 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
        )}
      >
        {isEditMode ? (
          <>
            <Eye className="w-4 h-4" />
            Preview Mode
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" />
            Edit Mode
          </>
        )}
      </button>

      {/* Last Saved Indicator */}
      {lastSaved && !hasUnsavedChanges && (
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs border border-green-200">
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

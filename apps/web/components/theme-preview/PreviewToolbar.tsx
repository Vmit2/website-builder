'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, Save } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';

interface PreviewToolbarProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  onAdvancedSettings?: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
  plan?: 'free' | 'starter' | 'pro';
  expiresAt?: string | null;
  username?: string | null;
  onPreview?: () => void;
}

export default function PreviewToolbar({
  currentThemeId,
  onThemeChange,
  onAdvancedSettings,
  onSaveDraft,
  isSaving = false,
  plan = 'free',
  expiresAt,
  username,
  onPreview,
}: PreviewToolbarProps) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { isEditMode, setEditMode, hasUnsavedChanges, lastSaved } = useEditorStore();

  const handleToggleEditMode = () => {
    const newMode = !isEditMode;
    console.log('🔄 Toggling edit mode:', { from: isEditMode, to: newMode });
    setEditMode(newMode);
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      const store = useEditorStore.getState();
      console.log('✅ Edit mode state after toggle:', { isEditMode: store.isEditMode });
    }, 100);
  };

  const themes = [
    { id: 'minimal-creative', name: 'Minimal Creative' },
    { id: 'fitness-pro', name: 'Fitness Pro' },
    { id: 'lifestyle-blog', name: 'Lifestyle Blog' },
    { id: 'beauty-studio', name: 'Beauty Studio' },
    { id: 'music-stage', name: 'Music Stage' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Theme Switcher & Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/themes"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Back to Themes
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2"
              >
                Change Theme
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showThemeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <div className="absolute top-full mt-2 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 min-w-[200px]">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onThemeChange(theme.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                          currentThemeId === theme.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Edit Mode Toggle */}
            <button
              onClick={handleToggleEditMode}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                isEditMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-200 dark:shadow-purple-900 animate-pulse'
              }`}
              title={isEditMode ? 'Switch to preview mode' : 'Click to enable editing'}
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  Preview Mode
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Enable Edit Mode
                </>
              )}
            </button>
            {!isEditMode && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                Click to edit content
              </span>
            )}

            {/* Save Button - Only show in edit mode */}
            {isEditMode && (
              <button
                onClick={onSaveDraft}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={hasUnsavedChanges ? 'Save changes (Ctrl+S)' : 'All changes saved'}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved ✓'}
              </button>
            )}

            {/* Last saved indicator */}
            {isEditMode && lastSaved && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}

            {/* Optional: Advanced Settings (hide in edit mode) */}
            {!isEditMode && onAdvancedSettings && (
              <button
                onClick={onAdvancedSettings}
                className="px-4 py-2 text-sm font-medium border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Advanced Settings
              </button>
            )}

            {/* Preview Button - Show when NOT in edit mode */}
            {!isEditMode && onPreview && (
              <button
                onClick={onPreview}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            )}

            {plan === 'free' && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">
                Preview Only
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

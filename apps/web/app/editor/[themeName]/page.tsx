'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEditorStore } from '@/lib/store/editor-store';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { loadDefaultContent, mergeContent } from '@/lib/utils/content-loader';
import EditModeToggle from '@/components/editor/EditModeToggle';
import AnonymousEditorBanner from '@/components/editor/AnonymousEditorBanner';
import MinimalCreative from '@/components/themes/minimal-creative';
import BoldPortfolio from '@/components/themes/bold-portfolio';

export default function EditorPage() {
  const params = useParams();
  const themeName = params?.themeName as string;
  const { content, setContent, updateContent, isEditMode, setEditMode } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [siteId, setSiteId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Enable edit mode by default on editor page
  useEffect(() => {
    setEditMode(true);
  }, [setEditMode]);

  // Load user and site info (optional - allow anonymous access)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard/site');
        if (response.ok) {
          const data = await response.json();
          if (data.site) {
            setSiteId(data.site.id);
            setIsAuthenticated(true);
            // Extract user ID from site if needed
          }
        }
      } catch (err) {
        // Allow anonymous access - editor works without auth (just won't save)
        console.log('Anonymous access - editor in preview mode');
        setIsAuthenticated(false);
      }
    };
    fetchUserData();
  }, []);

  // Load content (default + user content)
  useEffect(() => {
    if (!themeName) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        // Load default boilerplate content
        const defaultContent = await loadDefaultContent(themeName);

        // Try to load user's saved content (only if authenticated)
        let userContent = {};
        if (isAuthenticated && siteId) {
          try {
            const response = await fetch(
              `/api/content/load?themeName=${themeName}${siteId ? `&siteId=${siteId}` : ''}`
            );
            if (response.ok) {
              const data = await response.json();
              userContent = data.content || {};
            }
          } catch (err) {
            console.warn('Failed to load user content, using defaults:', err);
          }
        }

        // Merge content (user content takes precedence)
        const mergedContent = mergeContent(defaultContent, userContent);
        setContent(mergedContent);
      } catch (err) {
        console.error('Failed to load content:', err);
        setError('Failed to load content. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [themeName, siteId, setContent]);

  // Auto-save hook (only if authenticated)
  const { saveNow } = useAutoSave({
    userId: userId || 'anonymous',
    siteId: siteId || 'anonymous',
    themeName,
    saveFn: async (contentToSave) => {
      if (!isAuthenticated) {
        console.log('Anonymous user - changes not saved (login required)');
        return; // Don't save for anonymous users
      }
      
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          themeName,
          contentJson: contentToSave,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Render theme component with editable content
  const renderTheme = () => {
    const themeProps = {
      content,
      images: [],
      palette: {},
      isPreview: !isEditMode,
      onContentUpdate: updateContent, // Pass update function to theme
    };

    switch (themeName) {
      case 'minimal-creative':
        return <MinimalCreative {...themeProps} />;
      case 'bold-portfolio':
        return <BoldPortfolio {...themeProps} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Theme "{themeName}" not found.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {!isAuthenticated && <AnonymousEditorBanner />}
      <EditModeToggle onSave={saveNow} />
      {renderTheme()}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/lib/hooks/useTheme';
import { usePlanRestrictions } from '@/lib/hooks/usePlanRestrictions';
import PreviewToolbar from '@/components/theme-preview/PreviewToolbar';
import FloatingToolbar from '@/components/editor/FloatingToolbar';
import TrialBanner from '@/components/TrialBanner';
import UpgradeCTA from '@/components/UpgradeCTA';
import MinimalCreative from '@/components/themes/minimal-creative';
import { useEditorStore } from '@/lib/store/editor-store';
import { loadThemeEditableSchema, getDefaultContentFromSchema } from '@/lib/utils/theme-schema-loader';
import { createAutoSaveHandler, saveContentToSupabase } from '@/lib/utils/auto-save';
import CmsSidebar, { ThemeEditableSchema } from '@/components/cms/CmsSidebar';
// Import other theme components as needed

interface DraftContent {
  headline?: string;
  bio?: string;
  services?: string[];
  socialLinks?: Array<{ platform: string; url: string }>;
  images?: string[];
  [key: string]: any;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;

  return (
    <ThemeProvider themeId={themeId}>
      <PreviewContent themeId={themeId} />
    </ThemeProvider>
  );
}

function PreviewContent({ themeId }: { themeId: string }) {
  const router = useRouter();
  const { theme, loading, error } = useTheme();
  const [draftContent, setDraftContent] = useState<DraftContent>({});
  const [userPlan, setUserPlan] = useState<'free' | 'starter' | 'pro'>('free');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState(themeId);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [themeSchema, setThemeSchema] = useState<ThemeEditableSchema | null>(null);
  const [designSettings, setDesignSettings] = useState({
    font: 'Poppins',
    palette: '',
    logo: null as string | null,
    seoTitle: '',
    seoDescription: '',
  });
  const planRestrictions = usePlanRestrictions(userPlan);
  
  const { 
    setContent, 
    updateContent, 
    setIsSaving: setStoreSaving, 
    setLastSaved,
    markUnsavedChanges,
    isEditMode,
    setEditMode,
  } = useEditorStore();

  // Load theme schema and user content
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userUsername = user?.username;
        
        if (user?.id) {
          setUserId(user.id);
        }

        // Load theme schema
        const loadedSchema = await loadThemeEditableSchema(currentThemeId);
        setThemeSchema(loadedSchema);
        const defaultContent = getDefaultContentFromSchema(loadedSchema);

        // Load user's saved content (works with or without login)
        const url = userUsername 
          ? `/api/dashboard/site?username=${encodeURIComponent(userUsername)}`
          : '/api/dashboard/site';

        let userContent: Record<string, any> = {};
        
        try {
          const siteRes = await fetch(url);
          if (siteRes.ok) {
            const siteData = await siteRes.json();
            if (siteData.success) {
              setSiteId(siteData.site.id);
              setUserPlan(siteData.site.plan || 'free');
              userContent = siteData.site.content || siteData.site.draft_content_json || {};
              setExpiresAt(siteData.site.expires_at || null);
              setUsername(siteData.site.username || userUsername || null);
            }
          } else if (siteRes.status === 401) {
            // User not logged in - use defaults but allow preview
            console.log('Not authenticated, using default content for preview');
          }
        } catch (err) {
          // Network error or other issue - use defaults but allow preview
          console.log('Could not load user site data, using defaults for preview');
        }

        // Merge defaults with user content (preview works even without login)
        const mergedContent = { ...defaultContent, ...userContent };
        
        // Ensure we have content even if schema loading fails
        if (Object.keys(mergedContent).length === 0 && Object.keys(defaultContent).length === 0) {
          // Fallback: at least provide empty content structure
          console.warn('No content available, using minimal defaults');
        }
        
        setDraftContent(mergedContent);
        setContent(mergedContent); // Initialize editor store
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [currentThemeId, setContent]);

  // Load design settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!siteId || !userId) return;

      try {
        const res = await fetch(`/api/dashboard/settings?siteId=${siteId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setDesignSettings({
              font: data.settings.font_family || 'Poppins',
              palette: data.settings.color_palette?.id || '',
              logo: data.settings.logo_url || null,
              seoTitle: data.settings.seo_title || '',
              seoDescription: data.settings.seo_description || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load design settings:', error);
      }
    };

    loadSettings();
  }, [siteId, userId]);

  // Save design settings
  const saveDesignSettings = async (updates: Partial<typeof designSettings>) => {
    if (!siteId || !userId) {
      // Still update local state even if not logged in (for preview)
      setDesignSettings(prev => ({ ...prev, ...updates }));
      return;
    }

    try {
      const newSettings = { ...designSettings, ...updates };
      // Update state immediately for instant UI feedback
      setDesignSettings(newSettings);
      
      await fetch('/api/dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          fontFamily: newSettings.font,
          colorPalette: newSettings.palette ? { id: newSettings.palette } : undefined,
          logoUrl: newSettings.logo,
          seoTitle: newSettings.seoTitle,
          seoDescription: newSettings.seoDescription,
        }),
      });
    } catch (error) {
      console.error('Failed to save design settings:', error);
      // Note: State is already updated optimistically, user can retry if needed
    }
  };

  // Handle section selection - scroll to element and highlight
  const handleSectionSelect = (sectionId: string) => {
    setActiveSectionId(sectionId);
    
    // Find and scroll to the element
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight class
      element.classList.add('outline-blue-400', 'outline-2', 'outline');
      setTimeout(() => {
        element.classList.remove('outline-blue-400', 'outline-2', 'outline');
      }, 2000);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    if (!isEditMode || !themeSchema) return;

    const handleScroll = () => {
      const sections = themeSchema.sections.map((s) => ({
        id: s.id,
        element: document.querySelector(`[data-section-id="${s.id}"]`),
      }));

      // Find the section currently in view
      const viewportMiddle = window.innerHeight / 2;
      let activeSection: string | null = null;

      for (const section of sections) {
        if (!section.element) continue;
        const rect = section.element.getBoundingClientRect();
        if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
          activeSection = section.id;
          break;
        }
      }

      // If no section is centered, find the closest one to the top
      if (!activeSection) {
        let closestDistance = Infinity;
        for (const section of sections) {
          if (!section.element) continue;
          const rect = section.element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < closestDistance) {
            closestDistance = rect.top;
            activeSection = section.id;
          }
        }
      }

      if (activeSection && activeSection !== activeSectionId) {
        setActiveSectionId(activeSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEditMode, themeSchema, activeSectionId]);

  // Set up auto-save - trigger when content changes
  useEffect(() => {
    if (!userId || !isEditMode) return;

    let timeoutId: NodeJS.Timeout;
    
    const autoSave = createAutoSaveHandler({
      onSave: async (content: DraftContent) => {
        try {
          setStoreSaving(true);
          await saveContentToSupabase(userId, currentThemeId, content);
          setLastSaved(new Date());
          markUnsavedChanges(false);
          setDraftContent(content); // Update local state
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setStoreSaving(false);
        }
      },
      delay: 3000, // 3 seconds
    });

    // Subscribe to store changes
    const unsubscribe = useEditorStore.subscribe((state) => {
      if (state.hasUnsavedChanges && isEditMode) {
        // Clear previous timeout
        if (timeoutId) clearTimeout(timeoutId);
        // Trigger auto-save after delay
        timeoutId = setTimeout(() => {
          autoSave(state.content);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, currentThemeId, isEditMode, setStoreSaving, setLastSaved, markUnsavedChanges]);

  const handleThemeChange = (newThemeId: string) => {
    setCurrentThemeId(newThemeId);
    router.push(`/preview/${newThemeId}`);
  };

  const handleSaveDraft = useCallback(async () => {
    if (!userId) {
      alert('Please login to save drafts');
      return;
    }

    setIsSaving(true);
    setStoreSaving(true);
    
    try {
      const currentContent = useEditorStore.getState().content;
      await saveContentToSupabase(userId, currentThemeId, currentContent);
      setLastSaved(new Date());
      markUnsavedChanges(false);
      setDraftContent(currentContent);
      
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
      setStoreSaving(false);
    }
  }, [userId, currentThemeId, setStoreSaving, setLastSaved, markUnsavedChanges]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      if (e.key === 'Escape' && isEditMode) {
        setEditMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, handleSaveDraft, setEditMode]);

  const handleAdvancedSettings = () => {
    setShowAdvancedSettings(true);
  };

  const handlePreview = () => {
    setIsFullscreenPreview(true);
  };

  const handleClosePreview = () => {
    setIsFullscreenPreview(false);
  };

  const handlePreviewInNewTab = () => {
    // Get current site URL if available, or generate preview URL
    if (username) {
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const host = typeof window !== 'undefined' ? window.location.host : '';
      // Remove port for production, keep for localhost
      const cleanHost = host.includes('localhost') ? host : host.split(':')[0];
      // For localhost, use subdomain.localhost format
      // For production, use username.at-solvexx.com format
      const siteUrl = cleanHost.includes('localhost') 
        ? `${protocol}//${username}.${cleanHost}`
        : `${protocol}//${username}.at-solvexx.com`;
      window.open(siteUrl, '_blank');
    } else {
      // Fallback: open current preview in new tab (with fullscreen query param)
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('fullscreen', 'true');
      window.open(currentUrl.toString(), '_blank');
    }
  };

  // Inject Google Fonts based on selected font - MUST be before any early returns
  useEffect(() => {
    if (!designSettings.font) return;

    const fontMap: Record<string, string> = {
      'Poppins': 'Poppins:wght@300;400;500;600;700',
      'Inter': 'Inter:wght@300;400;500;600;700',
      'Lato': 'Lato:wght@300;400;700',
      'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
      'Montserrat': 'Montserrat:wght@300;400;500;600;700',
    };

    const fontFamily = designSettings.font;
    const fontUrl = fontMap[fontFamily] || fontMap['Poppins'];
    
    // Remove existing font link if any
    const existingLink = document.getElementById('google-fonts-link');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new font link
    const link = document.createElement('link');
    link.id = 'google-fonts-link';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}&display=swap`;
    document.head.appendChild(link);

    // Apply font family to root
    document.documentElement.style.setProperty('--theme-font-family', fontFamily);

    return () => {
      const linkToRemove = document.getElementById('google-fonts-link');
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [designSettings.font]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading theme...</p>
        </div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load theme</p>
          <button
            onClick={() => router.push('/themes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Themes
          </button>
        </div>
      </div>
    );
  }

  // Convert palette ID to actual color values
  const getPaletteColors = (paletteId: string) => {
    const COLOR_PALETTES = {
      solid: [
        { id: 'cool-blues', name: 'Cool Blues', colors: ['#0066CC', '#0099FF', '#00CCFF', '#00FFFF', '#0033CC'] },
        { id: 'vibrant-sunset', name: 'Vibrant Sunset', colors: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF1493'] },
        { id: 'earth-tones', name: 'Earth Tones', colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C'] },
        { id: 'pastel-pop', name: 'Pastel Pop', colors: ['#FFB3BA', '#FFCCCB', '#FFFFBA', '#BAE1FF', '#BAFFC9'] },
        { id: 'monochrome', name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'] },
      ],
    };
    
    if (!paletteId) return null;
    
    for (const palette of COLOR_PALETTES.solid) {
      if (palette.id === paletteId) {
        return {
          primary: palette.colors[0] || '#000000',
          secondary: palette.colors[1] || '#666666',
          accent: palette.colors[2] || '#0066cc',
          background: palette.colors[3] || '#ffffff',
          text: palette.colors[4] || '#333333',
        };
      }
    }
    return null;
  };

  // Get palette colors from design settings or fallback to theme default
  const appliedPalette = designSettings.palette 
    ? (getPaletteColors(designSettings.palette) || {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0066cc',
        background: '#ffffff',
        text: '#333333',
      })
    : (theme.colors || {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0066cc',
        background: '#ffffff',
        text: '#333333',
      });

  // Prepare theme props from theme config and draft content
  const themeProps = {
    content: draftContent,
    palette: appliedPalette,
    images: typeof draftContent.images === 'string' ? [draftContent.images] : (Array.isArray(draftContent.images) ? draftContent.images : []),
    isPreview: true,
    userPlan: userPlan,
    fontFamily: designSettings.font || 'Poppins',
    logo: designSettings.logo || null,
  };

  // Fullscreen preview mode - Render as overlay that covers everything including header/footer
  if (isFullscreenPreview) {
    return (
      <>
        {/* Fullscreen overlay */}
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 overflow-auto">
          {/* Close Preview Button */}
          <div className="fixed top-4 right-4 z-[10000] flex gap-2">
            <button
              onClick={handlePreviewInNewTab}
              className="px-3 py-2 text-sm font-medium bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-lg"
              title="Open in new tab"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              New Tab
            </button>
            <button
              onClick={handleClosePreview}
              className="px-4 py-2 text-sm font-medium bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-lg"
              title="Close preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Preview
            </button>
          </div>

          {/* Preview Content - No header/footer, fullscreen */}
          <div className="min-h-screen w-full">
            {currentThemeId === 'minimal-creative' && (
              <MinimalCreative {...themeProps} isPreview={false} />
            )}
            {currentThemeId !== 'minimal-creative' && (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Theme preview for "{theme.name}" coming soon
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Theme component for {currentThemeId} needs to be implemented
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950 flex" style={{ fontFamily: designSettings.font || 'Poppins' }}>
      {/* CMS Sidebar - Only show in edit mode */}
      {isEditMode && themeSchema && (
        <CmsSidebar
          schema={themeSchema}
          activeSectionId={activeSectionId}
          onSectionSelect={handleSectionSelect}
          userPlan={userPlan}
          currentFont={designSettings.font}
          currentPalette={designSettings.palette}
          currentLogo={designSettings.logo || undefined}
          seoTitle={designSettings.seoTitle}
          seoDescription={designSettings.seoDescription}
          onFontChange={(font) => saveDesignSettings({ font })}
          onPaletteChange={(palette, colors) => saveDesignSettings({ palette })}
          onLogoChange={(logo) => saveDesignSettings({ logo })}
          onSeoUpdate={(title, description) => saveDesignSettings({ seoTitle: title, seoDescription: description })}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <PreviewToolbar
          currentThemeId={currentThemeId}
          onThemeChange={handleThemeChange}
          onAdvancedSettings={handleAdvancedSettings}
          onSaveDraft={handleSaveDraft}
          isSaving={isSaving}
          plan={userPlan}
          expiresAt={expiresAt}
          username={username}
          onPreview={handlePreview}
        />
        
        {/* Floating Toolbar for text editing */}
        {isEditMode && <FloatingToolbar onSave={handleSaveDraft} onExit={() => setEditMode(false)} />}

        {/* Preview Content - Offset for toolbar */}
        <div className="pt-16 pb-20 sm:pb-24">
        {currentThemeId === 'minimal-creative' && (
          <MinimalCreative {...themeProps} />
        )}
        {/* Add other theme components here */}
        {currentThemeId !== 'minimal-creative' && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Theme preview for "{theme.name}" coming soon
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Theme component for {currentThemeId} needs to be implemented
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trial Banner - Always visible for free/trial users */}
      <TrialBanner 
        expiryTime={expiresAt} 
        username={username || undefined}
        plan={userPlan}
      />

      {/* Floating Upgrade CTA - Shows when < 3 hours remain */}
      <UpgradeCTA 
        expiryTime={expiresAt} 
        username={username || undefined}
        plan={userPlan}
      />

      {/* Advanced Settings Modal - TODO: Implement */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Advanced Settings
              </h2>
              <button
                onClick={() => setShowAdvancedSettings(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Advanced settings panel (color picker, fonts, etc.) - To be implemented
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

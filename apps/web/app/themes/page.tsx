'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlanRestrictions } from '@/lib/hooks/usePlanRestrictions';

interface Theme {
  id: number;
  slug: string;
  name: string;
  description: string;
  preview_image_url?: string;
  comingSoon?: boolean;
}

export default function ThemesPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<'free' | 'starter' | 'pro'>('free');
  const { features, isFree } = usePlanRestrictions(userPlan);

  // These are the 5 preview themes
  const PREVIEW_THEMES = [
    'minimal-creative',
    'fitness-pro',
    'lifestyle-blog',
    'beauty-studio',
    'music-stage',
  ];

  useEffect(() => {
    const loadThemes = async () => {
      try {
        // Get username from localStorage if available (from signup/login)
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userUsername = user?.username;

        // Fetch user's plan from their site - include username if available
        const url = userUsername 
          ? `/api/dashboard/site?username=${encodeURIComponent(userUsername)}`
          : '/api/dashboard/site';

        const siteRes = await fetch(url);
        
        if (siteRes.ok) {
          const siteData = await siteRes.json();
          if (siteData.success && siteData.site?.plan) {
            setUserPlan(siteData.site.plan);
          }
        } else if (siteRes.status === 401) {
          // User is not authenticated and no username available - this is OK for anonymous browsing
          console.log('Themes page: No authenticated user or username. Using default plan (free).');
        }

        // Fetch all themes
        const themesRes = await fetch('/api/themes');
        const themesData = await themesRes.json();

        if (themesData.success) {
          // Filter to only show the 5 preview themes
          const previewThemes = themesData.themes
            .filter((t: Theme) => PREVIEW_THEMES.includes(t.slug))
            .map((t: any) => ({
              ...t,
              comingSoon: t.comingSoon || false,
            }));
          setThemes(previewThemes);
        }
      } catch (error) {
        console.error('Failed to load themes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, []);

  const handlePreview = (themeSlug: string) => {
    router.push(`/preview/${themeSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Choose Your Theme
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                {isFree ? 'Preview all themes • Upgrade to publish' : 'Select and customize your theme'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isFree && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Free Trial:</strong> You can preview all themes. Upgrade to Starter or Pro to publish your site.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-shadow relative ${
                theme.comingSoon
                  ? 'opacity-60 hover:shadow-lg'
                  : 'hover:shadow-xl'
              }`}
            >
              {theme.comingSoon && (
                <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Coming Soon
                </div>
              )}
              
              {/* Theme Preview Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
                {theme.preview_image_url ? (
                  <>
                    <img
                      src={theme.preview_image_url}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                    {theme.comingSoon && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Coming Soon</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      {theme.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  {theme.name}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  {theme.description}
                </p>

                {/* Preview Button */}
                {theme.comingSoon ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg cursor-not-allowed font-medium"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={() => handlePreview(theme.slug)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Preview & Customize
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No themes available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

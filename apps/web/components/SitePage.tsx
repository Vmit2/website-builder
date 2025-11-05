'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MinimalCreative from '@/components/themes/minimal-creative';
import BoldPortfolio from '@/components/themes/bold-portfolio';
import TrialBanner from '@/components/TrialBanner';
import UpgradeCTA from '@/components/UpgradeCTA';
import { getTimeRemaining } from '@/lib/utils';

interface SiteData {
  id: string;
  username: string;
  theme_slug: string;
  palette_id?: string;
  status: string;
  coming_soon: boolean;
  launch_time?: string;
  expires_at?: string;
  content: Record<string, any>;
  images: string[];
  plan?: string;
}

interface SitePageProps {
  subdomain: string;
}

export default function SitePage({ subdomain }: SitePageProps) {
  const router = useRouter();
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await fetch(`/api/dashboard/site?username=${subdomain}`);
        const data = await response.json();

        if (data.success && data.site) {
          const siteData = data.site;
          setSite(siteData);

          // Check if trial has expired
          if (siteData.expires_at) {
            const now = new Date();
            const expiryDate = new Date(siteData.expires_at);

            if (now > expiryDate && siteData.status !== 'approved') {
              // Redirect to trial expired page
              router.push(`/trial-expired?username=${subdomain}`);
              return;
            }

            // Calculate time remaining
            const remaining = getTimeRemaining(siteData.expires_at);
            setTimeRemaining(remaining);

            // Update countdown every second
            const interval = setInterval(() => {
              const newRemaining = getTimeRemaining(siteData.expires_at);
              setTimeRemaining(newRemaining);

              // If expired, redirect
              if (newRemaining.total <= 0 && siteData.status !== 'approved') {
                clearInterval(interval);
                router.push(`/trial-expired?username=${subdomain}`);
              }
            }, 1000);

            return () => clearInterval(interval);
          }
        } else {
          setError(data.error || 'Site not found');
        }
      } catch (err) {
        console.error('Error fetching site:', err);
        setError('Failed to load site');
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchSite();
    }
  }, [subdomain, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600">{error || 'This site does not exist.'}</p>
        </div>
      </div>
    );
  }

  // Show coming soon page if site is not approved or still in coming soon mode
  if (site.coming_soon || site.status !== 'approved') {
    const launchTime = site.launch_time ? new Date(site.launch_time) : null;
    const now = new Date();
    const hoursRemaining = launchTime
      ? Math.max(0, Math.ceil((launchTime.getTime() - now.getTime()) / (1000 * 60 * 60)))
      : 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {site.content?.headline || `${site.username}'s Portfolio`}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {site.content?.bio || 'Something amazing is coming soon!'}
          </p>
          
          {hoursRemaining > 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Launching in</p>
              <p className="text-4xl font-bold text-blue-600 mb-4">{hoursRemaining} hours</p>
              <p className="text-gray-600">
                We're putting the finishing touches on your portfolio. Check back soon!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <p className="text-gray-600">
                Your portfolio is being reviewed. It will be live soon!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the theme component with trial countdown banner if active
  const themeProps = {
    content: site.content || {},
    images: site.images || [],
    palette: site.palette_id ? {} : undefined, // TODO: Load palette from database
    isPreview: false,
  };

  // Show countdown banner if trial is active (not approved yet but within expiry)
  // Also disable "add image" button for free trial users (bonus feature)
  const showTrialBanner = site.status !== 'approved' && timeRemaining && timeRemaining.total > 0;

  // Determine if user is on free trial
  const isFreeTrial = site.status !== 'approved' || site.plan === 'free' || !site.plan;
  const sitePlan = site.plan || 'free';

  return (
    <div className="relative">
      {/* Trial countdown banner (old style - keep for backward compatibility) */}
      {showTrialBanner && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 text-center shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            <span className="font-semibold">
              ⏳ Launching in 24h – Upgrade for full version
            </span>
            <span className="text-orange-100">•</span>
            <span className="font-semibold">
              {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s remaining
            </span>
            <span className="text-orange-100">•</span>
            <a
              href={`/upgrade?from=${site.username}`}
              className="underline hover:no-underline font-medium bg-white/20 px-3 py-1 rounded"
            >
              Upgrade now
            </a>
          </div>
        </div>
      )}

      {/* Theme content */}
      <div className={isFreeTrial ? 'pb-20 sm:pb-24' : ''}>
        {(() => {
          switch (site.theme_slug) {
            case 'minimal-creative':
              return <MinimalCreative {...themeProps} />;
            case 'bold-portfolio':
              return <BoldPortfolio {...themeProps} />;
            default:
              return <MinimalCreative {...themeProps} />;
          }
        })()}
      </div>

      {/* Persistent Trial Banner - Always visible for free/trial users */}
      {isFreeTrial && (
        <>
          <TrialBanner 
            expiryTime={site.expires_at || undefined} 
            username={site.username}
            plan={sitePlan}
          />
          <UpgradeCTA 
            expiryTime={site.expires_at || undefined} 
            username={site.username}
            plan={sitePlan}
          />
        </>
      )}
    </div>
  );
}

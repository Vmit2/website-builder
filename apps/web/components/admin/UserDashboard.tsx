'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Site {
  id: string;
  username: string;
  themeSlug: string;
  paletteId?: string;
  status: string;
  comingSoon: boolean;
  launchTime?: string;
  content?: {
    headline?: string;
    bio?: string;
    services?: string[];
    socialLinks?: Array<{ platform: string; url: string }>;
  };
}

interface Analytics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export default function UserDashboard({ userId }: { userId: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics'>('overview');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch site data
      const siteResponse = await fetch(`/api/dashboard/site?userId=${userId}`);
      const siteData = await siteResponse.json();

      if (siteData.success) {
        setSite(siteData.site);
      } else {
        setError(siteData.error);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(
        `/api/dashboard/analytics?userId=${userId}&period=7d`
      );
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md">
          <p className="text-red-600 font-medium">{error || 'Site not found'}</p>
        </div>
      </div>
    );
  }

  const siteUrl = `https://${site.username}.brand.com`;
  const trialEndsAt = site.launchTime ? new Date(site.launchTime) : null;
  const hoursRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your portfolio site</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Site Status</h3>
            <p className="text-2xl font-bold text-gray-900 capitalize">{site.status}</p>
            <p className="text-xs text-gray-500 mt-2">
              {site.comingSoon ? 'Coming Soon' : 'Live'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Free Trial</h3>
            <p className="text-2xl font-bold text-gray-900">{hoursRemaining}h</p>
            <p className="text-xs text-gray-500 mt-2">Hours remaining</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Site URL</h3>
            <Link
              href={siteUrl}
              target="_blank"
              className="text-blue-600 hover:underline font-medium truncate"
            >
              {site.username}.brand.com
            </Link>
            <p className="text-xs text-gray-500 mt-2">Visit your site</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {(['overview', 'content', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Theme</h3>
                  <p className="text-gray-600">{site.themeSlug}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Palette</h3>
                  <p className="text-gray-600">{site.paletteId || 'Default'}</p>
                </div>
                <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    defaultValue={site.content?.headline || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    defaultValue={site.content?.bio || ''}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell your story..."
                  />
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {analytics ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Visitors</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.totalVisitors}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unique Visitors</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.uniqueVisitors}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Page Views</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.pageViews}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bounce Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.bounceRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Duration</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.floor(analytics.avgSessionDuration / 60)}m
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No analytics data available yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

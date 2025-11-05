'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteUrl, getSiteDomainSuffix } from '@/lib/utils';

interface Site {
  id: string;
  username: string;
  theme_slug: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, [filter]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/sites?status=${filter === 'all' ? 'all' : filter}`
      );
      const data = await response.json();

      if (data.success) {
        setSites(data.sites);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch sites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (siteId: string) => {
    try {
      const response = await fetch(`/api/admin/sites/${siteId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved' }),
      });

      if (response.ok) {
        // Refresh sites list
        fetchSites();
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleReject = async (siteId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, reason }),
      });

      if (response.ok) {
        fetchSites();
      }
    } catch (err) {
      console.error('Rejection error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No sites found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      <Link
                        href={getSiteUrl(site.username)}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {site.username}{getSiteDomainSuffix()}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {site.user?.full_name} ({site.user?.email})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      site.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : site.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {site.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Theme: {site.theme_slug}</span>
                  <span>
                    Created: {new Date(site.created_at).toLocaleDateString()}
                  </span>
                </div>

                {site.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(site.id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(site.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

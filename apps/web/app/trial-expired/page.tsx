'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSiteDomainSuffix } from '@/lib/utils';

export default function TrialExpiredPage() {
  const searchParams = useSearchParams();
  // Support both 'username' and 'subdomain' query params for backward compatibility
  const username = searchParams.get('subdomain') || searchParams.get('username');
  const [hoursExpired, setHoursExpired] = useState<number>(0);

  useEffect(() => {
    const fetchExpiryInfo = async () => {
      if (!username) return;

      try {
        const response = await fetch(`/api/dashboard/site?username=${username}`);
        const data = await response.json();

        if (data.success && data.site?.expires_at) {
          const expiryDate = new Date(data.site.expires_at);
          const now = new Date();
          const diffMs = now.getTime() - expiryDate.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          setHoursExpired(diffHours);
        }
      } catch (error) {
        console.error('Error fetching expiry info:', error);
      }
    };

    fetchExpiryInfo();
  }, [username]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ⏳ Your Free Trial Has Ended
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            This free trial website has expired. Please upgrade to continue your portfolio journey.
          </p>
          {username && (
            <p className="text-xl text-gray-700 mb-2">
              <span className="font-semibold">{username}</span>
              <span className="text-gray-500">{getSiteDomainSuffix()}</span>
            </p>
          )}
          {hoursExpired > 0 && (
            <p className="text-gray-600 mb-8">
              Your trial expired {hoursExpired} {hoursExpired === 1 ? 'hour' : 'hours'} ago.
            </p>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Why Upgrade?</h2>
          <ul className="text-left text-blue-800 space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Permanent site deployment</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Keep your custom subdomain</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Unlimited customization</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href={username ? `/upgrade?from=${username}` : '/upgrade'}
            className="block w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Upgrade Now
          </Link>
          {username && (
            <Link
              href={`/${username}/dashboard`}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSiteDomainSuffix } from '@/lib/utils';

export default function SubdomainAvailabilityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get('username');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        // Check if subdomain exists
        const response = await fetch(`/api/subdomain/check?username=${username}`);
        const data = await response.json();

        if (data.success !== undefined) {
          setAvailable(data.available);
        }
      } catch (error) {
        console.error('Error checking subdomain:', error);
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Checking availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950 px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 text-center">
        {available === null || !username ? (
          <>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Subdomain Check</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">Please provide a username to check availability.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50 font-medium"
            >
              Go to Home
            </Link>
          </>
        ) : available ? (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Available!
              </h1>
              <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-2">
                <span className="font-semibold">{username}</span>
                <span className="text-zinc-500 dark:text-zinc-400">{getSiteDomainSuffix()}</span>
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Yes, this subdomain name is available. Go to dashboard and claim your free 24-hour trial.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                href="/"
                className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50 font-semibold"
              >
                Go to Dashboard & Claim Your Free Trial
              </Link>
              <button
                onClick={() => router.back()}
                className="block w-full px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Already Taken
              </h1>
              <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-2">
                <span className="font-semibold">{username}</span>
                <span className="text-zinc-500 dark:text-zinc-400">{getSiteDomainSuffix()}</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                This subdomain is already taken. Check name availability on your dashboard or try a different username.
              </p>
            </div>
            <div className="space-y-4">
              <Link
                href="/"
                className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50 font-semibold"
              >
                Go to Dashboard & Try Another Name
              </Link>
              <button
                onClick={() => router.back()}
                className="block w-full px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

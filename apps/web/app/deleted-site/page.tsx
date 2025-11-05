'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DeletedSitePage() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get('subdomain');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Site Removed
          </h1>
          {subdomain && (
            <p className="text-xl text-gray-700 mb-2">
              <span className="font-semibold">{subdomain}.at-solvexx.com</span>
            </p>
          )}
          <p className="text-lg text-gray-600 mb-8">
            This trial has been permanently removed after 48 hours of inactivity.
          </p>
          <p className="text-gray-500 mb-8">
            Don't worry! You can start a new trial anytime and create a fresh portfolio.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50 font-semibold"
          >
            Start a New Trial
          </Link>
          <Link
            href="/upgrade"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View Pricing Plans
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

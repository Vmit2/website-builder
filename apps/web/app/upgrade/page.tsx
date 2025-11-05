'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Support both 'from' and 'username' query params for backward compatibility
export default function UpgradePage() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get('from') || searchParams.get('username');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Portfolio Site
          </h1>
          <p className="text-xl text-gray-600">
            {subdomain ? (
              <>
                Launch <span className="font-semibold">{subdomain}</span> permanently
              </>
            ) : (
              'Choose a plan to upgrade your portfolio'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">₹1,999</span>
              <span className="text-gray-600"> one-time</span>
            </div>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>✓ Permanent site deployment</li>
              <li>✓ Keep your subdomain</li>
              <li>✓ Basic customization</li>
              <li>✓ Email support</li>
            </ul>
            <Link
              href={`/api/dashboard/upgrade?username=${subdomain || ''}&plan=basic`}
              className="block w-full text-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Choose Basic
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
              Popular
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">₹699</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>✓ Everything in Basic</li>
              <li>✓ Advanced customization</li>
              <li>✓ Custom domain</li>
              <li>✓ Priority support</li>
            </ul>
            <Link
              href={`/api/dashboard/upgrade?username=${subdomain || ''}&plan=pro`}
              className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose Pro
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">₹1,499</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-2 mb-6 text-gray-600">
              <li>✓ Everything in Pro</li>
              <li>✓ Advanced customization</li>
              <li>✓ Professional email</li>
              <li>✓ 24/7 priority support</li>
            </ul>
            <Link
              href={`/api/dashboard/upgrade?username=${subdomain || ''}&plan=premium`}
              className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose Premium
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href={subdomain ? `/${subdomain}/dashboard` : '/'}
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


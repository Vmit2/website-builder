'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserDashboard from '@/components/admin/UserDashboard';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from username
    // For now, we'll need to get it from the signup response or localStorage
    // TODO: Implement proper session/auth management
    
    const fetchUserId = async () => {
      try {
        // Try to get user ID from localStorage (stored after signup)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.username === username) {
            setUserId(user.id);
            setLoading(false);
            return;
          }
        }

        // If not in localStorage, try to fetch by username
        // Note: This is a temporary solution. In production, use proper auth
        const response = await fetch(`/api/users?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserId(data.user.id);
            setLoading(false);
            return;
          }
        }

        setError('User not found');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    if (username) {
      fetchUserId();
    } else {
      setError('Invalid username');
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error || 'Unable to load dashboard'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <UserDashboard userId={userId} username={username} />;
}

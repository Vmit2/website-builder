'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, User, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthPopover, setShowAuthPopover] = useState(false);
  const [showUserPopover, setShowUserPopover] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const authPopoverRef = useRef<HTMLDivElement>(null);
  const userPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    // Check if we're on a subdomain (portfolio site)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isOnSubdomain = hostname.includes('.localhost') || (hostname.split('.').length >= 3 && !hostname.startsWith('www.'));
    setIsSubdomain(isOnSubdomain);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authPopoverRef.current && !authPopoverRef.current.contains(event.target as Node)) {
        setShowAuthPopover(false);
      }
      if (userPopoverRef.current && !userPopoverRef.current.contains(event.target as Node)) {
        setShowUserPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user state
        setUser(data.user);
        setShowAuthPopover(false);
        setLoginEmail('');
        setLoginPassword('');
        router.refresh();
      } else {
        setLoginError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setUser(null);
        setShowUserPopover(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Hide header on subdomain routes (portfolio sites)
  if (isSubdomain) {
    return null;
  }

  const displayName = user?.fullName || user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/solvex_logo.png" 
                alt="At-Solvexx Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                At-Solvexx
              </span>
            </button>
          </div>

          {/* Right side: Theme Toggle + Auth */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Theme toggle button clicked, current theme from context:', theme);
                toggleTheme();
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
              type="button"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              // Logged in: User icon with popover
              <div className="relative" ref={userPopoverRef}>
                <button
                  onClick={() => setShowUserPopover(!showUserPopover)}
                  onMouseEnter={() => setShowUserPopover(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {displayName}
                  </span>
                </button>

                {/* User Popover */}
                {showUserPopover && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        router.push(`/${user.username}/dashboard`);
                        setShowUserPopover(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in: Login button with login form popover
              <div className="relative" ref={authPopoverRef}>
                <button
                  onClick={() => setShowAuthPopover(!showAuthPopover)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>

                {/* Login Form Popover */}
                {showAuthPopover && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Sign In
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enter your credentials to access your account
                        </p>
                      </div>

                      <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Email
                            </label>
                            <input
                              id="login-email"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="your@email.com"
                            />
                          </div>

                          <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Password
                            </label>
                            <input
                              id="login-password"
                              type="password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>

                          {loginError && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                              {loginError}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoggingIn ? 'Signing in...' : 'Sign In'}
                          </button>
                        </div>
                      </form>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                          Don't have an account?{' '}
                          <button
                            onClick={() => {
                              setShowAuthPopover(false);
                              router.push('/');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Register / Start Free Trial
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

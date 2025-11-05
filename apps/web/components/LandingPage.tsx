'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { cn, getSiteDomainSuffix } from '@/lib/utils';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
  });

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || (typeof window !== 'undefined' ? (window as any).__RECAPTCHA_SITE_KEY__ : undefined);

  // Log site key status (for debugging)
  useEffect(() => {
    console.log('🔍 reCAPTCHA Debug:', {
      hasSiteKey: !!recaptchaSiteKey,
      siteKeyLength: recaptchaSiteKey?.length || 0,
      siteKeyPrefix: recaptchaSiteKey?.substring(0, 10) || 'N/A',
      hasWindow: typeof window !== 'undefined',
      hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha,
    });
    
    if (!recaptchaSiteKey) {
      console.warn('⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set or not available on client side');
      console.warn('💡 Make sure:');
      console.warn('   1. Variable is in apps/web/.env.local');
      console.warn('   2. Variable starts with NEXT_PUBLIC_');
      console.warn('   3. Dev server was restarted after adding the variable');
    } else {
      console.log('🔑 reCAPTCHA site key loaded:', recaptchaSiteKey.substring(0, 10) + '...');
    }
  }, [recaptchaSiteKey]);

  // Check if reCAPTCHA is ready (simpler approach)
  useEffect(() => {
    if (!recaptchaSiteKey) {
      console.warn('⚠️ Cannot initialize reCAPTCHA: site key not set');
      return;
    }

    const checkRecaptchaReady = () => {
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.execute) {
        console.log('✅ reCAPTCHA is ready');
        setRecaptchaReady(true);
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkRecaptchaReady()) return;

    // Poll for reCAPTCHA to be available (script might load after component mounts)
    const interval = setInterval(() => {
      if (checkRecaptchaReady()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds (timeout)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!recaptchaReady) {
        console.warn('⚠️ reCAPTCHA did not load within 10 seconds');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [recaptchaSiteKey, recaptchaReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Verify reCAPTCHA v3
      if (!recaptchaSiteKey) {
        setError('reCAPTCHA not configured. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Verify reCAPTCHA is configured
      if (!recaptchaSiteKey) {
        setError('reCAPTCHA not configured. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Check if reCAPTCHA is loaded - try to wait for it if not ready
      if (!window.grecaptcha) {
        console.error('❌ reCAPTCHA script not loaded', {
          hasWindow: typeof window !== 'undefined',
          hasGrecaptcha: typeof window !== 'undefined' && !!window.grecaptcha,
          scriptInDOM: typeof document !== 'undefined' && !!document.getElementById('recaptcha-script'),
        });
        
        // Check if script tag exists but grecaptcha isn't initialized yet
        const scriptTag = typeof document !== 'undefined' ? document.querySelector('script[src*="recaptcha/api.js"]') : null;
        if (scriptTag) {
          console.warn('⚠️ reCAPTCHA script tag exists but window.grecaptcha is undefined - script may still be loading');
          setError('reCAPTCHA is still loading. Please wait a few seconds and try again.');
        } else {
          setError('reCAPTCHA failed to load. Please refresh the page and check your network connection.');
        }
        setIsLoading(false);
        return;
      }

      // If execute doesn't exist, wait a bit and try again
      if (!window.grecaptcha.execute) {
        console.warn('reCAPTCHA execute() not available yet, waiting...');
        // Wait up to 2 seconds for execute to become available
        let attempts = 0;
        const maxAttempts = 20; // 20 * 100ms = 2 seconds
        
        while (!window.grecaptcha.execute && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.grecaptcha.execute) {
          console.error('reCAPTCHA execute() still not available after waiting');
          setError('reCAPTCHA failed to initialize. Please refresh the page and try again.');
          setIsLoading(false);
          return;
        }
      }

      let recaptchaToken: string;
      let recaptchaScore: number = 0;

      try {
        console.log('🔐 Executing reCAPTCHA...', {
          siteKey: recaptchaSiteKey?.substring(0, 10) + '...',
          hasExecute: !!window.grecaptcha.execute,
        });
        
        // Use Promise with timeout for execute call
        recaptchaToken = await Promise.race([
          window.grecaptcha.execute(recaptchaSiteKey, {
            action: 'trial_signup',
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('reCAPTCHA execution timeout')), 5000)
          )
        ]) as string;
        
        console.log('✅ reCAPTCHA token received');

        // Verify token with backend
        const recaptchaResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: recaptchaToken,
            email: formData.email,
            username: formData.username,
          }),
        });

        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
          setError(recaptchaData.error || 'Suspicious activity detected. Please try again.');
          setIsLoading(false);
          return;
        }

        recaptchaScore = recaptchaData.score;
      } catch (recaptchaError) {
        console.error('reCAPTCHA error:', recaptchaError);
        setError('reCAPTCHA verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 2: Send OTP email
      const sendOtpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          recaptcha_score: recaptchaScore,
        }),
      });

      const otpData = await sendOtpResponse.json();

      if (!sendOtpResponse.ok) {
        setError(otpData.error || 'Failed to send verification email. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 3: Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Load reCAPTCHA v3 script */}
      {recaptchaSiteKey ? (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
            id="recaptcha-script"
          onLoad={() => {
            console.log('📜 reCAPTCHA script loaded');
            // Check multiple times since grecaptcha might initialize asynchronously
            const checkInitialized = (attempt: number = 1) => {
              if (window.grecaptcha) {
                if (window.grecaptcha.execute) {
                  console.log('✅ reCAPTCHA initialized (attempt', attempt, ')');
                  setRecaptchaReady(true);
                } else if (window.grecaptcha.ready) {
                  // Use ready() callback if available
                  window.grecaptcha.ready(() => {
                    console.log('✅ reCAPTCHA initialized via ready() callback');
                    setRecaptchaReady(true);
                  });
                } else if (attempt < 10) {
                  // Keep checking up to 10 times (1 second total)
                  setTimeout(() => checkInitialized(attempt + 1), 100);
                } else {
                  console.warn('⚠️ reCAPTCHA script loaded but execute() not available after 1 second');
                  // Set ready anyway - we'll check in handleSubmit
                  setRecaptchaReady(true);
                }
              } else if (attempt < 10) {
                setTimeout(() => checkInitialized(attempt + 1), 100);
              } else {
                console.error('❌ reCAPTCHA script loaded but window.grecaptcha is undefined');
              }
            };
            
            // Start checking after a short delay
            setTimeout(() => checkInitialized(), 100);
          }}
          onError={() => {
            console.error('❌ Failed to load reCAPTCHA script');
            setError('Failed to load reCAPTCHA. Please refresh the page.');
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            .grecaptcha-badge {
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `
        }} />
        </>
      ) : (
        <script
          dangerouslySetInnerHTML={{
            __html: `console.error('⚠️ reCAPTCHA Site Key not found! Check NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local');`,
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
        {/* Navigation */}
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  At-Solvexx
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

                 {/* Hero Section */}
         <section className="relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
             <div className="text-center">
               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6">
                 Create Your Portfolio
                 <br />
                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   In Minutes
                 </span>
               </h1>
               <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-3xl mx-auto">
                 Build a stunning portfolio website with our free 24-hour trial. No credit card required.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <button
                   onClick={() => {
                     document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
                   }}
                   className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50"
                 >
                   Start Free Trial
                 </button>
                 <button
                   onClick={() => {
                     router.push('/themes');
                   }}
                   className="px-8 py-4 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                 >
                   View Demo →
                 </button>
                 <button
                   onClick={() => {
                     document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                   }}
                   className="px-8 py-4 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                 >
                   Learn More
                 </button>
               </div>
             </div>
           </div>
         </section>

         {/* Features Section */}
         <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
           <div className="max-w-7xl mx-auto">
             <h2 className="text-4xl sm:text-5xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-16">
               Everything You Need to Stand Out
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 {
                   title: 'Instant Subdomain',
                   description: `Get your portfolio live at username${getSiteDomainSuffix()} in seconds. No DNS configuration needed.`,
                   icon: '🚀',
                 },
                 {
                   title: '24-Hour Free Trial',
                   description: 'Try everything free for 24 hours. No credit card required. Cancel anytime.',
                   icon: '✨',
                 },
                 {
                   title: '10+ Beautiful Themes',
                   description: 'Choose from professionally designed themes. Customize colors and content with ease.',
                   icon: '🎨',
                 },
                 {
                   title: 'Easy Customization',
                   description: 'Drag-and-drop interface to customize your portfolio. No coding skills required.',
                   icon: '⚡',
                 },
                 {
                   title: 'Mobile Responsive',
                   description: 'All themes are fully responsive and look great on any device.',
                   icon: '📱',
                 },
                 {
                   title: 'Admin Approval',
                   description: 'Get your site reviewed and approved by our team to ensure quality.',
                   icon: '✅',
                 },
               ].map((feature, index) => (
                 <div
                   key={index}
                   className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:shadow-lg transition-shadow"
                 >
                   <div className="text-4xl mb-4">{feature.icon}</div>
                   <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                     {feature.title}
                   </h3>
                   <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                 </div>
               ))}
             </div>
           </div>
         </section>

         {/* Signup Form Section */}
        <section id="signup" className="py-16 bg-white dark:bg-zinc-900">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 text-center">
                Start Your Free Trial
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
                Verify your email to begin creating your portfolio
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Username (for your subdomain)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="username"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                      className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-l-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="johndoe"
                      pattern="[a-z0-9]{3,30}"
                    />
                    <span className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-l-0 border-zinc-300 dark:border-zinc-700 rounded-r-lg text-zinc-600 dark:text-zinc-400 text-sm">
                      {getSiteDomainSuffix()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    3-30 characters, lowercase letters and numbers only
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                {!recaptchaReady && recaptchaSiteKey && !error && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      🔒 Initializing security check... Please wait a moment.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (!!recaptchaSiteKey && typeof window !== 'undefined' && !window.grecaptcha)}
                  className={cn(
                    'w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50',
                    (isLoading || (!!recaptchaSiteKey && typeof window !== 'undefined' && !window.grecaptcha)) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isLoading
                    ? 'Sending Verification Email...'
                    : !!recaptchaSiteKey && typeof window !== 'undefined' && !window.grecaptcha
                      ? 'Loading Security Check...'
                      : 'Start Free Trial'}
                </button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                  <br />
                  Protected by reCAPTCHA. Privacy & Terms
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-zinc-600 dark:text-zinc-400">
                  © {new Date().getFullYear()} At-Solvexx. All rights reserved.
                </p>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Terms
                </a>
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Privacy
                </a>
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { motion } from 'framer-motion';
import {
  Globe,
  Palette,
  FileText,
  BarChart3,
  Edit3,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { cn, getSiteDomainSuffix } from '@/lib/utils';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface Plan {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  price_yearly_cents?: number | null;
  interval: 'one_time' | 'monthly';
  features: string[];
  highlighted?: boolean;
  cta_label?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

const features = [
  {
    icon: Globe,
    title: 'Custom Domain + Email',
    description: 'Connect your own domain and get professional email addresses',
  },
  {
    icon: Palette,
    title: 'Logo & Brand Kit',
    description: 'Upload your logo and create a consistent brand identity',
  },
  {
    icon: FileText,
    title: 'Blog + SEO Tools',
    description: 'Built-in blogging platform with SEO optimization features',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track visitors, engagement, and performance metrics',
  },
  {
    icon: Edit3,
    title: 'CMS Editor',
    description: 'Easy-to-use content management system with live preview',
  },
  {
    icon: Clock,
    title: '24h Free Trial',
    description: 'Try all features risk-free for 24 hours, no credit card required',
  },
];

function SignupForm({ 
  selectedPlan, 
  onPlanChange 
}: { 
  selectedPlan: string | null; 
  onPlanChange: (plan: string | null) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
  });

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Scroll to signup when plan is selected
  useEffect(() => {
    if (selectedPlan && typeof window !== 'undefined') {
      setTimeout(() => {
        document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        setRecaptchaReady(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!recaptchaSiteKey) {
        setError('reCAPTCHA not configured. Please contact support.');
        setIsLoading(false);
        return;
      }

      if (!window.grecaptcha) {
        console.error('❌ reCAPTCHA script not loaded');
        setError('reCAPTCHA is loading. Please wait a moment and try again.');
        setIsLoading(false);
        return;
      }

      // Wait for execute to be available
      if (!window.grecaptcha.execute) {
        console.warn('⚠️ reCAPTCHA execute() not available yet, waiting...');
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!window.grecaptcha.execute && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.grecaptcha.execute) {
          console.error('❌ reCAPTCHA execute() still not available');
          setError('reCAPTCHA failed to initialize. Please refresh the page.');
          setIsLoading(false);
          return;
        }
      }

      console.log('🔐 Executing reCAPTCHA (SignupForm)...');
      const recaptchaToken = await Promise.race([
        window.grecaptcha.execute(recaptchaSiteKey, {
          action: 'trial_signup',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('reCAPTCHA execution timeout')), 5000)
        )
      ]) as string;
      console.log('✅ reCAPTCHA token received (SignupForm)');

      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const sendOtpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          recaptchaScore: recaptchaData.score,
        }),
      });

      const otpData = await sendOtpResponse.json();

      if (otpData.success) {
        const queryParams = new URLSearchParams({
          email: formData.email,
          username: formData.username,
        });
        if (selectedPlan) {
          queryParams.set('plan', selectedPlan);
        }
        router.push(`/verify-email?${queryParams.toString()}`);
      } else {
        setError(otpData.error || 'Failed to send verification email. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Username (for your subdomain)
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="username"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
              })
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="johndoe"
            pattern="[a-z0-9]{3,30}"
          />
          <span className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
            {getSiteDomainSuffix()}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          3-30 characters, lowercase letters and numbers only
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Name (Optional)
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending Verification Email...' : 'Start Free Trial'}
      </button>
    </form>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [animatedSubdomain, setAnimatedSubdomain] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    fetchPlans();
    fetchFAQs();
    animateSubdomain();
    
    // Check for plan parameter in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const plan = urlParams.get('plan');
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        setRecaptchaReady(true);
      });
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faqs');
      const data = await response.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const animateSubdomain = () => {
    const subdomain = 'username.at-solvexx.com';
    let index = 0;
    const interval = setInterval(() => {
      if (index < subdomain.length) {
        setAnimatedSubdomain(subdomain.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handlePlanClick = (planSlug: string) => {
    // Update URL with plan parameter and scroll to signup
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/?plan=${planSlug}`);
      setSelectedPlan(planSlug);
      setTimeout(() => {
        const signupSection = document.getElementById('signup');
        if (signupSection) {
          signupSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess(false);

    try {
      // Verify reCAPTCHA
      if (!recaptchaSiteKey) {
        setContactError('reCAPTCHA not configured.');
        setContactLoading(false);
        return;
      }

      if (!window.grecaptcha) {
        setContactError('reCAPTCHA is loading. Please wait and try again.');
        setContactLoading(false);
        return;
      }

      // Wait for execute if needed
      if (!window.grecaptcha.execute) {
        let attempts = 0;
        while (!window.grecaptcha.execute && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (!window.grecaptcha.execute) {
          setContactError('reCAPTCHA failed to initialize. Please refresh.');
          setContactLoading(false);
          return;
        }
      }

      console.log('🔐 Executing reCAPTCHA (ContactForm)...');
      const recaptchaToken = await Promise.race([
        window.grecaptcha.execute(recaptchaSiteKey, {
          action: 'contact_submit',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('reCAPTCHA execution timeout')), 5000)
        )
      ]) as string;
      console.log('✅ reCAPTCHA token received (ContactForm)');

      // Verify token with backend
      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const recaptchaData = await recaptchaResponse.json();
      if (!recaptchaData.success) {
        setContactError('reCAPTCHA verification failed. Please try again.');
        setContactLoading(false);
        return;
      }

      // Submit contact form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          recaptchaScore: recaptchaData.score,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        setContactError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setContactError('An error occurred. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {recaptchaSiteKey && (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
            id="recaptcha-script-homepage"
          onLoad={() => {
            console.log('📜 reCAPTCHA script loaded (HomePage)');
            const checkInitialized = (attempt: number = 1) => {
              if (window.grecaptcha) {
                if (window.grecaptcha.execute) {
                  console.log('✅ reCAPTCHA initialized (HomePage, attempt', attempt, ')');
                  // Set ready for both SignupForm and contact form
                  setRecaptchaReady(true);
                } else if (window.grecaptcha.ready) {
                  window.grecaptcha.ready(() => {
                    console.log('✅ reCAPTCHA initialized via ready() callback (HomePage)');
                    setRecaptchaReady(true);
                  });
                } else if (attempt < 10) {
                  setTimeout(() => checkInitialized(attempt + 1), 100);
                } else {
                  console.warn('⚠️ reCAPTCHA loaded but execute() not available after 1s');
                  setRecaptchaReady(true); // Set anyway, will check in submit
                }
              } else if (attempt < 10) {
                setTimeout(() => checkInitialized(attempt + 1), 100);
              } else {
                console.error('❌ reCAPTCHA script loaded but window.grecaptcha is undefined');
              }
            };
            setTimeout(() => checkInitialized(), 100);
          }}
          onError={() => {
            console.error('❌ Failed to load reCAPTCHA script');
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
      )}

      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-50" />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="relative max-w-7xl mx-auto text-center z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6"
            >
              Create your portfolio in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                5 mins
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
            >
              Professional portfolio websites for influencers and freelancers.
              <br />
              <span className="text-lg text-gray-500 mt-2 block">
                Get your site live at{' '}
                <span className="font-mono text-blue-600 font-semibold">
                  {animatedSubdomain || 'username.at-solvexx.com'}
                  {!animatedSubdomain && <span className="animate-pulse">▋</span>}
                </span>
              </span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => router.push('/#signup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/50 text-lg"
              >
                Start Free Trial →
              </button>
              <button
                onClick={() => router.push('/themes')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-lg"
              >
                View Demo
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the plan that's right for you. Upgrade or downgrade anytime.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={cn(
                    'px-6 py-2 rounded-md font-medium transition-all',
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={cn(
                    'px-6 py-2 rounded-md font-medium transition-all relative',
                    billingCycle === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, index) => {
                  const price =
                    billingCycle === 'yearly' && plan.price_yearly_cents
                      ? plan.price_yearly_cents
                      : plan.price_cents;
                  const isYearly = billingCycle === 'yearly' && plan.interval === 'monthly';

                  return (
                    <motion.div
                      key={plan.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'relative bg-white dark:bg-gray-800 rounded-2xl border-2 dark:border-gray-700 p-8 transition-all hover:shadow-xl',
                        plan.highlighted
                          ? 'border-blue-600 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      )}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                        <div className="mb-4">
                          <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(price)}
                          </span>
                          {isYearly && plan.price_yearly_cents && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">/year</span>
                          )}
                          {!isYearly && plan.interval === 'monthly' && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                          )}
                          {plan.interval === 'one_time' && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2 block text-sm mt-1">one-time</span>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handlePlanClick(plan.slug)}
                        className={cn(
                          'w-full py-3 rounded-lg font-semibold transition-all',
                          plan.highlighted
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                      >
                        {plan.cta_label || 'Get Started'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Signup Section */}
        <section id="signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-8"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Start Your Free Trial
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Get your portfolio live in minutes. No credit card required.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg"
            >
              <SignupForm selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                All the tools and features to create a stunning portfolio
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need to know about our platform
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                    }
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-gray-100 pr-4">{faq.question}</span>
                    <ArrowRight
                      className={cn(
                        'w-5 h-5 text-gray-500 transition-transform flex-shrink-0',
                        expandedFaq === faq.id && 'rotate-90'
                      )}
                    />
                  </button>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Have a question? We're here to help
              </p>
              <p className="text-sm text-gray-500 mt-2">
                We'll respond within 24 hours
              </p>
            </motion.div>

            <motion.form
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              onSubmit={handleContactSubmit}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg"
            >
              {contactSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  Thank you! We'll get back to you within 24 hours.
                </div>
              )}
              {contactError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {contactError}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </motion.form>
          </div>
        </section>

        {/* Floating Chat Button */}
        <motion.a
          href="mailto:support@at-solvexx.com"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
          aria-label="Contact us"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.a>
      </div>
    </>
  );
}

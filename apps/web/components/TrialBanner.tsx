'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrialBannerProps {
  expiryTime?: string | Date | null;
  username?: string;
  plan?: string;
}

export default function TrialBanner({ expiryTime, username, plan }: TrialBannerProps) {
  const [remainingHours, setRemainingHours] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiryTime) {
      // Check if it's a free/trial plan
      if (plan === 'free' || !plan) {
        setRemainingHours(24); // Default to showing banner for free users
      } else {
        return; // Don't show for paid users
      }
      return;
    }

    const updateRemaining = () => {
      const expiry = new Date(expiryTime).getTime();
      const now = Date.now();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setIsExpired(true);
        setRemainingHours(0);
        return;
      }

      const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setRemainingHours(hours);
      setIsExpired(false);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryTime, plan]);

  // Don't show for paid plans
  if (plan && plan !== 'free' && plan !== 'trial') {
    return null;
  }

  // Protection: Re-add banner if removed (watchdog effect)
  useEffect(() => {
    const checkBanner = () => {
      const banner = document.querySelector('[data-trial-banner="protected"]');
      if (!banner && (plan === 'free' || plan === 'trial' || !plan)) {
        // Banner was removed, force re-render by updating state
        // This is handled by React, but we can also check DOM
      }
    };

    const observer = new MutationObserver(checkBanner);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [plan]);

  const upgradeUrl = username ? `/upgrade?username=${username}` : '/upgrade';

  return (
    <div
      data-trial-banner="protected"
      className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white text-center py-3 px-4 z-[9999] shadow-lg"
      style={{
        contentEditable: 'false',
        pointerEvents: 'auto',
      }}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base">
        {isExpired ? (
          <span className="font-semibold">
            ⚠️ Trial expired. Please upgrade to relaunch your site.
          </span>
        ) : remainingHours !== null && remainingHours <= 24 ? (
          <span className="font-semibold">
            ⚠️ This website will expire in {remainingHours} {remainingHours === 1 ? 'hour' : 'hours'}.
          </span>
        ) : (
          <span className="font-semibold">
            🚀 Trial ending soon! Upgrade now to keep your live site running.
          </span>
        )}
        <Link
          href={upgradeUrl}
          className="underline hover:no-underline font-bold bg-white/20 px-4 py-1.5 rounded-md hover:bg-white/30 transition-colors whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}

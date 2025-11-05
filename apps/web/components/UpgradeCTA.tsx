'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpgradeCTAProps {
  expiryTime?: string | Date | null;
  username?: string;
  plan?: string;
}

export default function UpgradeCTA({ expiryTime, username, plan }: UpgradeCTAProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [remainingHours, setRemainingHours] = useState<number | null>(null);

  useEffect(() => {
    // Don't show for paid plans
    if (plan && plan !== 'free' && plan !== 'trial') {
      setShow(false);
      return;
    }

    if (!expiryTime) {
      // For free users without expiry, don't show
      setShow(false);
      return;
    }

    const checkRemaining = () => {
      const expiry = new Date(expiryTime).getTime();
      const now = Date.now();
      const remaining = expiry - now;
      
      const hours = remaining / (1000 * 60 * 60);
      setRemainingHours(hours);

      // Show if less than 3 hours remaining and not expired
      if (hours <= 3 && hours > 0) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    checkRemaining();
    const interval = setInterval(checkRemaining, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [expiryTime, plan]);

  if (!show) {
    return null;
  }

  const upgradeUrl = username ? `/upgrade?username=${username}` : '/upgrade';

  const handleClick = () => {
    // Optional: Track analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'trial_cta_clicked', {
        remaining_hours: remainingHours?.toFixed(1),
      });
    }
    router.push(upgradeUrl);
  };

  // Track when CTA is shown
  useEffect(() => {
    if (show && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'trial_cta_shown', {
        remaining_hours: remainingHours?.toFixed(1),
      });
    }
  }, [show, remainingHours]);

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none rounded-full px-6 py-3 text-sm sm:text-base font-semibold shadow-lg cursor-pointer z-[10000] transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse sm:animate-none hover:animate-none"
      style={{
        animation: 'pulse 2s infinite',
      }}
      data-upgrade-cta="protected"
      contentEditable={false}
      suppressContentEditableWarning
    >
      🔥 {remainingHours && remainingHours < 1 
        ? `Trial ending in ${Math.floor((remainingHours || 0) * 60)}m — Upgrade Now`
        : 'Trial ending soon — Upgrade Now'}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(236, 72, 153, 0.7);
          }
        }
        @media (max-width: 768px) {
          button {
            bottom: 100px;
            right: 50%;
            transform: translateX(50%);
          }
        }
      `}</style>
    </button>
  );
}

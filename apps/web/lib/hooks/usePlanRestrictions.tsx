'use client';

import { useMemo } from 'react';

export type Plan = 'free' | 'starter' | 'pro';

export interface PlanFeatures {
  maxThemes: number; // -1 for unlimited
  maxImages: number; // -1 for unlimited
  canDragDrop: boolean;
  colorPalette: 'limited' | 'full';
  customFonts: boolean;
  blogSeo: boolean;
  analytics: 'none' | 'basic' | 'advanced';
  customDomain: boolean;
  email: boolean;
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    maxThemes: 5, // preview only
    maxImages: 5, // pre-uploaded only
    canDragDrop: true, // limited sections
    colorPalette: 'limited',
    customFonts: false,
    blogSeo: false,
    analytics: 'none',
    customDomain: false,
    email: false,
  },
  starter: {
    maxThemes: 5, // can publish 1
    maxImages: 10,
    canDragDrop: true,
    colorPalette: 'full',
    customFonts: true,
    blogSeo: true,
    analytics: 'basic',
    customDomain: true,
    email: true,
  },
  pro: {
    maxThemes: -1, // unlimited + publish all
    maxImages: -1, // unlimited
    canDragDrop: true,
    colorPalette: 'full',
    customFonts: true,
    blogSeo: true,
    analytics: 'advanced',
    customDomain: true,
    email: true,
  },
};

export function usePlanRestrictions(plan: Plan = 'free') {
  const features = useMemo(() => PLAN_FEATURES[plan], [plan]);

  const canUseFeature = (feature: keyof PlanFeatures): boolean => {
    const value = features[feature];

    if (typeof value === 'boolean') {
      return value;
    }

    if (feature === 'maxThemes' || feature === 'maxImages') {
      return (value as number) > 0 || (value as number) === -1;
    }

    return value !== 'none' && value !== 'limited';
  };

  const checkImageLimit = (currentCount: number): { allowed: boolean; remaining: number } => {
    if (features.maxImages === -1) {
      return { allowed: true, remaining: -1 };
    }

    const remaining = features.maxImages - currentCount;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  };

  const checkThemeLimit = (currentCount: number): { allowed: boolean; remaining: number } => {
    if (features.maxThemes === -1) {
      return { allowed: true, remaining: -1 };
    }

    const remaining = features.maxThemes - currentCount;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  };

  return {
    plan,
    features,
    canUseFeature,
    checkImageLimit,
    checkThemeLimit,
    isFree: plan === 'free',
    isStarter: plan === 'starter',
    isPro: plan === 'pro',
    // Image editing permissions
    canEditImages: plan !== 'free', // Starter and Pro can edit images
    canUploadImages: plan === 'pro', // Only Pro can upload custom images
  };
}

// Helper function for toast messages
export function getFeatureRestrictionMessage(plan: Plan, feature: string): string {
  const upgradeMessage = plan === 'free' 
    ? 'Upgrade to Starter or Pro to use this feature!'
    : 'Upgrade to Pro to use this feature!';

  return `${feature} is not available on your current plan. ${upgradeMessage}`;
}

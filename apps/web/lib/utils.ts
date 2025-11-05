import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate username format (a-z0-9, 3-30 chars)
 */
export function validateUsername(username: string): boolean {
  const regex = /^[a-z0-9]{3,30}$/;
  return regex.test(username);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Generate a unique preview token
 */
export function generatePreviewToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate trial expiry time (24 hours from now)
 */
export function getTrialExpiryTime(): Date {
  const now = new Date();
  now.setHours(now.getHours() + 24);
  return now;
}

/**
 * Check if we're in development mode (works on both client and server)
 */
function isDevelopment(): boolean {
  // Client-side check
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
  }
  // Server-side check
  return process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL?.includes('at-solvexx.com');
}

/**
 * Get site URL for a username (local development uses .localhost, production uses .at-solvexx.com)
 */
export function getSiteUrl(username: string): string {
  if (isDevelopment()) {
    return `http://${username}.localhost:3000`;
  }
  return `https://${username}.at-solvexx.com`;
}

/**
 * Get site domain suffix (for display purposes)
 */
export function getSiteDomainSuffix(): string {
  if (isDevelopment()) {
    return '.localhost';
  }
  return '.at-solvexx.com';
}

/**
 * Format currency in INR
 */
export function formatINR(cents: number): string {
  const rupees = cents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
}

/**
 * Calculate time remaining until expiry
 */
export function getTimeRemaining(expiryTime: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiryTime).getTime();
  const total = expiry - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
}

/**
 * Format countdown display
 */
export function formatCountdown(expiryTime: string): string {
  const { hours, minutes, seconds } = getTimeRemaining(expiryTime);
  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return hash === signature;
}

/**
 * Generate SVG logo from initials
 */
export function generateLogoSVG(
  initials: string,
  primaryColor: string = '#3B82F6',
  secondaryColor: string = '#1E40AF'
): string {
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="20" fill="url(#grad)" />
      <text x="100" y="120" font-size="80" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">
        ${initials.toUpperCase()}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Extract color palette from image URL using Cloudinary
 */
export async function extractPaletteFromImage(
  imageUrl: string
): Promise<string[] | null> {
  try {
    // This would integrate with Cloudinary's color extraction API
    // For MVP, returning null to use preset palettes
    return null;
  } catch (error) {
    console.error('Error extracting palette:', error);
    return null;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(launchTime: string): boolean {
  const now = new Date();
  const expiry = new Date(launchTime);
  expiry.setHours(expiry.getHours() + 24);
  return now > expiry;
}

/**
 * Generate unique subdomain
 */
export async function generateUniqueSubdomain(
  baseUsername: string,
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  let username = baseUsername.toLowerCase();

  // Check if username is available
  let exists = await checkExists(username);
  let counter = 1;

  while (exists && counter < 100) {
    username = `${baseUsername}${counter}`;
    exists = await checkExists(username);
    counter++;
  }

  if (exists) {
    throw new Error('Unable to generate unique username');
  }

  return username;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

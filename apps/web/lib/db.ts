import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations (with service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database type definitions
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  user_id: string;
  username: string;
  theme_slug: string;
  palette_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  coming_soon: boolean;
  launch_time?: string;
  content: Record<string, any>;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: number;
  slug: string;
  name: string;
  description: string;
  demo_url: string;
  preview_image_url?: string;
  created_at: string;
}

export interface ImageLibrary {
  id: string;
  theme_id: number;
  url: string;
  alt_text: string;
  category: string;
  created_at: string;
}

export interface Plan {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  interval: 'one_time' | 'monthly';
  features: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  site_id: string;
  plan_id: number;
  razorpay_subscription_id?: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for common database operations

/**
 * Get tenant by subdomain (username)
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Site | null> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('username', subdomain)
      .single();

    if (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }

    return data as Site;
  } catch (error) {
    console.error('Unexpected error in getTenantBySubdomain:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error in getUserByEmail:', error);
    return null;
  }
}

/**
 * Get all themes
 */
export async function getThemes(): Promise<Theme[]> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching themes:', error);
      return [];
    }

    return data as Theme[];
  } catch (error) {
    console.error('Unexpected error in getThemes:', error);
    return [];
  }
}

/**
 * Get theme by slug
 */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching theme:', error);
      return null;
    }

    return data as Theme;
  } catch (error) {
    console.error('Unexpected error in getThemeBySlug:', error);
    return null;
  }
}

/**
 * Get image library for a theme
 */
export async function getImageLibraryByTheme(themeId: number): Promise<ImageLibrary[]> {
  try {
    const { data, error } = await supabase
      .from('image_library')
      .select('*')
      .eq('theme_id', themeId)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching image library:', error);
      return [];
    }

    return data as ImageLibrary[];
  } catch (error) {
    console.error('Unexpected error in getImageLibraryByTheme:', error);
    return [];
  }
}

/**
 * Get all plans
 */
export async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return data as Plan[];
  } catch (error) {
    console.error('Unexpected error in getPlans:', error);
    return [];
  }
}

/**
 * Get pending sites (for admin)
 */
export async function getPendingSites(): Promise<Site[]> {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending sites:', error);
      return [];
    }

    return data as Site[];
  } catch (error) {
    console.error('Unexpected error in getPendingSites:', error);
    return [];
  }
}

/**
 * Approve a site (admin only)
 */
export async function approveSite(siteId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('sites')
      .update({
        status: 'approved',
        coming_soon: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (error) {
      console.error('Error approving site:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in approveSite:', error);
    return false;
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating audit log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in createAuditLog:', error);
    return false;
  }
}

import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin, User } from './db';

/**
 * Authentication utilities for API routes
 */

/**
 * Get user from request (via Authorization header or cookie)
 */
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Check for token in cookie
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['auth-token'] || null;
      }
    }

    if (!token) {
      return null;
    }

    // Verify token with Supabase Auth
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !authUser) {
      return null;
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return null;
    }

    return user as User;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Check if user is admin or super_admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    return user?.role === 'admin' || user?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require authentication - returns user or throws error
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require admin access - returns user or throws error
 */
export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request);
  
  const isAdminUser = await isAdmin(user.id);
  if (!isAdminUser) {
    throw new Error('Forbidden - Admin access required');
  }
  
  return user;
}

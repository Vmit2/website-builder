// Supabase Edge Function: cleanup-otps
// Cleans up expired OTP codes from users table
// Run via Supabase Scheduler (cron: */30 * * * *) every 30 minutes
// Note: This code runs in Deno runtime (not Node.js)
// TypeScript errors about Deno can be ignored - they work in Supabase Edge Functions

// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
// @ts-ignore - Deno runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  try {
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date().toISOString();

    // Clean up expired OTPs
    const { data, error } = await supabase
      .from('users')
      .update({
        otp_code: null,
        otp_expires_at: null,
      })
      .not('otp_expires_at', 'is', null)
      .lte('otp_expires_at', now)
      .select('id');

    if (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return new Response(
        JSON.stringify({
          error: 'Database error',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanedCount = data?.length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned ${cleanedCount} expired OTPs`,
        cleaned: cleanedCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

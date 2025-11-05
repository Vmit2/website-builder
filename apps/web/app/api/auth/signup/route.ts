import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { validateUsername, validateEmail, generatePreviewToken, getTrialExpiryTime } from '@/lib/utils';

// Simple rate limiting (in production, use Redis)
const signupAttempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = signupAttempts.get(ip) || [];
  
  // Keep only attempts from last 15 minutes
  const recentAttempts = attempts.filter((time) => now - time < 15 * 60 * 1000);
  
  if (recentAttempts.length >= 5) {
    return true;
  }
  
  signupAttempts.set(ip, [...recentAttempts, now]);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, username, fullName } = body;

    // Validation
    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required.' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        {
          error:
            'Username must be 3-30 characters, lowercase letters and numbers only.',
        },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified, signup_stage')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      // If user exists but email not verified, allow resending OTP
      if (!existingUser.email_verified || existingUser.signup_stage !== 'verified') {
        return NextResponse.json(
          { error: 'Email not verified. Please verify your email first.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Email or username already exists.' },
        { status: 409 }
      );
    }

    // Check if user exists and email is verified before creating site
    const { data: verifiedUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified, signup_stage')
      .eq('email', email)
      .single();

    if (!verifiedUser || !verifiedUser.email_verified || verifiedUser.signup_stage !== 'verified') {
      return NextResponse.json(
        { error: 'Email verification required. Please verify your email first.' },
        { status: 403 }
      );
    }

    // Create user (should already exist from verification step)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        full_name: fullName || '',
        role: 'user',
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('Error creating user:', userError);
      
      // Provide helpful error messages
      if (userError?.code === 'PGRST205' || userError?.message?.includes('relation') || userError?.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database tables not found. Please ensure the database schema has been run in Supabase.',
            details: 'Run docs/schema.sql in your Supabase SQL Editor to create the required tables.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create user.', details: userError?.message },
        { status: 500 }
      );
    }

    // Create site record with 24-hour trial expiry
    const previewToken = generatePreviewToken();
    const launchTime = getTrialExpiryTime();
    const expiresAt = new Date(launchTime); // expires_at = launch_time (24 hours from now)

    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .insert({
        user_id: user.id,
        username: username,
        theme_slug: 'minimal-creative', // Default theme
        status: 'pending',
        coming_soon: true,
        launch_time: launchTime.toISOString(),
        expires_at: expiresAt.toISOString(), // 24-hour trial expiry
        content: {
          headline: `Welcome to ${fullName || username}'s portfolio`,
          bio: 'Your portfolio is ready to be customized.',
        },
      })
      .select()
      .single();

    if (siteError || !site) {
      console.error('Error creating site:', siteError);
      return NextResponse.json(
        { error: 'Failed to create site.' },
        { status: 500 }
      );
    }

    // TODO: Trigger n8n workflow for subdomain provisioning and email
    // POST to n8n webhook with user and site data

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        site: {
          id: site.id,
          username: site.username,
          previewToken,
          launchTime: site.launch_time,
        },
        message: 'Signup successful! Your free trial has started.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

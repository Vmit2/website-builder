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
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists.' },
        { status: 409 }
      );
    }

    // Create user
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
      return NextResponse.json(
        { error: 'Failed to create user.' },
        { status: 500 }
      );
    }

    // Create site record
    const previewToken = generatePreviewToken();
    const launchTime = getTrialExpiryTime();

    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .insert({
        user_id: user.id,
        username: username,
        theme_slug: 'minimal-creative', // Default theme
        status: 'pending',
        coming_soon: true,
        launch_time: launchTime.toISOString(),
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

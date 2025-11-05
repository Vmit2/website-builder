import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * POST /api/auth/send-otp
 * Sends OTP verification email to user
 * Requires email and user_id, or creates user first
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, user_id, username, fullName, recaptcha_score } = body;

    console.log('📧 Send OTP request received:', {
      email,
      hasUserId: !!user_id,
      username,
      hasRecaptchaScore: recaptcha_score !== undefined,
    });

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    let userId = user_id;

    // If no user_id, create user first
    if (!userId) {
      if (!username) {
        return NextResponse.json(
          { error: 'Username is required when creating new user' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user
        // Try with email verification fields first, fall back to basic if columns don't exist
        let userData: any = {
          email,
          username,
          full_name: fullName || '',
          role: 'user',
          email_verified: false,
          signup_stage: 'email_pending',
        };

        if (recaptcha_score !== undefined) {
          userData.recaptcha_score = recaptcha_score;
        }

        let { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert(userData)
          .select()
          .single();

        // If columns don't exist, try without email verification fields
        if (userError && (userError.message?.includes('column') && userError.message?.includes('does not exist'))) {
          console.warn('Email verification columns not found. Using basic user creation. Run migration: docs/migrations/add_email_verification_fields.sql');
          
          userData = {
            email,
            username,
            full_name: fullName || '',
            role: 'user',
          };

          const retryResult = await supabaseAdmin
            .from('users')
            .insert(userData)
            .select()
            .single();

          newUser = retryResult.data;
          userError = retryResult.error;
        }

        if (userError || !newUser) {
          console.error('Error creating user:', userError);
          
          // Check for missing columns error
          if (userError?.message?.includes('column') && userError?.message?.includes('does not exist')) {
            return NextResponse.json(
              { 
                error: 'Database schema needs to be updated. Please run the email verification migration.',
                details: 'Run docs/migrations/add_email_verification_fields.sql in Supabase SQL Editor'
              },
              { status: 500 }
            );
          }

          // Check for table not found error
          if (userError?.code === 'PGRST205' || userError?.message?.includes('relation') || userError?.message?.includes('does not exist')) {
            return NextResponse.json(
              { 
                error: 'Database tables not found. Please ensure the database schema has been run.',
                details: 'Run docs/schema.sql in your Supabase SQL Editor to create the required tables.'
              },
              { status: 500 }
            );
          }

          return NextResponse.json(
            { error: 'Failed to create user', details: userError?.message },
            { status: 500 }
          );
        }

        userId = newUser.id;
      }
    }

    // Call Supabase Edge Function to send OTP (or use Resend API directly)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasResendApiKey: !!resendApiKey,
    });

    // Try Edge Function first, fall back to direct Resend API if function doesn't exist
    let otpSent = false;
    let expiresAt: string | null = null;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/send-otp`;

        const functionResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email,
            user_id: userId,
          }),
        });

        if (functionResponse.ok) {
          const functionData = await functionResponse.json();
          otpSent = true;
          expiresAt = functionData.expiresAt || null;
        } else {
          const errorData = await functionResponse.json().catch(() => ({}));
          console.warn('Edge Function failed, trying direct API:', errorData);
        }
      } catch (e) {
        console.warn('Edge Function not available, using direct API:', e);
      }
    }

    // Fallback: Use Resend API directly if Edge Function doesn't exist
    if (!otpSent && resendApiKey) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database (if columns exist)
      try {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt.toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          // If columns don't exist, log warning but continue
          if (updateError.message?.includes('column') && updateError.message?.includes('does not exist')) {
            console.warn('OTP columns not found. OTP will be sent but not stored. Run migration: docs/migrations/add_email_verification_fields.sql');
          } else {
            console.error('Failed to save OTP:', updateError);
          }
          // Continue anyway - try to send email
        }
      } catch (e) {
        console.warn('Could not save OTP to database, continuing with email send:', e);
      }

      // Send email via Resend
      try {
        if (!resendApiKey) {
          console.error('❌ RESEND_API_KEY is not set');
          return NextResponse.json(
            { 
              error: 'Email service not configured', 
              details: 'RESEND_API_KEY environment variable is missing. Please add it to your .env.local file.'
            },
            { status: 500 }
          );
        }

        // Get from email address (use env var or default)
        // For development, you can use Resend's test domain: onboarding@resend.dev
        // For production, use your verified domain: noreply@yourdomain.com
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'At-Solvexx <onboarding@resend.dev>';

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject: 'Verify Your Email - At-Solvexx',
            html: `
              <h2>Verify Your Email</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${otpCode}</h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            `,
          }),
        });

        if (emailResponse.ok) {
          const responseData = await emailResponse.json().catch(() => ({}));
          console.log('✅ OTP email sent successfully:', responseData);
          otpSent = true;
          expiresAt = otpExpiresAt.toISOString();
        } else {
          const errorData = await emailResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.error('❌ Resend API error:', {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: errorData,
          });
          return NextResponse.json(
            { 
              error: 'Failed to send OTP email', 
              details: errorData?.message || errorData || 'Resend API returned an error',
              statusCode: emailResponse.status
            },
            { status: 500 }
          );
        }
      } catch (e: any) {
        console.error('❌ Exception sending email:', e);
        return NextResponse.json(
          { 
            error: 'Failed to send OTP email', 
            details: e?.message || 'Unknown error occurred',
            stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
          },
          { status: 500 }
        );
      }
    }

    if (!otpSent) {
      return NextResponse.json(
        { 
          error: 'OTP service not configured. Please set up Resend API or Supabase Edge Function.',
          details: 'Add RESEND_API_KEY to your environment variables or deploy the send-otp Edge Function.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      user_id: userId,
      expiresAt: expiresAt,
    });
  } catch (error: any) {
    console.error('❌ Send OTP error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

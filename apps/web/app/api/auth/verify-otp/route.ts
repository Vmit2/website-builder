import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and marks email as verified
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Find user with matching email and OTP
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (user.otp_expires_at) {
      const expiresAt = new Date(user.otp_expires_at);
      const now = new Date();

      if (now > expiresAt) {
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }
    }

    // Update user: mark email as verified, clear OTP, update signup stage
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        signup_stage: 'verified',
        otp_code: null,
        otp_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Send welcome email (optional)
    try {
      await resend.emails.send({
        from: 'Solvexx <no-reply@at-solvexx.com>',
        to: email,
        subject: 'Welcome to Solvexx 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Welcome to Solvexx!</h2>
            <p style="color: #666; font-size: 16px;">Your email has been verified successfully.</p>
            <p style="color: #666; font-size: 16px;">You're all set to create your 24-hour free trial portfolio site.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://at-solvexx.com'}/themes" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Choose Your Theme
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">Happy building! 🎨</p>
          </div>
        `,
      });
    } catch (emailError) {
      // Log but don't fail if welcome email fails
      console.warn('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        email_verified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

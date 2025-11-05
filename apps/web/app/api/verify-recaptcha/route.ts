import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/verify-recaptcha
 * Verifies Google reCAPTCHA v3 token and returns score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, username } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA not configured' },
        { status: 500 }
      );
    }

    // Verify token with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json(
        {
          success: false,
          score: verifyData.score || 0,
          error: 'reCAPTCHA verification failed',
          details: verifyData['error-codes'],
        },
        { status: 400 }
      );
    }

    // Check score threshold (0.5 is recommended)
    const score = verifyData.score || 0;
    const threshold = 0.5;

    if (score < threshold) {
      return NextResponse.json(
        {
          success: false,
          score,
          error: 'Suspicious activity detected',
        },
        { status: 400 }
      );
    }

    // Success - return score for storage
    return NextResponse.json({
      success: true,
      score,
      action: verifyData.action,
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

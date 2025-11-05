import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * POST /api/contact - Submit contact form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaScore } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Save to database
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        recaptcha_score: recaptchaScore || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contact message:', error);
      return NextResponse.json(
        { error: 'Failed to submit message. Please try again.' },
        { status: 500 }
      );
    }

    // TODO: Trigger email notification to admin via Supabase Edge Function or Resend
    // For now, we'll just log it
    console.log('New contact message received:', { id: data.id, email });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We\'ll get back to you within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

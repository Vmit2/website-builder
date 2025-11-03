import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * POST /api/dashboard/upgrade - Initiate plan upgrade
 * Creates Razorpay subscription and returns order details
 */

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { planSlug } = body;

    if (!planSlug) {
      return NextResponse.json(
        { error: 'Plan slug is required.' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found.' },
        { status: 404 }
      );
    }

    // Get user's site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // TODO: Create Razorpay subscription using Razorpay API
    // For MVP, return mock order details
    const mockOrderId = `order_${Date.now()}`;

    // Store subscription record (status: pending_payment)
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        site_id: site.id,
        plan_id: plan.id,
        status: 'pending_payment',
      });

    if (subError) {
      console.error('Error creating subscription record:', subError);
      return NextResponse.json(
        { error: 'Failed to initiate upgrade.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        razorpayOrderId: mockOrderId,
        amount: plan.price_cents,
        currency: 'INR',
        planName: plan.name,
        planDescription: plan.description,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

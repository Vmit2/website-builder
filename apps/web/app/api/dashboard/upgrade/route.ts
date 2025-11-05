import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createRazorpayOrder, createRazorpaySubscription } from '@/lib/razorpay';

/**
 * POST /api/dashboard/upgrade - Initiate plan upgrade
 * Creates Razorpay subscription and returns order details
 */

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const { data: plan, error: planError } = await supabaseAdmin
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
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // Create Razorpay order/subscription
    let razorpayOrderId: string | null = null;
    let razorpaySubscriptionId: string | null = null;

    if (plan.interval === 'one_time') {
      // One-time payment (Basic plan)
      const order = await createRazorpayOrder(plan.price_cents, 'INR', `site_${site.id}`);
      if (!order) {
        return NextResponse.json(
          { error: 'Failed to create payment order. Please try again.' },
          { status: 500 }
        );
      }
      razorpayOrderId = order.id;
    } else {
      // Monthly subscription (Pro/Premium plans)
      // Note: Requires Razorpay plan_id in database or create plan on-the-fly
      const subscription = await createRazorpaySubscription(
        `plan_${plan.slug}`, // This should match Razorpay plan ID
        user.email || '',
        user.full_name || user.username
      );
      if (!subscription) {
        return NextResponse.json(
          { error: 'Failed to create subscription. Please try again.' },
          { status: 500 }
        );
      }
      razorpaySubscriptionId = subscription.id;
    }

    // Store subscription record (status: pending_payment)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        site_id: site.id,
        plan_id: plan.id,
        status: 'pending_payment',
        razorpay_subscription_id: razorpaySubscriptionId,
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
        razorpayOrderId,
        razorpaySubscriptionId,
        amount: plan.price_cents,
        currency: 'INR',
        plan: {
          id: plan.id,
          slug: plan.slug,
          name: plan.name,
          interval: plan.interval,
        },
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
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

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/utils';

/**
 * Razorpay webhook handler
 * Handles payment events: payment.authorized, subscription.activated, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const body = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature.' },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!verifyRazorpaySignature(body, signature, secret)) {
      return NextResponse.json(
        { error: 'Invalid signature.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log(`Processing Razorpay event: ${eventType}`);

    switch (eventType) {
      case 'subscription.activated': {
        const subscriptionId = payload.subscription.entity.id;
        const planId = payload.subscription.entity.plan_id;

        // Update subscription in DB
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            razorpay_subscription_id: subscriptionId,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription.' },
            { status: 500 }
          );
        }

        // TODO: Send confirmation email to user
        // TODO: Check if site is approved, if so set coming_soon=false
        // TODO: Trigger n8n workflow for optional static export

        break;
      }

      case 'subscription.paused': {
        const subscriptionId = payload.subscription.entity.id;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'paused',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // TODO: Send pause notification email

        break;
      }

      case 'subscription.cancelled': {
        const subscriptionId = payload.subscription.entity.id;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        // TODO: Send cancellation email
        // TODO: Optionally set coming_soon=true if not approved

        break;
      }

      case 'payment.failed': {
        // TODO: Send payment failure notification
        console.log('Payment failed:', payload);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

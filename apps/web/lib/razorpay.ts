/**
 * Razorpay payment integration utilities
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

/**
 * Create Razorpay order for one-time payment
 */
export async function createRazorpayOrder(
  amount: number, // in paise (smallest currency unit)
  currency: string = 'INR',
  receipt?: string
): Promise<{ id: string; amount: number; currency: string } | null> {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return null;
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          description: 'Portfolio subscription payment',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Razorpay API error:', error);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

/**
 * Create Razorpay subscription
 */
export async function createRazorpaySubscription(
  planId: string,
  customerEmail: string,
  customerName?: string
): Promise<{ id: string; status: string } | null> {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return null;
    }

    // First create/retrieve customer
    const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        email: customerEmail,
        name: customerName || customerEmail,
      }),
    });

    let customerId: string;
    if (customerResponse.ok) {
      const customerData = await customerResponse.json();
      customerId = customerData.id;
    } else {
      // Try to find existing customer
      const searchResponse = await fetch(
        `https://api.razorpay.com/v1/customers?email=${encodeURIComponent(customerEmail)}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
          },
        }
      );
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.items && searchData.items.length > 0) {
          customerId = searchData.items[0].id;
        } else {
          console.error('Could not create or find customer');
          return null;
        }
      } else {
        console.error('Error searching for customer');
        return null;
      }
    }

    // Create subscription
    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 months for monthly plans
        notes: {
          description: 'Portfolio subscription',
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text();
      console.error('Razorpay subscription API error:', error);
      return null;
    }

    const subscriptionData = await subscriptionResponse.json();
    return {
      id: subscriptionData.id,
      status: subscriptionData.status,
    };
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    return null;
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = RAZORPAY_KEY_SECRET
): boolean {
  try {
    const crypto = require('crypto');
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
}

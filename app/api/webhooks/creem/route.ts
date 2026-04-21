import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');

    // Verify webhook signature
    if (process.env.CREEM_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case 'checkout.completed':
        console.log('Payment successful!', {
          checkoutId: event.data.id,
          customerId: event.data.customer_id,
          productId: event.data.product_id,
        });
        // TODO: Grant access, send email, update database
        break;

      case 'subscription.created':
        console.log('New subscription:', event.data);
        // TODO: Activate subscription in database
        break;

      case 'subscription.canceled':
        console.log('Subscription canceled:', event.data);
        // TODO: Revoke access
        break;

      case 'subscription.renewed':
        console.log('Subscription renewed:', event.data);
        // TODO: Extend access period
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

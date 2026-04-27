import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      case 'checkout.completed': {
        console.log('Payment successful!', event.data);
        const oneTimeProductId = process.env.NEXT_PUBLIC_CREEM_ONE_TIME_PRODUCT_ID;
        const isOneTime = event.data.product_id === oneTimeProductId;
        const proUntil = isOneTime
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;
        await supabase.from('user_subscriptions').upsert({
          user_id: event.data.customer_email || event.data.customer_id,
          email: event.data.customer_email,
          customer_id: event.data.customer_id,
          product_id: event.data.product_id,
          status: 'active',
          ...(proUntil && { pro_until: proUntil }),
        });
        break;
      }

      case 'subscription.created':
        console.log('New subscription:', event.data);
        await supabase.from('user_subscriptions').upsert({
          user_id: event.data.customer_email || event.data.customer_id,
          email: event.data.customer_email,
          customer_id: event.data.customer_id,
          subscription_id: event.data.id,
          product_id: event.data.product_id,
          status: 'active',
          current_period_start: event.data.current_period_start,
          current_period_end: event.data.current_period_end,
        });
        break;

      case 'subscription.canceled':
        console.log('Subscription canceled:', event.data);
        await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('subscription_id', event.data.id);
        break;

      case 'subscription.renewed':
        console.log('Subscription renewed:', event.data);
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            current_period_start: event.data.current_period_start,
            current_period_end: event.data.current_period_end,
          })
          .eq('subscription_id', event.data.id);
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

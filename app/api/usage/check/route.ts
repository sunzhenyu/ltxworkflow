import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { feature } = await request.json(); // 'prompt_enhancer' or 'workflow_generator'

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', canUse: false },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    const today = new Date().toISOString().split('T')[0];

    // Check subscription status
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If user has active subscription or valid one-time purchase, allow unlimited usage
    if (subscription?.status === 'active') {
      const now = new Date();
      const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      const proUntil = subscription.pro_until ? new Date(subscription.pro_until) : null;

      if ((periodEnd && periodEnd > now) || (proUntil && proUntil > now)) {
        return NextResponse.json({
          canUse: true,
          isPro: true,
          usageCount: 0,
          limit: -1, // unlimited
        });
      }
    }

    // Check today's usage for free users
    const { data: usage } = await supabase
      .from('usage_records')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    const currentCount = usage?.usage_count || 0;

    if (currentCount >= FREE_DAILY_LIMIT) {
      return NextResponse.json({
        canUse: false,
        isPro: false,
        usageCount: currentCount,
        limit: FREE_DAILY_LIMIT,
        message: `You've reached your daily limit of ${FREE_DAILY_LIMIT} uses. Subscribe to get unlimited access.`,
      });
    }

    // Increment usage count
    const { error: upsertError } = await supabase
      .from('usage_records')
      .upsert({
        user_id: userId,
        feature,
        usage_date: today,
        usage_count: currentCount + 1,
      }, {
        onConflict: 'user_id,feature,usage_date',
      });

    if (upsertError) {
      console.error('Error updating usage:', upsertError);
    }

    return NextResponse.json({
      canUse: true,
      isPro: false,
      usageCount: currentCount + 1,
      limit: FREE_DAILY_LIMIT,
      remaining: FREE_DAILY_LIMIT - (currentCount + 1),
    });
  } catch (error) {
    console.error('Check usage error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage', canUse: false },
      { status: 500 }
    );
  }
}

// GET endpoint to check current usage without incrementing
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (!session?.user?.email || !feature) {
      return NextResponse.json(
        { error: 'Unauthorized', canUse: false },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    const today = new Date().toISOString().split('T')[0];

    // Check subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subscription?.status === 'active') {
      const now = new Date();
      const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      const proUntil = subscription.pro_until ? new Date(subscription.pro_until) : null;

      if ((periodEnd && periodEnd > now) || (proUntil && proUntil > now)) {
        return NextResponse.json({
          canUse: true,
          isPro: true,
          usageCount: 0,
          limit: -1,
        });
      }
    }

    // Check usage
    const { data: usage } = await supabase
      .from('usage_records')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    const currentCount = usage?.usage_count || 0;

    return NextResponse.json({
      canUse: currentCount < FREE_DAILY_LIMIT,
      isPro: false,
      usageCount: currentCount,
      limit: FREE_DAILY_LIMIT,
      remaining: Math.max(0, FREE_DAILY_LIMIT - currentCount),
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage', canUse: false },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { data: usage } = await supabase
      .from('usage_records')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    const currentCount = usage?.usage_count || 0;

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
      limit: -1,
    });
  } catch (error) {
    console.error('Check usage error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage', canUse: false },
      { status: 500 }
    );
  }
}

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

    const { data: usage } = await supabase
      .from('usage_records')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('usage_date', today)
      .single();

    const currentCount = usage?.usage_count || 0;

    return NextResponse.json({
      canUse: true,
      isPro: false,
      usageCount: currentCount,
      limit: -1,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage', canUse: false },
      { status: 500 }
    );
  }
}

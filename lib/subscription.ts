import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ProStatus = {
  isPro: boolean;
  source: 'subscription' | 'one_time' | null;
  expiresAt: string | null;
};

export async function getProStatus(): Promise<ProStatus> {
  const session = await auth();
  if (!session?.user?.email) {
    return { isPro: false, source: null, expiresAt: null };
  }

  const { data: sub } = await adminClient
    .from('user_subscriptions')
    .select('status, current_period_end, pro_until')
    .eq('user_id', session.user.email)
    .single();

  if (!sub || sub.status !== 'active') {
    return { isPro: false, source: null, expiresAt: null };
  }

  const now = new Date();
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
  const proUntil = sub.pro_until ? new Date(sub.pro_until) : null;

  if (periodEnd && periodEnd > now) {
    return { isPro: true, source: 'subscription', expiresAt: sub.current_period_end };
  }
  if (proUntil && proUntil > now) {
    return { isPro: true, source: 'one_time', expiresAt: sub.pro_until };
  }
  return { isPro: false, source: null, expiresAt: null };
}

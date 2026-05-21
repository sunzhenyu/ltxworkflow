import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const apiKey = process.env.CREEM_API_KEY;
  const productId = request.nextUrl.searchParams.get('productId');

  if (!apiKey) {
    return NextResponse.json({ error: 'CREEM_API_KEY not configured' }, { status: 500 });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  // Require sign-in BEFORE going to Creem. Without this we'd have no way to
  // tie a paid checkout back to a user: the webhook only knows what Creem
  // gives us (customer_email + metadata), so the user must hit checkout from
  // an authenticated session and we must lock the email to their account.
  const session = await auth();
  if (!session?.user?.email) {
    const origin = request.nextUrl.origin;
    const callback = encodeURIComponent(`/checkout?productId=${productId}`);
    return NextResponse.redirect(`${origin}/sign-in?callbackUrl=${callback}`);
  }
  const userEmail = session.user.email;

  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        customer: { email: userEmail },
        metadata: { user_email: userEmail },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ltxworkflow.com'}/success`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create checkout', details: data }, { status: response.status });
    }

    const checkoutUrl = data.checkout_url || data.url || data.redirect_url;
    if (checkoutUrl) {
      return NextResponse.redirect(checkoutUrl);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

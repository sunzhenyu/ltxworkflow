import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.CREEM_API_KEY;
  const productId = request.nextUrl.searchParams.get('productId');

  if (!apiKey) {
    return NextResponse.json({ error: 'CREEM_API_KEY not configured' }, { status: 500 });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ltxworkflow.com'}/success`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create checkout', details: data }, { status: response.status });
    }

    // Redirect to Creem checkout URL
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

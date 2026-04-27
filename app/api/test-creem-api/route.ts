import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  // Try different authentication methods
  const authMethods = [
    { name: 'Bearer token', headers: { 'Authorization': `Bearer ${apiKey}` } },
    { name: 'X-API-Key header', headers: { 'X-API-Key': apiKey } },
    { name: 'Api-Key header', headers: { 'Api-Key': apiKey } },
    { name: 'apiKey header', headers: { 'apiKey': apiKey } },
  ];

  const results = [];

  for (const method of authMethods) {
    try {
      const headers: Record<string, string> = {
        ...method.headers,
        'Content-Type': 'application/json',
      };

      const response = await fetch('https://api.creem.io/v1/products', {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      results.push({
        method: method.name,
        success: response.ok,
        status: response.status,
        data: data,
      });
    } catch (error) {
      results.push({
        method: method.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({ results });
}

export async function POST() {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Test creating a checkout session
    const response = await fetch('https://api.creem.io/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID,
        successUrl: 'https://ltxworkflow.com/success',
        cancelUrl: 'https://ltxworkflow.com/pricing',
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : null,
      stack: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
}

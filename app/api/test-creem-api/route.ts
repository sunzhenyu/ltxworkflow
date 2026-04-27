import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const authMethods: Array<{ name: string; headers: Record<string, string> }> = [
    { name: 'Bearer token', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } },
    { name: 'X-API-Key header', headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' } },
    { name: 'Api-Key header', headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' } },
    { name: 'apiKey header', headers: { 'apiKey': apiKey, 'Content-Type': 'application/json' } },
  ];

  const results = [];

  for (const method of authMethods) {
    try {
      const response = await fetch('https://api.creem.io/v1/products', {
        method: 'GET',
        headers: method.headers,
      });
      const data = await response.json();
      results.push({ method: method.name, success: response.ok, status: response.status, data });
    } catch (error) {
      results.push({ method: method.name, error: error instanceof Error ? error.message : 'Unknown error' });
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
    const response = await fetch('https://api.creem.io/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID,
        successUrl: 'https://ltxworkflow.com/success',
        cancelUrl: 'https://ltxworkflow.com/pricing',
      }),
    });
    const data = await response.json();
    return NextResponse.json({ success: response.ok, status: response.status, data });
  } catch (error) {
    return NextResponse.json({
      error: 'Fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

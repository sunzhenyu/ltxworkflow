import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Try to fetch Creem API directly
    const response = await fetch('https://api.creem.io/v1/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
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

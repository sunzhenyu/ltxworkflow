import { Checkout } from '@creem_io/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Validate environment variables
const apiKey = process.env.CREEM_API_KEY;

if (!apiKey || apiKey === 'your_creem_api_key_here') {
  console.error('CREEM_API_KEY is not configured properly');
}

export async function GET(request: NextRequest) {
  try {
    // Log for debugging
    console.log('Checkout request received');
    console.log('API Key configured:', !!apiKey && apiKey !== 'your_creem_api_key_here');

    const handler = Checkout({
      apiKey: apiKey!,
      testMode: true,
      defaultSuccessUrl: '/success',
    });

    return handler(request);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
        configured: !!apiKey && apiKey !== 'your_creem_api_key_here'
      },
      { status: 500 }
    );
  }
}

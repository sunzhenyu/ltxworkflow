import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  const productId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID;

  return NextResponse.json({
    creem_configured: {
      api_key: !!apiKey && apiKey !== 'your_creem_api_key_here' ? 'configured' : 'missing or placeholder',
      webhook_secret: !!webhookSecret && webhookSecret !== 'your_webhook_secret_here' ? 'configured' : 'missing or placeholder',
      product_id: !!productId && productId !== 'your_product_id_here' ? productId : 'missing or placeholder',
    },
    api_key_length: apiKey?.length || 0,
    api_key_prefix: apiKey?.substring(0, 10) || 'none',
  });
}

'use client';

import { CreemCheckout } from '@creem_io/nextjs';

export default function SubscribeButton({ productId, label }: { productId: string; label?: string }) {
  return (
    <CreemCheckout productId={productId}>
      <button className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
        {label || 'Subscribe Now →'}
      </button>
    </CreemCheckout>
  );
}

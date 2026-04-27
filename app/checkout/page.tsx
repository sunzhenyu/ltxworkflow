'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (!productId) {
      router.push('/pricing');
      return;
    }

    // Redirect to Creem checkout API
    window.location.href = `/api/checkout?productId=${productId}`;
  }, [productId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
        <p className="text-gray-400">Redirecting to checkout...</p>
      </div>
    </div>
  );
}

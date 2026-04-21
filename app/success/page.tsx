import { Suspense } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

function SuccessContent({
  searchParams
}: {
  searchParams: {
    checkout_id?: string;
    order_id?: string;
    customer_id?: string;
    product_id?: string;
  }
}) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/workflows" />

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-extrabold text-green-400">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-400 max-w-md">
          Thank you for subscribing to LTX Workflow Pro. You now have access to premium features and workflows.
        </p>

        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 max-w-md">
          <p className="text-sm text-yellow-400 font-medium">
            ⚠️ Refund Policy
          </p>
          <p className="text-xs text-gray-400 mt-1">
            All payments are final. We do not offer refunds for any subscriptions. You can cancel your subscription at any time to prevent future charges.
          </p>
        </div>

        {searchParams.checkout_id && (
          <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-400 space-y-1">
            <p>Order ID: <span className="text-violet-400 font-mono">{searchParams.order_id}</span></p>
            <p>Customer ID: <span className="text-violet-400 font-mono">{searchParams.customer_id}</span></p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <a
            href="/workflows"
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Workflows
          </a>
          <a
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function SuccessPage({
  searchParams
}: {
  searchParams: {
    checkout_id?: string;
    order_id?: string;
    customer_id?: string;
    product_id?: string;
  }
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

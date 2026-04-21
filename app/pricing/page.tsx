import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - LTX Workflow Pro Subscription",
  description: "Subscribe to LTX Workflow Pro for unlimited access to premium ComfyUI workflows, advanced tutorials, and exclusive features. ¥2.99/month.",
  alternates: { canonical: "https://ltxworkflow.com/pricing" },
};

export default function PricingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/pricing" />

      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold text-gray-100">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Start with our free plan, or upgrade to Pro for unlimited access to all features
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">¥0</span>
                <span className="text-gray-400">/月</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Perfect for trying out LTX 2.3 and exploring the basics
            </p>

            <ul className="space-y-3 py-4">
              <li className="flex items-start gap-3">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">3 prompt enhancements per day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">3 workflow JSON downloads per day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">Access to official workflow templates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">Basic tutorials and guides</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">Community resources</span>
              </li>
            </ul>

            <Link href="/sign-in">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-xl p-8 border-2 border-violet-600 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">¥2.99</span>
                <span className="text-gray-300">/月</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              Unlimited access to all features and premium content
            </p>

            <ul className="space-y-3 py-4">
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Unlimited prompt enhancements</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Unlimited workflow JSON downloads</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Premium ComfyUI templates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Advanced tutorials & resources</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Priority support & updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 shrink-0 mt-0.5">⚡</span>
                <span className="text-white text-sm font-medium">Early access to new features</span>
              </li>
            </ul>

            <SubscribeButton productId={process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID || 'PRODUCT_ID_PLACEHOLDER'} />

            <p className="text-xs text-gray-400 text-center">
              随时取消，无隐藏费用
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto py-12 space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="bg-gray-900 rounded-lg p-5 group">
            <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              <span>What payment methods do you accept?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3">
              We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor Creem.
            </p>
          </details>

          <details className="bg-gray-900 rounded-lg p-5 group">
            <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              <span>Can I cancel anytime?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3">
              Yes! You can cancel your subscription at any time. Your access will continue until the end of your current billing period.
            </p>
          </details>

          <details className="bg-gray-900 rounded-lg p-5 group">
            <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              <span>What happens when I reach the free limit?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3">
              Free users get 3 uses per day for both the Prompt Generator and Workflow Builder. Once you reach the limit, you'll need to wait until the next day or upgrade to Pro for unlimited access.
            </p>
          </details>

          <details className="bg-gray-900 rounded-lg p-5 group">
            <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              <span>Do you offer refunds?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3">
              We offer a 7-day money-back guarantee. If you're not satisfied with your Pro subscription, contact us within 7 days for a full refund.
            </p>
          </details>

          <details className="bg-gray-900 rounded-lg p-5 group">
            <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              <span>Will the price increase in the future?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3">
              Your subscription price is locked in as long as you remain subscribed. New subscribers may see different pricing, but existing subscribers keep their current rate.
            </p>
          </details>
        </div>
      </section>

      <Footer />
    </main>
  );
}

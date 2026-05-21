import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";
import { auth } from "@/auth";
import { getBalance, WELCOME_CREDITS } from "@/lib/credits";
import {
  oneTimeTiers,
  pricePerCredit,
  subscriptionTiers,
  type PricingTier,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — LTX 2.3 Online Generation Credits | LTX Workflow",
  description:
    "Buy credits or subscribe to generate LTX 2.3 video online. 1 credit = 1 second of 1080p video. No GPU, no setup. Subscriptions from $9.99/mo, packs from $4.99.",
  alternates: { canonical: "https://ltxworkflow.com/pricing" },
};

export default async function PricingPage() {
  const session = await auth();
  // Show all 6 tiers always — TierCard handles the "Coming soon" disabled state
  // for ones that don't have a Creem product id wired up yet.
  const subs = subscriptionTiers();
  const packs = oneTimeTiers();

  let balance: number | null = null;
  if (session?.user?.email) {
    try {
      balance = await getBalance(session.user.email);
    } catch (e) {
      console.error("[/pricing] balance load failed:", e);
    }
  }

  const hasAnyTier = subs.length + packs.length > 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <Nav activeHref="/pricing" />

      <section className="text-center space-y-4 py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-100">
          Generate LTX 2.3 video — pay for what you use.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          1 credit = 1 second of 1080p Fast video. New accounts get{" "}
          <strong className="text-white">{WELCOME_CREDITS} free credits</strong>. Subscriptions
          renew monthly with rollover blocked at the next cycle. Packs never expire.
        </p>
        {balance !== null && (
          <p className="text-sm text-emerald-300">
            You currently have <strong>{balance}</strong>{" "}
            {balance === 1 ? "credit" : "credits"}.{" "}
            <Link href="/generate" className="underline hover:text-emerald-200">
              Use them on /generate
            </Link>
            .
          </p>
        )}
      </section>

      {!hasAnyTier && (
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-3">
          <h2 className="text-xl font-bold text-white">Plans coming soon</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We&apos;re finalizing payment setup. In the meantime, sign up to claim your{" "}
            {WELCOME_CREDITS} free credits and start generating.
          </p>
          <Link
            href="/generate"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors mt-2"
          >
            Try /generate →
          </Link>
        </section>
      )}

      {subs.length > 0 && (
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Subscriptions</h2>
            <p className="text-gray-400 text-sm">
              Best for ongoing use. Cancel anytime in your dashboard.
            </p>
          </div>
          <div
            className={`grid gap-6 max-w-6xl mx-auto ${
              subs.length === 1
                ? "grid-cols-1 max-w-md"
                : subs.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {subs.map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </div>
        </section>
      )}

      {packs.length > 0 && (
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Or buy as you go</h2>
            <p className="text-gray-400 text-sm">
              One-time credit packs. No subscription. Credits never expire.
            </p>
          </div>
          <div
            className={`grid gap-6 max-w-6xl mx-auto ${
              packs.length === 1
                ? "grid-cols-1 max-w-md"
                : packs.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {packs.map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-red-400/80">
        ⚠️ All payments are final and non-refundable. Cancel future subscription billing anytime
        in your dashboard.
      </p>

      <section className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center text-white mb-6">FAQ</h2>
        <Faq q="What is a credit?">
          1 credit buys 1 second of 1080p Fast video on LTX 2.3. A typical 6-second clip costs 6
          credits. Higher resolutions (1440p, 4K) and the slower-but-higher-quality standard
          variant cost more credits per second — see /generate for the exact multipliers.
        </Faq>
        <Faq q="Subscriptions vs one-time packs?">
          Subscriptions are cheaper per credit but auto-renew monthly. Packs are slightly more
          per credit but you only pay once and the credits never expire. Most active users find
          subscriptions cheaper after the second month.
        </Faq>
        <Faq q="What happens to unused credits at the end of a subscription month?">
          They stay in your account. Subscriptions add credits each cycle on top of whatever you
          haven&apos;t spent — there&apos;s no reset.
        </Faq>
        <Faq q="What if a generation fails?">
          You&apos;re refunded automatically. We only charge once the video is delivered.
        </Faq>
        <Faq q="Can I still download the .safetensors files for local ComfyUI?">
          Yes. The model download pages and ComfyUI workflows aren&apos;t going anywhere — they&apos;re
          free and stay free. Subscriptions and packs are for in-browser online generation.
        </Faq>
        <Faq q="What payment methods do you accept?">
          All major credit cards, debit cards, and digital wallets via Creem (our payment
          processor).
        </Faq>
        <Faq q="Do you offer refunds?">
          No — all payments are final and non-refundable. Try the free {WELCOME_CREDITS} credits
          on a new account first to make sure the service fits before paying. You can cancel
          future subscription billing anytime to prevent further charges.
        </Faq>
      </section>

      <Footer />
    </main>
  );
}

function TierCard({ tier }: { tier: PricingTier }) {
  const ppc = pricePerCredit(tier);
  const cadenceLabel = tier.cadence === "monthly" ? "/month" : "one-time";
  const ctaLabel = tier.type === "subscription" ? `Subscribe →` : `Buy now →`;

  return (
    <div
      className={`rounded-xl p-7 border-2 relative space-y-4 ${
        tier.highlight
          ? "bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-600"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
        <p className="text-sm text-gray-400">{tier.tagline}</p>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-white">${tier.priceUsd.toFixed(2)}</span>
        <span className="text-gray-400 text-sm">{cadenceLabel}</span>
      </div>

      <div className="bg-gray-950/40 rounded-lg p-3 space-y-1">
        <div className="text-2xl font-bold text-violet-300">
          {tier.credits.toLocaleString()} credits
          {tier.cadence === "monthly" && (
            <span className="text-sm text-gray-400 font-normal"> /mo</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          ≈ {tier.approxClips} 6-second clips at 1080p · ${ppc.toFixed(3)}/credit
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <Bullet>
          {tier.cadence === "monthly" ? "Renews monthly" : "Credits never expire"}
        </Bullet>
        <Bullet>
          Unused credits {tier.cadence === "monthly" ? "carry over to next month" : "stay in your account"}
        </Bullet>
        <Bullet>Failed generations auto-refunded</Bullet>
        {tier.cadence === "monthly" && <Bullet>Cancel anytime</Bullet>}
      </ul>

      {tier.creemProductId ? (
        <SubscribeButton productId={tier.creemProductId} label={ctaLabel} />
      ) : (
        <div className="block w-full text-center bg-gray-800 text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed">
          Coming soon
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {tier.cadence === "monthly"
          ? "Billed monthly · Cancel anytime"
          : "One-time payment"}
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
      <span className="text-gray-200">{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-gray-900 rounded-lg p-5 group">
      <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="text-gray-400 text-sm mt-3 leading-relaxed">{children}</div>
    </details>
  );
}

// Central pricing/tier config. Each tier maps a Creem product (env-driven) to
// a credit grant. A tier with an unset env var is automatically hidden from the
// /pricing page and is not granted credits by the webhook (defense in depth).
//
// All pricing assumes 1 credit = 1 second of LTX 2.3 Fast at 1080p ≈ $0.04 fal cost.
// Subscription tiers grant credits on `subscription.created` (initial month) and
// every `subscription.renewed`. One-time packs grant on `checkout.completed`.

export type TierType = "subscription" | "one_time";

export type PricingTier = {
  id: string;
  type: TierType;
  name: string;
  tagline: string;
  priceUsd: number;
  credits: number;
  /** approximate number of 6-second 1080p Fast clips (matches Generator default) */
  approxClips: number;
  cadence: "monthly" | "one_time";
  creemProductId: string | undefined;
  highlight?: boolean;
  badge?: string;
};

const tier = (
  partial: Omit<PricingTier, "approxClips">,
): PricingTier => ({
  ...partial,
  approxClips: Math.floor(partial.credits / 6),
});

export const PRICING_TIERS: PricingTier[] = [
  // ── Subscriptions (recurring monthly) ──────────────────────────────────────
  tier({
    id: "starter",
    type: "subscription",
    name: "Starter",
    tagline: "Curious creators dipping into LTX 2.3.",
    priceUsd: 9.99,
    credits: 150,
    cadence: "monthly",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_STARTER_ID,
  }),
  tier({
    id: "pro",
    type: "subscription",
    name: "Pro",
    tagline: "Active creators shipping every week.",
    priceUsd: 24.99,
    credits: 380,
    cadence: "monthly",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_PRO_ID,
    highlight: true,
    badge: "Most popular",
  }),
  tier({
    id: "studio",
    type: "subscription",
    name: "Studio",
    tagline: "Volume creators and small agencies.",
    priceUsd: 79.99,
    credits: 1230,
    cadence: "monthly",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_STUDIO_ID,
  }),
  // ── One-time credit packs ─────────────────────────────────────────────────
  tier({
    id: "pack-small",
    type: "one_time",
    name: "Starter Pack",
    tagline: "Try the model out — zero commitment.",
    priceUsd: 4.99,
    credits: 60,
    cadence: "one_time",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_PACK_S_ID,
  }),
  tier({
    id: "pack-medium",
    type: "one_time",
    name: "Standard Pack",
    tagline: "Enough for a real project. 10% off per credit.",
    priceUsd: 14.99,
    credits: 200,
    cadence: "one_time",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_PACK_M_ID,
  }),
  tier({
    id: "pack-large",
    type: "one_time",
    name: "Big Pack",
    tagline: "Best per-credit value. 20% off vs Starter Pack.",
    priceUsd: 39.99,
    credits: 600,
    cadence: "one_time",
    creemProductId: process.env.NEXT_PUBLIC_CREEM_PACK_L_ID,
  }),
];

export function findTierByProductId(
  productId: string | undefined | null,
): PricingTier | undefined {
  if (!productId) return undefined;
  return PRICING_TIERS.find((t) => t.creemProductId === productId);
}

/** All subscription tiers, regardless of whether their Creem product is configured. */
export function subscriptionTiers(): PricingTier[] {
  return PRICING_TIERS.filter((t) => t.type === "subscription");
}

/** All one-time pack tiers, regardless of whether their Creem product is configured. */
export function oneTimeTiers(): PricingTier[] {
  return PRICING_TIERS.filter((t) => t.type === "one_time");
}

/** Subset that has a Creem product id wired in env — used for webhook validation. */
export function activeSubscriptionTiers(): PricingTier[] {
  return PRICING_TIERS.filter((t) => t.type === "subscription" && !!t.creemProductId);
}

export function activeOneTimeTiers(): PricingTier[] {
  return PRICING_TIERS.filter((t) => t.type === "one_time" && !!t.creemProductId);
}

export function pricePerCredit(t: PricingTier): number {
  return Number((t.priceUsd / t.credits).toFixed(4));
}

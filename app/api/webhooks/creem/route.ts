import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { grantPurchaseCreditsIdempotent } from "@/lib/credits";
import { findTierByProductId } from "@/lib/pricing";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Helper: derive a stable user id (we use email as the canonical id throughout).
// Preference order:
//   1. metadata.user_email — we explicitly set this in /api/checkout so it's the
//      most trustworthy value: it's the email the user is signed in with on our
//      site at the moment they clicked "Buy". Survives even if the buyer edits
//      the email field on the Creem checkout form.
//   2. customer_email — Creem-managed, usually matches but the buyer can change
//      it on the Creem form, which would orphan the credits.
//   3. customer_id — last resort for legacy events without an email.
function userIdFromEvent(data: Record<string, unknown>): string | undefined {
  const metadata = (data.metadata as Record<string, unknown> | undefined) || {};
  return (
    (metadata.user_email as string) ||
    (data.customer_email as string) ||
    (data.customer_id as string) ||
    undefined
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("creem-signature");

    if (process.env.CREEM_WEBHOOK_SECRET) {
      const expected = crypto
        .createHmac("sha256", process.env.CREEM_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");
      if (signature !== expected) {
        console.error("[creem webhook] invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    switch (event.type) {
      // ── One-time payment OR subscription purchase ──────────────────────────
      case "checkout.completed": {
        const productId = event.data.product_id as string | undefined;
        const userId = userIdFromEvent(event.data);
        const checkoutId =
          (event.data.id as string) || (event.data.checkout_id as string) || undefined;

        // Always upsert the subscription tracking row (existing behavior).
        const lifetimeProductId = process.env.NEXT_PUBLIC_CREEM_LIFETIME_PRODUCT_ID;
        const legacyOneTimeProductId = process.env.NEXT_PUBLIC_CREEM_ONE_TIME_PRODUCT_ID;
        const isLifetime = !!lifetimeProductId && productId === lifetimeProductId;
        const isLegacyOneTime =
          !!legacyOneTimeProductId && productId === legacyOneTimeProductId;
        const proUntil = isLifetime
          ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
          : isLegacyOneTime
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        if (userId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            email: event.data.customer_email,
            customer_id: event.data.customer_id,
            product_id: productId,
            status: "active",
            ...(proUntil && { pro_until: proUntil }),
          });
        }

        // Credit-pack grant: only for one-time tiers. Subscription tiers will
        // get their credits via the `subscription.created` event to avoid
        // double-counting (Creem fires both on a sub purchase).
        const tier = findTierByProductId(productId);
        if (tier && tier.type === "one_time" && userId && checkoutId) {
          const result = await grantPurchaseCreditsIdempotent(
            userId,
            tier.credits,
            `creem-checkout-${checkoutId}`,
          );
          console.log(
            `[creem webhook] one-time pack ${tier.id}: granted=${result.granted} balance=${result.balance}`,
          );
        }
        break;
      }

      // ── New subscription (first cycle) ────────────────────────────────────
      case "subscription.created": {
        const userId = userIdFromEvent(event.data);
        const subId = event.data.id as string | undefined;
        const productId = event.data.product_id as string | undefined;

        if (userId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            email: event.data.customer_email,
            customer_id: event.data.customer_id,
            subscription_id: subId,
            product_id: productId,
            status: "active",
            current_period_start: event.data.current_period_start,
            current_period_end: event.data.current_period_end,
          });
        }

        const tier = findTierByProductId(productId);
        if (tier && tier.type === "subscription" && userId && subId) {
          const result = await grantPurchaseCreditsIdempotent(
            userId,
            tier.credits,
            `creem-sub-init-${subId}`,
          );
          console.log(
            `[creem webhook] sub initial ${tier.id}: granted=${result.granted} balance=${result.balance}`,
          );
        }
        break;
      }

      // ── Subscription renewal — top up monthly credits ─────────────────────
      case "subscription.renewed": {
        const userId = userIdFromEvent(event.data);
        const subId = event.data.id as string | undefined;
        const productId = event.data.product_id as string | undefined;

        await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            current_period_start: event.data.current_period_start,
            current_period_end: event.data.current_period_end,
          })
          .eq("subscription_id", subId);

        const tier = findTierByProductId(productId);
        if (tier && tier.type === "subscription" && userId && subId) {
          // ref_id includes the period_start so each renewal is a distinct grant.
          const periodKey =
            (event.data.current_period_start as string) || String(Date.now());
          const result = await grantPurchaseCreditsIdempotent(
            userId,
            tier.credits,
            `creem-sub-renew-${subId}-${periodKey}`,
          );
          console.log(
            `[creem webhook] sub renew ${tier.id}: granted=${result.granted} balance=${result.balance}`,
          );
        }
        break;
      }

      case "subscription.canceled":
        await supabase
          .from("user_subscriptions")
          .update({ status: "canceled" })
          .eq("subscription_id", event.data.id);
        break;

      default:
        console.log("[creem webhook] unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[creem webhook] handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

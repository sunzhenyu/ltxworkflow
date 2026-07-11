import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { grantPurchaseCreditsIdempotent } from "@/lib/credits";
import { findTierByProductId } from "@/lib/pricing";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Creem webhook payload structure:
//   { id, eventType, created_at, object: { ... } }
// Data lives in event.object, event type is event.eventType (not event.type/event.data).
//
// User id derivation — preference order:
//   1. object.metadata.user_email — set at checkout creation, survives buyer editing the form email
//   2. object.customer.email — Creem-managed customer email
//   3. object.customer.id — last resort
function userIdFromObject(obj: Record<string, unknown>): string | undefined {
  const metadata = (obj.metadata as Record<string, unknown> | undefined) || {};
  const customer = (obj.customer as Record<string, unknown> | undefined) || {};
  return (
    (metadata.user_email as string) ||
    (customer.email as string) ||
    (customer.id as string) ||
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
    // Creem uses eventType + object, not type + data
    const eventType: string = event.eventType ?? event.type ?? "";
    const obj: Record<string, unknown> = event.object ?? event.data ?? {};

    console.log("[creem webhook] received eventType:", eventType);

    switch (eventType) {
      // ── One-time payment OR subscription purchase ──────────────────────────
      case "checkout.completed": {
        const product = (obj.product as Record<string, unknown> | undefined) || {};
        const productId = (product.id as string) || (obj.product_id as string) || undefined;
        const userId = userIdFromObject(obj);
        const checkoutId = (obj.id as string) || undefined;

        // Upsert subscription tracking row for lifetime/legacy one-time products.
        const lifetimeProductId = process.env.NEXT_PUBLIC_CREEM_LIFETIME_PRODUCT_ID;
        const legacyOneTimeProductId = process.env.NEXT_PUBLIC_CREEM_ONE_TIME_PRODUCT_ID;
        const isLifetime = !!lifetimeProductId && productId === lifetimeProductId;
        const isLegacyOneTime = !!legacyOneTimeProductId && productId === legacyOneTimeProductId;
        const proUntil = isLifetime
          ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
          : isLegacyOneTime
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const customer = (obj.customer as Record<string, unknown> | undefined) || {};

        if (userId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            email: customer.email,
            customer_id: customer.id,
            product_id: productId,
            status: "active",
            ...(proUntil && { pro_until: proUntil }),
          });
        }

        // Credit grant: one_time tiers only (subscriptions handled by subscription.active).
        const tier = findTierByProductId(productId);
        if (tier && tier.type === "one_time" && userId && checkoutId) {
          const result = await grantPurchaseCreditsIdempotent(
            userId,
            tier.credits,
            `creem-checkout-${checkoutId}`,
          );
          console.log(
            `[creem webhook] one-time ${tier.id}: granted=${result.granted} balance=${result.balance}`,
          );
        } else {
          console.log(
            `[creem webhook] checkout.completed: productId=${productId} tier=${tier?.id ?? "none"} userId=${userId ?? "none"}`,
          );
        }
        break;
      }

      // ── New subscription activated (first cycle) ───────────────────────────
      // Creem fires "subscription.active" (not "subscription.created") on first activation.
      case "subscription.active":
      case "subscription.created": {
        const userId = userIdFromObject(obj);
        const subId = obj.id as string | undefined;
        const product = (obj.product as Record<string, unknown> | undefined) || {};
        const productId = (product.id as string) || (obj.product_id as string) || undefined;
        const customer = (obj.customer as Record<string, unknown> | undefined) || {};

        if (userId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            email: customer.email,
            customer_id: customer.id,
            subscription_id: subId,
            product_id: productId,
            status: "active",
            current_period_start: obj.current_period_start,
            current_period_end: obj.current_period_end,
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
        } else {
          console.log(
            `[creem webhook] ${eventType}: productId=${productId} tier=${tier?.id ?? "none"} userId=${userId ?? "none"}`,
          );
        }
        break;
      }

      // ── Subscription renewal — top up monthly credits ─────────────────────
      case "subscription.paid":
      case "subscription.renewed": {
        const userId = userIdFromObject(obj);
        const subId = obj.id as string | undefined;
        const product = (obj.product as Record<string, unknown> | undefined) || {};
        const productId = (product.id as string) || (obj.product_id as string) || undefined;

        await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            current_period_start: obj.current_period_start,
            current_period_end: obj.current_period_end,
          })
          .eq("subscription_id", subId);

        const tier = findTierByProductId(productId);
        if (tier && tier.type === "subscription" && userId && subId) {
          const periodKey =
            (obj.current_period_start as string) || String(Date.now());
          const result = await grantPurchaseCreditsIdempotent(
            userId,
            tier.credits,
            `creem-sub-renew-${subId}-${periodKey}`,
          );
          console.log(
            `[creem webhook] sub renew ${tier.id}: granted=${result.granted} balance=${result.balance}`,
          );
        } else {
          console.log(
            `[creem webhook] ${eventType}: productId=${productId} tier=${tier?.id ?? "none"} userId=${userId ?? "none"} subId=${subId ?? "none"}`,
          );
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.expired":
        await supabase
          .from("user_subscriptions")
          .update({ status: "canceled" })
          .eq("subscription_id", obj.id);
        break;

      default:
        console.log("[creem webhook] unhandled event type:", eventType, "raw keys:", Object.keys(event));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[creem webhook] handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

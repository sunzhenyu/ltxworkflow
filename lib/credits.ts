// Server-only credit ledger client. Wraps the atomic Postgres functions defined in
// supabase/migrations/20260506_create_credits_and_generations.sql.
//
// `import "server-only"` makes any accidental client import crash at build time
// instead of silently shipping `SUPABASE_SERVICE_ROLE_KEY` to the browser.
import "server-only";

import { createClient } from "@supabase/supabase-js";

// Re-export pure helpers so existing server callers don't need to change imports.
export {
  creditCostFor,
  falCostUsd,
  getModel,
  MODELS,
  aspectsForModel,
  isAspectSupported,
  aspectTo22BVideoSize,
  type ModelKey,
  type Resolution,
  type Fps,
  type AspectRatio,
  type Duration,
  ALLOWED_DURATIONS,
} from "./credit-cost";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export { WELCOME_CREDITS } from "./credits-constants";

export type DeductReason = "spend" | "adjust";
export type GrantReason = "purchase" | "refund" | "adjust";

/**
 * Get the user's current balance. On first call for a new user, lazily grants
 * the welcome credits and logs a `welcome` transaction. Idempotent.
 */
export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await adminClient.rpc("get_or_init_credits", {
    p_user_id: userId,
  });
  if (error) {
    console.error("[credits] getBalance error:", error);
    throw new Error("Failed to fetch credit balance");
  }
  return typeof data === "number" ? data : 0;
}

/**
 * Atomically deduct `amount` credits from the user. Returns the new balance,
 * or `null` if the user did not have enough.
 */
export async function tryDeductCredits(
  userId: string,
  amount: number,
  reason: DeductReason,
  refId?: string,
): Promise<{ ok: true; newBalance: number } | { ok: false; reason: "insufficient" }> {
  if (amount <= 0) {
    throw new Error("Deduct amount must be positive");
  }
  const { data, error } = await adminClient.rpc("try_deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_id: refId ?? null,
  });
  if (error) {
    console.error("[credits] tryDeductCredits error:", error);
    throw new Error("Failed to deduct credits");
  }
  if (data === -1 || data === null) {
    return { ok: false, reason: "insufficient" };
  }
  return { ok: true, newBalance: data };
}

/**
 * Grant credits to a user (after successful purchase, refund, or manual adjust).
 * Creates the user_credits row if missing, otherwise increments balance.
 */
export async function grantCredits(
  userId: string,
  amount: number,
  reason: GrantReason,
  refId?: string,
): Promise<number> {
  if (amount <= 0) {
    throw new Error("Grant amount must be positive");
  }
  const { data, error } = await adminClient.rpc("grant_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_id: refId ?? null,
  });
  if (error) {
    console.error("[credits] grantCredits error:", error);
    throw new Error("Failed to grant credits");
  }
  return typeof data === "number" ? data : 0;
}

/**
 * Refund credits for a failed generation. `refId` should be the generation row id
 * so the transaction log links back to it.
 */
export async function refundCredits(
  userId: string,
  amount: number,
  refId: string,
): Promise<number> {
  return grantCredits(userId, amount, "refund", refId);
}

/**
 * Has this user ever paid us money? Used to gate premium models — free trial
 * users (welcome credits only) get LTX 2.3 Fast; everything else needs a
 * past purchase.
 *
 * Defaults to `false` on error — fail closed, never accidentally unlock paid
 * features.
 */
export async function hasPurchased(userId: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from("credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", "purchase")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[credits] hasPurchased error:", error);
    return false;
  }
  return !!data;
}

/**
 * Grant credits exactly once for a given `refId`. Used by the Creem webhook to
 * survive replays / multi-delivery. Race-safe: even if two callers both pass
 * the pre-check, the partial unique index `uniq_credit_purchase_ref` makes the
 * second `grant_credits` rollback. Returns whether a grant actually happened.
 */
export async function grantPurchaseCreditsIdempotent(
  userId: string,
  amount: number,
  refId: string,
): Promise<{ granted: boolean; balance: number }> {
  // Cheap pre-check — avoids hitting the unique-index error path in the common case.
  const { data: existing } = await adminClient
    .from("credit_transactions")
    .select("id")
    .eq("ref_id", refId)
    .eq("reason", "purchase")
    .maybeSingle();

  if (existing) {
    const balance = await getBalance(userId);
    return { granted: false, balance };
  }

  try {
    const balance = await grantCredits(userId, amount, "purchase", refId);
    return { granted: true, balance };
  } catch (e) {
    // Most likely the partial unique index fired because a concurrent webhook
    // delivery won the race. Treat as already-processed.
    console.warn("[credits] idempotent purchase grant conflict for", refId, e);
    const balance = await getBalance(userId);
    return { granted: false, balance };
  }
}

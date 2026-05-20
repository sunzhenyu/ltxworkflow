import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { grantCredits } from "@/lib/credits";
import { getResultByUrl, getStatusByUrl } from "@/lib/fal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// fal returns signed URLs that typically last ~7 days. Surface this as
// `expires_at` so the UI can warn the user to download.
const FAL_URL_TTL_DAYS = 7;

// Server-side watchdog: any generation still `pending`/`running` after this
// many minutes is force-failed and refunded. Catches cases where fal stops
// responding to status_url entirely (rare, but the alternative is an
// indefinitely "Generating…" UI).
const MAX_RUN_MINUTES = 10;

// GET /api/generate/[id]
// Returns the generation row, refreshing from fal if it's still in flight.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = session.user.email;
  const { id } = await params;

  const { data: gen, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !gen) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  // Terminal state — return as-is.
  if (gen.status === "completed" || gen.status === "failed") {
    return NextResponse.json(serialize(gen));
  }

  // Watchdog: stuck in non-terminal state longer than MAX_RUN_MINUTES.
  // Force-fail + refund so the UI can recover.
  const createdAt = new Date(gen.created_at as string);
  const ageMinutes = (Date.now() - createdAt.getTime()) / 60_000;
  if (ageMinutes > MAX_RUN_MINUTES) {
    console.warn(
      `[generate/status] gen=${gen.id} watchdog timeout age=${ageMinutes.toFixed(1)}m — force-failing`,
    );
    const { data: updated } = await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: `Timed out waiting for fal after ${MAX_RUN_MINUTES} minutes`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", gen.id)
      .in("status", ["pending", "running"])
      .select("*")
      .maybeSingle();
    if (updated) {
      await grantCredits(userId, gen.credits_charged, "refund", gen.id).catch((err) => {
        console.error("[generate/status] refund-after-watchdog failed:", err);
      });
    }
    return NextResponse.json(serialize(updated ?? gen));
  }

  // No request id / status URL yet — submission is still mid-flight.
  if (!gen.fal_request_id || !gen.fal_status_url) {
    return NextResponse.json(serialize(gen));
  }

  // Refresh from fal using the URLs fal handed us at submit time.
  try {
    const fetched = await getStatusByUrl(gen.fal_status_url);

    // fal returned a non-retryable error (commonly 422 content moderation).
    // Mark failed + refund. Without this, the polling loop would never exit.
    if (fetched.kind === "fatal") {
      console.error(
        `[generate/status] gen=${gen.id} fatal http=${fetched.httpStatus} msg=${fetched.message}`,
      );
      const { data: updated } = await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: fetched.message.slice(0, 1000),
          completed_at: new Date().toISOString(),
        })
        .eq("id", gen.id)
        .in("status", ["pending", "running"])
        .select("*")
        .maybeSingle();
      if (updated) {
        await grantCredits(userId, gen.credits_charged, "refund", gen.id).catch((err) => {
          console.error("[generate/status] refund-after-fatal failed:", err);
        });
      }
      return NextResponse.json(serialize(updated ?? gen));
    }

    if (fetched.kind === "transient") {
      // Network or 5xx blip — return last known state and try again next poll.
      console.warn(
        `[generate/status] gen=${gen.id} transient http=${fetched.httpStatus} msg=${fetched.message}`,
      );
      return NextResponse.json(serialize(gen));
    }

    const status = fetched.status;
    console.log(
      `[generate/status] gen=${gen.id} fal_status=${status.status} queue_pos=${status.queue_position ?? "-"}`,
    );

    // Match the documented enum but be defensive — fal sometimes capitalises
    // differently or wraps the field. Treat any non-COMPLETED/ERROR status
    // as still-in-flight.
    const upper = String(status.status ?? "").toUpperCase();

    if (upper === "COMPLETED") {
      const responseUrl = gen.fal_response_url || gen.fal_status_url.replace(/\/status$/, "");
      const resultFetched = await getResultByUrl(responseUrl);

      if (resultFetched.kind === "fatal") {
        console.error(
          `[generate/status] gen=${gen.id} result fatal http=${resultFetched.httpStatus} msg=${resultFetched.message}`,
        );
        const { data: updated } = await supabase
          .from("generations")
          .update({
            status: "failed",
            error_message: resultFetched.message.slice(0, 1000),
            completed_at: new Date().toISOString(),
          })
          .eq("id", gen.id)
          .in("status", ["pending", "running"])
          .select("*")
          .maybeSingle();
        if (updated) {
          await grantCredits(userId, gen.credits_charged, "refund", gen.id).catch((err) => {
            console.error("[generate/status] refund-after-result-fatal failed:", err);
          });
        }
        return NextResponse.json(serialize(updated ?? gen));
      }

      if (resultFetched.kind === "transient") {
        console.warn(
          `[generate/status] gen=${gen.id} result transient http=${resultFetched.httpStatus} msg=${resultFetched.message}`,
        );
        return NextResponse.json(serialize(gen));
      }

      const videoUrl = resultFetched.result.video?.url ?? null;
      console.log(
        `[generate/status] gen=${gen.id} fetched result video_url=${videoUrl ? videoUrl.slice(0, 80) : "null"}`,
      );

      const completedAt = new Date();
      const expiresAt = new Date(completedAt.getTime() + FAL_URL_TTL_DAYS * 86_400_000);
      // Only update if we're transitioning from a non-terminal state — prevents
      // a duplicate write if two polls land simultaneously.
      const { data: updated } = await supabase
        .from("generations")
        .update({
          status: "completed",
          video_url: videoUrl,
          completed_at: completedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", gen.id)
        .in("status", ["pending", "running"])
        .select("*")
        .maybeSingle();
      const fresh = updated ?? gen;
      return NextResponse.json(serialize(fresh));
    }

    if (upper === "ERROR") {
      const errorMsg =
        status.logs?.map((l) => l.message).join(" | ") ?? "fal returned ERROR";
      const { data: updated } = await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: errorMsg.slice(0, 1000),
          completed_at: new Date().toISOString(),
        })
        .eq("id", gen.id)
        .in("status", ["pending", "running"])
        .select("*")
        .maybeSingle();
      if (updated) {
        await grantCredits(
          userId,
          gen.credits_charged,
          "refund",
          gen.id,
        ).catch((err) => {
          console.error("[generate/status] refund failed:", err);
        });
      }
      return NextResponse.json(serialize(updated ?? gen));
    }

    // Still queued or running.
    return NextResponse.json(serialize(gen, status));
  } catch (err) {
    console.error("[generate/status] poll error:", err);
    // Don't fail the user-facing call on a single poll error — return last known state.
    return NextResponse.json(serialize(gen));
  }
}

function serialize(
  gen: Record<string, unknown>,
  liveStatus?: { status: string; queue_position?: number },
) {
  return {
    id: gen.id,
    status: gen.status,
    mode: gen.mode,
    model: gen.model,
    prompt: gen.prompt,
    imageUrl: gen.image_url,
    resolution: gen.resolution,
    durationSeconds: gen.duration_seconds,
    videoUrl: gen.video_url,
    creditsCharged: gen.credits_charged,
    errorMessage: gen.error_message,
    createdAt: gen.created_at,
    completedAt: gen.completed_at,
    expiresAt: gen.expires_at,
    queueStatus: liveStatus?.status,
    queuePosition: liveStatus?.queue_position,
  };
}

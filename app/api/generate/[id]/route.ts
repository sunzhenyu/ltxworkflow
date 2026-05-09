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

  // No request id / status URL yet — submission is still mid-flight.
  if (!gen.fal_request_id || !gen.fal_status_url) {
    return NextResponse.json(serialize(gen));
  }

  // Refresh from fal using the URLs fal handed us at submit time.
  try {
    const status = await getStatusByUrl(gen.fal_status_url);
    console.log(
      `[generate/status] gen=${gen.id} fal_status=${status.status} queue_pos=${status.queue_position ?? "-"}`,
    );

    // Match the documented enum but be defensive — fal sometimes capitalises
    // differently or wraps the field. Treat any non-COMPLETED/ERROR status
    // as still-in-flight.
    const upper = String(status.status ?? "").toUpperCase();

    if (upper === "COMPLETED") {
      const result = await getResultByUrl(gen.fal_response_url || gen.fal_status_url.replace(/\/status$/, ""));
      const videoUrl = result.video?.url ?? null;
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import {
  ALLOWED_DURATIONS,
  aspectsForModel,
  creditCostFor,
  falCostUsd,
  getModel,
  grantCredits,
  MODELS,
  tryDeductCredits,
  type AspectRatio,
  type Duration,
  type Fps,
  type ModelKey,
  type Resolution,
} from "@/lib/credits";
import { submitI2V } from "@/lib/fal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ALLOWED_RES: Resolution[] = ["1080p", "1440p", "2160p"];
const ALLOWED_FPS: Fps[] = [24, 25, 48, 50];
const VALID_MODEL_KEYS = new Set<string>(MODELS.map((m) => m.key));
const MAX_PROMPT_CHARS = 1000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = session.user.email;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Param parsing & validation ───────────────────────────────────────────
  const mode = body.mode;
  const imageUrl = body.image_url;
  const endImageUrl = body.end_image_url;
  const prompt = body.prompt;
  const modelKey = body.model as ModelKey | undefined;
  const aspectRaw = (body.aspect_ratio as AspectRatio) ?? "auto";
  const resolutionRaw = (body.resolution as Resolution) ?? "1080p";
  const durationSeconds = Number(body.duration_seconds);
  const fpsRaw = body.fps;
  const generateAudio =
    typeof body.generate_audio === "boolean" ? body.generate_audio : true;

  if (mode !== "i2v") {
    return NextResponse.json(
      { error: "Only i2v is supported in this release" },
      { status: 400 },
    );
  }
  if (!modelKey || !VALID_MODEL_KEYS.has(modelKey)) {
    return NextResponse.json(
      { error: `Unknown model. Must be one of ${[...VALID_MODEL_KEYS].join(", ")}` },
      { status: 400 },
    );
  }
  if (typeof imageUrl !== "string" || !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { error: "image_url must be a valid http(s) URL" },
      { status: 400 },
    );
  }
  if (
    endImageUrl !== undefined &&
    endImageUrl !== null &&
    (typeof endImageUrl !== "string" || !/^https?:\/\//i.test(endImageUrl))
  ) {
    return NextResponse.json(
      { error: "end_image_url must be a valid http(s) URL when provided" },
      { status: 400 },
    );
  }
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `prompt must be at most ${MAX_PROMPT_CHARS} characters` },
      { status: 400 },
    );
  }
  // Aspect must be supported by the chosen model.
  const allowedAspects = aspectsForModel(modelKey);
  if (!allowedAspects.includes(aspectRaw)) {
    return NextResponse.json(
      {
        error: `Aspect ratio '${aspectRaw}' is not supported by ${modelKey}. Allowed: ${allowedAspects.join(", ")}`,
      },
      { status: 400 },
    );
  }
  // FPS optional; default per family.
  const modelInfo = getModel(modelKey);
  const fps: Fps =
    fpsRaw === undefined
      ? modelInfo.pricingType === "per_megapixel"
        ? 24
        : 25
      : (Number(fpsRaw) as Fps);
  if (!ALLOWED_FPS.includes(fps)) {
    return NextResponse.json(
      { error: `fps must be one of ${ALLOWED_FPS.join(", ")}` },
      { status: 400 },
    );
  }
  if (!ALLOWED_DURATIONS.includes(durationSeconds as Duration)) {
    return NextResponse.json(
      { error: `duration_seconds must be one of ${ALLOWED_DURATIONS.join(", ")}` },
      { status: 400 },
    );
  }
  // Resolution only relevant for per_second models. For 22B, the param exists
  // but is ignored at the fal layer — we still record it for bookkeeping.
  const resolution: Resolution = ALLOWED_RES.includes(resolutionRaw) ? resolutionRaw : "1080p";

  // ── Cost + deduction ────────────────────────────────────────────────────
  // No premium gating — anyone with sufficient credits can use any model.
  // (Earlier policy was Fast-only for free trial; reversed per user direction.)
  const cost = creditCostFor({
    model: modelKey,
    durationSeconds: durationSeconds as Duration,
    resolution,
    fps,
    aspect: aspectRaw,
  });
  const deducted = await tryDeductCredits(userId, cost, "spend");
  if (!deducted.ok) {
    return NextResponse.json(
      { error: "Insufficient credits", required: cost },
      { status: 402 },
    );
  }
  const balanceAfter = deducted.newBalance;

  // ── Persist pending generation ──────────────────────────────────────────
  const { data: gen, error: insertError } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      mode: "i2v",
      model: modelKey,
      prompt: prompt.trim(),
      image_url: imageUrl,
      end_image_url: endImageUrl ?? null,
      resolution,
      duration_seconds: durationSeconds,
      status: "pending",
      credits_charged: cost,
      fal_cost_usd: falCostUsd({
        model: modelKey,
        durationSeconds: durationSeconds as Duration,
        resolution,
        fps,
        aspect: aspectRaw,
      }),
    })
    .select("id")
    .single();

  if (insertError || !gen) {
    console.error("[generate] insert error:", insertError);
    await grantCredits(userId, cost, "refund").catch((err) => {
      console.error("[generate] refund-after-insert-failure failed:", err);
    });
    return NextResponse.json(
      { error: "Failed to persist generation; credits refunded" },
      { status: 500 },
    );
  }

  // ── Submit to fal ───────────────────────────────────────────────────────
  let submitted: Awaited<ReturnType<typeof submitI2V>>;
  try {
    submitted = await submitI2V({
      model: modelKey,
      imageUrl,
      prompt: prompt.trim(),
      resolution,
      durationSeconds: durationSeconds as Duration,
      aspect: aspectRaw,
      fps,
      generateAudio,
      endImageUrl: typeof endImageUrl === "string" ? endImageUrl : undefined,
    });
  } catch (err) {
    console.error("[generate] fal submit error:", err);
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "fal submission failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", gen.id);
    await grantCredits(userId, cost, "refund", gen.id).catch((refundErr) => {
      console.error("[generate] refund-after-submit-failure failed:", refundErr);
    });
    return NextResponse.json(
      { error: "Could not start generation. Credits refunded." },
      { status: 502 },
    );
  }

  const { error: runUpdateError } = await supabase
    .from("generations")
    .update({
      status: "running",
      fal_request_id: submitted.requestId,
      fal_status_url: submitted.statusUrl,
      fal_response_url: submitted.responseUrl,
    })
    .eq("id", gen.id);

  if (runUpdateError) {
    // Most common cause: migration `20260509_add_fal_queue_urls.sql` hasn't been
    // applied yet, so `fal_status_url` / `fal_response_url` columns don't exist
    // and the UPDATE fails for the WHOLE row, including `status` and
    // `fal_request_id`. The generation row stays stuck at `status='pending'`
    // and polling never finds it. Log loudly so this surfaces in dev.
    console.error(
      "[generate] CRITICAL: failed to mark generation as running. " +
        "If columns are missing, apply the latest migrations in supabase/migrations/. " +
        "Detail:",
      runUpdateError,
    );
  }

  console.log(
    `[generate] submitted ${modelKey} req=${submitted.requestId} ` +
      `statusUrl=${submitted.statusUrl} dbUpdate=${runUpdateError ? "FAILED" : "ok"}`,
  );

  return NextResponse.json({
    id: gen.id,
    status: "running",
    creditsCharged: cost,
    balanceAfter,
  });
}

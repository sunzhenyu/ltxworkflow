import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/generations?limit=20 — recent generations for the signed-in user.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized", items: [] }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 20, 1), 50);

  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, status, mode, model, prompt, image_url, video_url, resolution, duration_seconds, credits_charged, error_message, created_at, completed_at, expires_at",
    )
    .eq("user_id", session.user.email)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[generations] list error:", error);
    return NextResponse.json({ error: "Failed to load history", items: [] }, { status: 500 });
  }

  const items = (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    mode: row.mode,
    model: row.model,
    prompt: row.prompt,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    resolution: row.resolution,
    durationSeconds: row.duration_seconds,
    creditsCharged: row.credits_charged,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
  }));

  return NextResponse.json({ items });
}

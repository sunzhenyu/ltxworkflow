import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    await admin.rpc("increment_pack_download", { pack_slug: slug }).then(async ({ error }) => {
      if (error) {
        await admin
          .from("workflow_packs")
          .select("download_count")
          .eq("slug", slug)
          .single()
          .then(async ({ data }) => {
            if (data) {
              await admin
                .from("workflow_packs")
                .update({ download_count: (data.download_count || 0) + 1 })
                .eq("slug", slug);
            }
          });
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

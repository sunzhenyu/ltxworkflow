import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();

    // 1. Persist locally so we always own the list
    const { error: dbError } = await admin
      .from("newsletter_subscribers")
      .upsert(
        {
          email: normalized,
          source: typeof source === "string" ? source.slice(0, 100) : null,
          is_unsubscribed: false,
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Newsletter DB error:", dbError);
      return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
    }

    // 2. (Optional) forward to Beehiiv if configured
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;
    const beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;
    if (beehiivApiKey && beehiivPubId) {
      try {
        await fetch(
          `https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${beehiivApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: normalized,
              reactivate_existing: true,
              send_welcome_email: true,
              utm_source: source || "ltxworkflow.com",
            }),
          }
        );
      } catch (e) {
        console.warn("Beehiiv forward failed (saved locally):", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Subscribe error:", e);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

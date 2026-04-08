import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { title, content, email } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  const { error } = await supabase.from("feedback").insert({ title, content, email: email || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

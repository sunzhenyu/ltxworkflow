import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, params, name } = await req.json();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("workflows").insert({ user_id: userId, name, params });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

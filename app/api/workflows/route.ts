import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ workflows: [] });
  const { data } = await supabase.from("workflows").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return NextResponse.json({ workflows: data ?? [] });
}

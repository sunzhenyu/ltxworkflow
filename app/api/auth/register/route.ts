import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase.from("users").insert({ email, name, password_hash, provider: "credentials" });
  if (error) return NextResponse.json({ error: "Registration failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}

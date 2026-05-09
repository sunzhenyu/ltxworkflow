import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBalance, WELCOME_CREDITS } from "@/lib/credits";

// GET /api/credits/balance — returns the current user's credit balance.
// First call for a new user lazily grants WELCOME_CREDITS.
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        balance: 0,
        signedIn: false,
        welcomeAmount: WELCOME_CREDITS,
      },
      { status: 401 },
    );
  }

  try {
    const balance = await getBalance(session.user.email);
    return NextResponse.json({
      balance,
      signedIn: true,
      welcomeAmount: WELCOME_CREDITS,
    });
  } catch (e) {
    console.error("[credits/balance] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch balance", balance: 0 },
      { status: 500 },
    );
  }
}

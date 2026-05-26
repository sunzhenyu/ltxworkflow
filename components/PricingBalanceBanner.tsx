"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Client-side credit balance banner for /pricing. Keeps the page itself
// statically prerenderable; only this small island fetches per-user data
// after hydration.
export default function PricingBalanceBanner() {
  const { status } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setBalance(null);
      return;
    }
    let cancelled = false;
    fetch("/api/credits/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.balance === "number") setBalance(data.balance);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (balance === null) return null;
  return (
    <p className="text-sm text-emerald-300">
      You currently have <strong>{balance}</strong>{" "}
      {balance === 1 ? "credit" : "credits"}.{" "}
      <Link href="/generate" className="underline hover:text-emerald-200">
        Use them on /generate
      </Link>
      .
    </p>
  );
}

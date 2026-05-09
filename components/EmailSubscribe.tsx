"use client";
import { useState } from "react";

type Variant = "inline" | "card" | "footer";

const DEFAULT_BUTTON_LABEL: Record<Variant, string> = {
  inline: "Subscribe",
  card: "Get LTX updates",
  footer: "Join",
};

export default function EmailSubscribe({
  variant = "card",
  headline = "LTX Insider",
  subhead = "Occasional updates when notable LTX 2.3 models drop — Kijai FP8 quants, Lightricks releases, IC-LoRAs. No fixed cadence, no spam. Unsubscribe in one click.",
  badge = "Free newsletter",
  buttonLabel,
  source,
  successMessage = "You're in. Check your inbox to confirm.",
}: {
  variant?: Variant;
  headline?: string;
  subhead?: string;
  badge?: string;
  buttonLabel?: string;
  source?: string;
  successMessage?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const resolvedButtonLabel = buttonLabel ?? DEFAULT_BUTTON_LABEL[variant];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed");
      }
      setStatus("success");
      setMessage(successMessage);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again later.");
    }
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting" || status === "success"}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-600"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {status === "submitting" ? "..." : status === "success" ? "✓" : resolvedButtonLabel}
        </button>
        {message && (
          <p
            className={`text-xs ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {message}
          </p>
        )}
      </form>
    );
  }

  if (variant === "footer") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-200">{headline}</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting" || status === "success"}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-600"
          />
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            {status === "submitting" ? "..." : status === "success" ? "✓" : resolvedButtonLabel}
          </button>
        </form>
        {message && (
          <p
            className={`text-xs ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  // card (default)
  return (
    <section className="bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-gray-900 border border-violet-700/40 rounded-2xl p-6 md:p-7 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-violet-700 text-violet-100 text-xs px-2 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white">{headline}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{subhead}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting" || status === "success"}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-600"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          {status === "submitting"
            ? "Subscribing..."
            : status === "success"
            ? "✓ Subscribed"
            : resolvedButtonLabel}
        </button>
      </form>
      {message && (
        <p
          className={`text-xs ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}
      <p className="text-xs text-gray-500">
        No spam. Sent occasionally when there&apos;s real news. Unsubscribe in one click.
      </p>
    </section>
  );
}

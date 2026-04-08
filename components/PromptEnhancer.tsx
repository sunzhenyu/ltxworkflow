"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PromptEnhancer() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function enhance() {
    if (!input.trim()) return;
    setLoading(true);
    if (!isSignedIn) {
      setResult(`${input}, cinematic lighting, shallow depth of field, 4K, photorealistic, smooth motion, professional cinematography`);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setResult(data.enhanced);
    } catch {
      setResult("Error enhancing prompt. Please try again.");
    }
    setLoading(false);
  }

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-1">LTX 2.3 Prompt Generator</h2>
      <p className="text-gray-400 text-sm mb-4">
        {isSignedIn
          ? "Director-level enhancement with cinematic camera language (Dolly Zoom, Tracking Shot, etc.)"
          : "Basic prompt enhancement — sign in for director-level cinematic prompts"}
      </p>
      <textarea
        className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none mb-3"
        rows={3}
        placeholder="e.g. a cat walking in the rain"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-3">
        <button onClick={enhance} disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          {loading ? "Enhancing..." : isSignedIn ? "Enhance Prompt (Director Mode)" : "Basic Enhance"}
        </button>
        {!isSignedIn && (
          <Link href="/sign-in">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Sign in for Director Mode
            </button>
          </Link>
        )}
      </div>
      {result && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Enhanced prompt:</p>
          <p className="text-sm text-gray-100">{result}</p>
          <button onClick={() => navigator.clipboard.writeText(result)}
            className="mt-2 text-xs text-violet-400 hover:text-violet-300">Copy</button>
        </div>
      )}
    </section>
  );
}

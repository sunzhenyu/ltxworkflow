"use client";
import { useState } from "react";

export default function FeedbackForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, email }),
    });
    setStatus(res.ok ? "ok" : "error");
  }

  if (status === "ok") {
    return <p className="text-green-400 text-sm py-4">Thanks for your feedback!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Title *</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Brief summary of your feedback" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Content *</label>
        <textarea required value={content} onChange={(e) => setContent(e.target.value)}
          rows={4} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Describe the issue or suggestion in detail" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Email (optional)</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="your@email.com" />
      </div>
      {status === "error" && <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
        {status === "loading" ? "Sending..." : "Submit Feedback"}
      </button>
    </form>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Suggests video-generation prompts. If `image_url` is provided, the model uses
// vision to ground suggestions in the image; otherwise it returns generic
// LTX 2.3-friendly prompt ideas. Calls yunwu.ai (OpenAI-compatible /chat/completions)
// using the same env vars already used by /api/enhance-prompt.

const SYSTEM_INSTRUCTION = `You are a video director writing motion prompts for the LTX 2.3 image-to-video model.
Return EXACTLY 5 distinct, varied prompt suggestions as a JSON array of strings: ["prompt 1", "prompt 2", ...].
Each prompt should be 12-25 words, describe specific motion (camera movement + subject motion + lighting), and use cinematic language (dolly, pan, push-in, rack focus, parallax, particles, etc).
Vary the energy: at least one slow contemplative, one dynamic, and one with dramatic lighting.
Output ONLY the JSON array. No prose, no markdown, no code fences.`;

const FALLBACK_SUGGESTIONS = [
  "Slow dolly push-in with shallow depth of field, soft golden-hour light, dust particles drifting through the air",
  "Smooth tracking shot orbiting the subject, dramatic side lighting, rack-focus pull from background to foreground",
  "Subtle parallax with gentle subject breath, atmospheric haze, cinematic blue-hour color grade",
  "Quick whip-pan into the scene, high-contrast lighting, motion blur trails on the edges",
  "Static camera with slow zoom-in, volumetric god rays, leaves rustling and slow particles in the air",
];

const MAX_PROMPTS = 5;

function safeJsonArray(text: string): string[] | null {
  if (!text) return null;
  // Strip markdown fences if the model insisted on adding them.
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed.map((s) => s.trim()).filter(Boolean).slice(0, MAX_PROMPTS);
    }
  } catch {
    // fall through to bracket extraction
  }
  // Best-effort fallback: extract a JSON array even if surrounded by text.
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
        return parsed.map((s) => s.trim()).filter(Boolean).slice(0, MAX_PROMPTS);
      }
    } catch {
      // give up
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { image_url?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const imageUrl =
    typeof body.image_url === "string" && /^https?:\/\//i.test(body.image_url)
      ? body.image_url
      : undefined;

  const userText = imageUrl
    ? "Generate 5 video prompts that animate THIS image. Ground every suggestion in what's actually visible — subject, setting, lighting, mood. Vary motion type."
    : "Generate 5 LTX 2.3 image-to-video prompts that work well in general. Vary subject, mood, and motion type.";

  const userContent: unknown = imageUrl
    ? [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : userText;

  // Track usage for analytics (non-blocking).
  fetch(new URL("/api/usage/check", req.url).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ feature: "prompt_suggester" }),
  }).catch(() => {});

  const baseUrl = process.env.ANTHROPIC_BASE_URL;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error("[suggest-prompts] ANTHROPIC_BASE_URL or ANTHROPIC_API_KEY not set");
    return NextResponse.json(
      { suggestions: FALLBACK_SUGGESTIONS, fallback: true, reason: "env" },
      { status: 200 },
    );
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini-2026-03-17",
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("[suggest-prompts] upstream non-2xx:", upstream.status, text.slice(0, 300));
      return NextResponse.json(
        { suggestions: FALLBACK_SUGGESTIONS, fallback: true, reason: "upstream_error" },
        { status: 200 },
      );
    }

    const result = await upstream.json();
    const content = result?.choices?.[0]?.message?.content;
    const raw = typeof content === "string" ? content : "";
    const parsed = safeJsonArray(raw);

    if (!parsed || parsed.length === 0) {
      console.warn("[suggest-prompts] could not parse suggestions:", raw.slice(0, 300));
      return NextResponse.json(
        { suggestions: FALLBACK_SUGGESTIONS, fallback: true, reason: "parse" },
        { status: 200 },
      );
    }

    return NextResponse.json({ suggestions: parsed, fallback: false });
  } catch (e) {
    console.error("[suggest-prompts] error:", e);
    return NextResponse.json(
      { suggestions: FALLBACK_SUGGESTIONS, fallback: true, reason: "exception" },
      { status: 200 },
    );
  }
}

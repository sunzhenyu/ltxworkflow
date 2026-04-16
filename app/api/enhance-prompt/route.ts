import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are a professional video director. Enhance this prompt for LTX 2.3 video generation with cinematic camera language (Dolly Zoom, Tracking Shot, Rack Focus, etc.), lighting, and motion details. Return only the enhanced prompt, no explanation.\n\nPrompt: ${prompt}`,
        }],
      }),
    });

    const result = await response.json();
    const enhanced = result.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ enhanced });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}

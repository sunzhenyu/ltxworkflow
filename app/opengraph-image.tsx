import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ltx workflow — LTX 2.3 ComfyUI Workflow Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: "#030712",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, padding: 80,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
              <polygon points="5,3 5,17 17,10" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 48, fontWeight: 800, color: "#a78bfa" }}>ltx workflow</span>
        </div>
        <p style={{ fontSize: 28, color: "#9ca3af", textAlign: "center", margin: 0 }}>
          LTX 2.3 ComfyUI Workflow Generator & Model Download
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {["16GB–32GB VRAM", "ComfyUI JSON", "AI Prompt Enhancer"].map((tag) => (
            <span key={tag} style={{
              background: "#1f2937", color: "#6b7280",
              padding: "8px 16px", borderRadius: 999, fontSize: 18,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

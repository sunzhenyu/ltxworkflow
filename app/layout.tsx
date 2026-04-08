import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTX 2.3 Prompt Generator & ComfyUI Workflow JSON | ltx workflow",
  description: "Free LTX-2.3 ComfyUI workflow generator. Match your VRAM (8GB-24GB), download taeltx2_3.safetensors configs, enhance prompts with cinematic language. Supports LTX-2.3 Distilled & GGUF.",
  keywords: "LTX-2.3, LTX 2.3 Prompt Generator, ComfyUI Workflow JSON, taeltx2_3.safetensors, LTX-2.3 GGUF, LTX-2.3 Distilled, 8GB VRAM, spatial upscaler x2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

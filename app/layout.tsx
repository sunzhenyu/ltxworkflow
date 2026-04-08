import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI Workflow & Model Download Guide",
  description: "Generate ComfyUI workflow JSON for LTX-2.3 video model. Download ltx-2.3-22b-dev.safetensors, FP8 variants for 16GB VRAM, enhance prompts with AI. Free LTX 2.3 parameter optimizer.",
  keywords: "LTX 2.3, LTX-2.3 ComfyUI, LTX 2.3 workflow, ComfyUI workflow JSON, ltx-2.3-22b-dev.safetensors, LTX 2.3 download, LTX 2.3 FP8, LTX 2.3 distilled, LTX 2.3 16GB VRAM, spatial upscaler x2, LTX video model",
  metadataBase: new URL("https://ltxworkflow.com"),
  alternates: { canonical: "https://ltxworkflow.com" },
  openGraph: {
    title: "LTX 2.3 ComfyUI Workflow Generator & Model Download",
    description: "Free tool to generate ComfyUI workflow JSON for LTX-2.3. Match your GPU VRAM, download official models, enhance prompts with AI.",
    url: "https://ltxworkflow.com",
    siteName: "ltx workflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LTX 2.3 ComfyUI Workflow Generator",
    description: "Generate ComfyUI workflow JSON for LTX-2.3 video model. Supports 16GB–32GB VRAM with FP8 quantized variants.",
  },
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

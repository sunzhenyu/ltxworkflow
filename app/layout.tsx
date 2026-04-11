import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComfyUI LTX 2.3 Workflow Generator — LoRA, FP8, GGUF",
  description: "Generate ComfyUI workflow JSON for LTX 2.3 video model. Supports LTX 2.3 LoRA training, FP8 quantization, GGUF variants. Free tool for 16GB–32GB VRAM.",
  keywords: "comfyui ltx 2.3, ltx 2.3 lora, ltx 2.3 gguf, comfyui, ltx ai",
  metadataBase: new URL("https://ltxworkflow.com"),
  alternates: { canonical: "https://ltxworkflow.com" },
  openGraph: {
    title: "ComfyUI LTX 2.3 Workflow Generator — LoRA, FP8, GGUF",
    description: "Generate ComfyUI workflow JSON for LTX 2.3. Supports LTX 2.3 LoRA, FP8, GGUF. Match GPU VRAM, enhance prompts with AI.",
    url: "https://ltxworkflow.com",
    siteName: "ltx workflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComfyUI LTX 2.3 Workflow Generator",
    description: "Generate ComfyUI workflow JSON for LTX 2.3. Supports LTX 2.3 LoRA, FP8, GGUF variants.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-JM08TXQFMM" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JM08TXQFMM');
        `}</Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

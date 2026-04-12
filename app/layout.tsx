import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTX 2.3 Model Download & ComfyUI Workflow Generator",
  description: "Download LTX 2.3 models: taeltx2_3.safetensors VAE, FP8 variants for 16GB VRAM, official dev & distilled. Generate ComfyUI workflow JSON. Supports LTX 2.3 LoRA.",
  keywords: "ltx 2.3 download, taeltx2_3.safetensors, comfyui ltx 2.3, ltx 2.3 lora, ltx 2.3 gguf, ltx 2.3 fp8",
  metadataBase: new URL("https://ltxworkflow.com"),
  alternates: { canonical: "https://ltxworkflow.com" },
  openGraph: {
    title: "LTX 2.3 Model Download & ComfyUI Workflow Generator",
    description: "Download taeltx2_3.safetensors, FP8 & distilled LTX 2.3 models. Generate ComfyUI workflow JSON for 16GB–32GB VRAM.",
    url: "https://ltxworkflow.com",
    siteName: "ltx workflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LTX 2.3 Model Download & ComfyUI Workflow Generator",
    description: "Download taeltx2_3.safetensors, FP8 & distilled LTX 2.3 models. Generate ComfyUI workflow JSON.",
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

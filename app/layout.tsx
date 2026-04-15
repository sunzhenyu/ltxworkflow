import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free LTX 2.3 Download — taeltx2_3.safetensors, FP8, ComfyUI Workflows",
  description: "Download LTX 2.3 models free with direct links: taeltx2_3.safetensors VAE, FP8 quantized (16GB VRAM), official checkpoints (32GB). Generate ComfyUI workflow JSON instantly. Supports T2V, I2V, LoRA.",
  keywords: "ltx 2.3 download, taeltx2_3.safetensors download, comfyui ltx 2.3, ltx 2.3 fp8, ltx 2.3 lora, ltx-2.3-22b-distilled, free ltx 2.3, direct download",
  metadataBase: new URL("https://ltxworkflow.com"),
  alternates: { canonical: "https://ltxworkflow.com" },
  openGraph: {
    title: "Free LTX 2.3 Download — Direct Links to All Models",
    description: "Download taeltx2_3.safetensors, FP8 & official LTX 2.3 models free. Generate ComfyUI workflows for 16GB–32GB VRAM.",
    url: "https://ltxworkflow.com",
    siteName: "ltx workflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free LTX 2.3 Download — taeltx2_3.safetensors & FP8",
    description: "Download LTX 2.3 models free with direct HuggingFace links. Generate ComfyUI workflow JSON.",
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

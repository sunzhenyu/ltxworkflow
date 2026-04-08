import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI Workflow & Model Download Guide",
  description: "Generate ComfyUI workflow JSON for LTX-2.3 video model. Download official models, match your GPU VRAM, and enhance prompts with AI. Free LTX 2.3 tool.",
  keywords: "LTX 2.3, LTX-2.3 ComfyUI, ComfyUI workflow JSON, LTX 2.3 download, LTX 2.3 FP8",
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

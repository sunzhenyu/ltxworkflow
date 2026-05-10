import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI: Model Downloads, Workflows & Online i2v",
  description: "Match your VRAM, download LTX 2.3 FP8 + taeltx2_3.safetensors + Gemma 3 encoder, grab the right ComfyUI workflow JSON, or run i2v online — no GPU needed.",
  metadataBase: new URL("https://ltxworkflow.com"),
  alternates: { canonical: "https://ltxworkflow.com" },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon", type: "image/png", sizes: "32x32" }],
  },
  openGraph: {
    title: "LTX 2.3 ComfyUI Hub — Models, Workflows & Online i2v",
    description: "Free LTX 2.3 model downloads, ComfyUI workflow templates for every VRAM tier, and online image-to-video. No GPU required.",
    url: "https://ltxworkflow.com",
    siteName: "ltx workflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LTX 2.3 ComfyUI Hub — Models, Workflows & Online i2v",
    description: "Free LTX 2.3 model downloads, ComfyUI workflow templates for every VRAM tier, and online image-to-video. No GPU required.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
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

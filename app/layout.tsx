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
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ltx workflow",
    "url": "https://ltxworkflow.com",
    "logo": "https://ltxworkflow.com/logo-128.png",
    "sameAs": ["https://github.com/sunzhenyu/ltxworkflow"],
    "description": "The definitive hub for LTX 2.3 ComfyUI model downloads, workflow templates, and online image-to-video generation.",
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ltx workflow",
    "url": "https://ltxworkflow.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": "https://ltxworkflow.com/models?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-JM08TXQFMM" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JM08TXQFMM');
        `}</Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3423484889158695"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

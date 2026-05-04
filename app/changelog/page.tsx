import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Release Notes — LTX 2.3 Model & Tool Updates",
  description: "Latest updates to ltx workflow: new LTX 2.3 model variants, ComfyUI node changes, and tool improvements.",
  alternates: { canonical: "https://ltxworkflow.com/changelog" },
};

const entries = [
  {
    date: "2026-05-27",
    title: "17 New Model Variants — Audio VAE, MXFP8 & More",
    items: [
      "New: LTX23 Audio VAE (Kijai) — enables audio-conditioned video generation workflows",
      "New: LTX23 Video VAE BF16 and Text Projection BF16 components (Kijai)",
      "New: Spatial Upscaler x2 v1.1 — updated upscaler from Lightricks",
      "New: Distilled LoRA rank-384 v1.0 (Official) and Dynamic LoRA rank-105 (Kijai)",
      "New: Distilled 1.1 BF16 and MXFP8 transformer-only variants (Kijai)",
      "New: Dev BF16, FP8 Scaled, and MXFP8 transformer-only variants (Kijai)",
      "New: Distilled v1.0 BF16, FP8 v1/v2/Scaled, and MXFP8 transformer-only variants (Kijai)",
    ],
  },
  {
    date: "2026-04-27",
    title: "New Models & One-time Payment Option",
    items: [
      "New Models: Added official Lightricks FP8 variants for dev and distilled models (29.1GB / 29.5GB)",
      "New Models: Added Spatial Upscaler x1.5 and Temporal Upscaler x2 for two-stage pipelines",
      "New Models: Added official LoRA rank-384 v1.1 from Lightricks",
      "Pricing: Added one-time payment option ($4.99 for 30 days Pro access, no auto-renewal)",
      "Pricing: Updated currency display to USD ($)",
      "Video Tutorials: Added 3 Bilibili video tutorials to the Guide page",
    ],
  },
  {
    date: "2026-04-21",
    title: "Pro Subscription & Content Library Launch",
    items: [
      "Pro Plan: Subscribe for ¥2.99/month to unlock unlimited prompt enhancements and workflow generations (free users get 3 uses per day)",
      "Content Library: Added 13+ new resources including tutorials, community discussions, showcase examples, research papers, and tool guides",
      "Navigation: Renamed 'Models' to 'Downloads' for clarity",
      "VRAM Adapter: Added quick download button to jump directly to model downloads",
      "Payment Policy: Clear no-refund policy displayed on pricing and success pages",
      "Workflows Page: Removed subscription card for cleaner layout - visit Pricing page to subscribe",
    ],
  },
  {
    date: "2026-04-16",
    title: "Blog System & Site Improvements",
    items: [
      "Blog: Published 4 new articles (taeltx2_3 guide, LTX 2.3 release, model comparison, LoRA training deep dive)",
      "Nav: Added Resources dropdown with Blog and Release Notes sub-items",
      "Nav: Mobile responsive hamburger menu",
      "Nav: Logo now links to homepage with gradient text",
      "Footer: Added to all pages, Feedback link moved to footer",
      "Models: Added Quick Start 3-step guide to Models page",
      "Favicon: Replaced black icon with purple gradient to match site branding",
    ],
  },
  {
    date: "2026-04-13",
    title: "UX Improvements",
    items: [
      "Homepage: Replaced model grid with two-button entry cards (Models / Workflows)",
      "Models page: Added 'How to Choose' official guide (Distilled vs Dev, FP8 vs bf16)",
      "Models page: Separated 16GB/24GB/32GB models with VRAM-specific recommendations",
      "Workflows page: Added 'How to Choose' decision guide with 4 scenario cards",
      "VRAM Adapter: Separated checkpoints from required files (VAE always shown)",
      "All pages: Unified two-button pattern (Download / How to Choose)",
    ],
  },
  {
    date: "2026-04-08",
    title: "Site Launch",
    items: [
      "Launched ltxworkflow.com with LTX 2.3 support",
      "ComfyUI workflow JSON generator with official node names",
      "VRAM Adapter for 16GB / 24GB / 32GB GPUs",
      "AI prompt enhancer",
      "Model downloads: dev, distilled, FP8 (Kijai), VAE, spatial upscaler",
      "Google OAuth + email/password authentication",
      "Cloud workflow save via Supabase",
      "Setup guide, model page, workflow templates",
    ],
  },
  {
    date: "2026-04-01",
    title: "LTX 2.3 Released by Lightricks",
    items: [
      "Official LTX 2.3 (22B parameters) released on HuggingFace",
      "Distilled variant: 8 steps, CFG=1, same quality as dev",
      "FP8 quantized variants by Kijai for 16GB VRAM (requires RTX 40xx+)",
      "New ComfyUI nodes: LTXVConditioning, LTXVScheduler, EmptyLTXVLatentVideo",
      "Spatial upscaler x2 for two-stage pipelines",
      "TAE VAE (taeltx2_3.safetensors) required for all workflows",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Release Notes</h1>
        <p className="text-gray-400">Updates to ltx workflow and LTX 2.3 model releases.</p>
      </section>

      <div className="space-y-6">
        {entries.map((e) => (
          <div key={e.date} className="bg-gray-900 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">{e.date}</span>
              <h2 className="font-bold">{e.title}</h2>
            </div>
            <ul className="space-y-1">
              {e.items.map((item) => (
                <li key={item} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-violet-500 shrink-0">+</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Footer />
    </main>
  );
}

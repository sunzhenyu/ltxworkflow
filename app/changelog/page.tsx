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

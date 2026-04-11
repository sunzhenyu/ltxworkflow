import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Changelog — LTX 2.3 Model & Tool Updates",
  description: "Latest updates to ltx workflow: new LTX 2.3 model variants, ComfyUI node changes, and tool improvements.",
  alternates: { canonical: "https://ltxworkflow.com/changelog" },
};

const entries = [
  {
    date: "2026-04-08",
    title: "Site Launch",
    items: [
      "Launched ltxworkflow.com with LTX 2.3 support",
      "ComfyUI workflow JSON generator with official node names",
      "VRAM Adapter for 16GB / 24GB / 32GB GPUs",
      "AI prompt enhancer (gpt-5.2 via yunwu.ai)",
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
        <h1 className="text-3xl font-extrabold">Changelog</h1>
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
    </main>
  );
}

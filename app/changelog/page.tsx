import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Release Notes — LTX 2.3 Model & Tool Updates",
  description: "Latest updates to ltx workflow: new LTX 2.3 model variants, ComfyUI node changes, and tool improvements.",
  alternates: { canonical: "https://ltxworkflow.com/changelog" },
};

const entries = [
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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Related Articles & Resources</h2>
          <p className="text-sm text-gray-400 mt-1">Official documentation, community guides, and technical articles about LTX 2.3.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "LTX 2.3 Model Card",
              source: "HuggingFace",
              url: "https://huggingface.co/Lightricks/LTX-2.3",
              desc: "Official model documentation by Lightricks. Includes architecture details, training data, and usage examples.",
            },
            {
              title: "ComfyUI-LTXVideo README",
              source: "GitHub",
              url: "https://github.com/Lightricks/ComfyUI-LTXVideo",
              desc: "Official ComfyUI nodes for LTX 2.3. Installation guide, node reference, and example workflows.",
            },
            {
              title: "LTX-Video GitHub Repository",
              source: "GitHub",
              url: "https://github.com/Lightricks/LTX-Video",
              desc: "Original LTX-Video model repository. Research paper, training code, and technical specifications.",
            },
            {
              title: "Kijai FP8 Quantization Guide",
              source: "HuggingFace",
              url: "https://huggingface.co/Kijai/LTX2.3_comfy",
              desc: "FP8 quantized models for 16GB VRAM. Includes performance benchmarks and quality comparisons.",
            },
          ].map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors group space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-gray-100 group-hover:text-violet-300">{article.title}</h3>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{article.source}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{article.desc}</p>
              <p className="text-xs text-violet-400 group-hover:text-violet-300">Read more →</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

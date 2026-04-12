import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MODELS } from "@/lib/models";

export const metadata: Metadata = {
  title: "LTX 2.3 Model Download — taeltx2_3.safetensors, FP8, Distilled",
  description: "Download LTX 2.3 models for ComfyUI: taeltx2_3.safetensors (VAE), ltx-2.3-22b-distilled fp8 v3 (16GB), official dev & distilled (32GB). All HuggingFace links.",
  alternates: { canonical: "https://ltxworkflow.com/models" },
};

const VRAM_GROUPS = [
  {
    label: "16GB VRAM — FP8 Quantized (RTX 40xx+)",
    ids: ["ltx23-distilled-fp8", "ltx23-dev-fp8"],
    note: "Requires RTX 40-series or newer for fp8 matrix multiplication. Use Distilled for fastest generation; use Dev if applying LoRA weights.",
  },
  {
    label: "24GB VRAM — Official + Sequential Offloading",
    ids: ["ltx23-distilled-fp8-24gb"],
    note: "Enable sequential offloading in ComfyUI settings (Model Offload or Sequential). Slower than 32GB but uses full-quality official weights.",
  },
  {
    label: "32GB VRAM — Official Full Precision",
    ids: ["ltx23-dev", "ltx23-distilled"],
    note: "Official Lightricks checkpoints at full bf16 precision. Distilled is recommended for most use cases (8 steps, CFG=1).",
  },
  {
    label: "Required for All Setups",
    ids: ["ltx23-vae", "ltx23-spatial-upscaler"],
    note: "Download taeltx2_3.safetensors (VAE) regardless of your VRAM — all ComfyUI workflows require it. Spatial upscaler is optional.",
  },
];

export default function ModelsPage() {
  const modelMap = Object.fromEntries(MODELS.map((m) => [m.id, m]));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/models" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 Model Downloads</h1>
        <p className="text-gray-400">
          All LTX 2.3 model files for ComfyUI — grouped by GPU VRAM. Start with{" "}
          <strong className="text-gray-200">taeltx2_3.safetensors</strong> (VAE, required for every setup),
          then choose a checkpoint based on your VRAM. All links go directly to HuggingFace.
        </p>
      </section>

      {VRAM_GROUPS.map((group) => {
        const models = group.ids.map((id) => modelMap[id]).filter(Boolean);
        return (
          <section key={group.label} className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-gray-100">{group.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{group.note}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {models.map((m) => (
                <div key={m.id} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{m.name}</h3>
                    {m.badge && (
                      <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded font-mono break-all">
                    {m.filename}
                  </code>
                  {m.recommendation && (
                    <p className="text-xs text-gray-300">{m.recommendation}</p>
                  )}
                  <p className="text-xs text-gray-500 flex-1">{m.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{m.size}</span>
                    <span className="text-violet-400">{m.vram}GB+ VRAM</span>
                  </div>
                  <a
                    href={m.hfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    Download on HuggingFace →
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="bg-gray-900 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-bold">Quick Start: What to Download First</h2>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li><strong className="text-gray-200">taeltx2_3.safetensors</strong> → place in <code className="text-green-400">models/vae/</code> (required)</li>
          <li>Pick a checkpoint based on your VRAM (see groups above)</li>
          <li>Place checkpoint in <code className="text-green-400">models/checkpoints/</code></li>
          <li>Optionally add <strong className="text-gray-200">Spatial Upscaler x2</strong> → <code className="text-green-400">models/latent_upscale_models/</code></li>
        </ol>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/guide" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Setup Guide →</p>
          <p className="text-xs text-gray-500 mt-0.5">How to install and configure LTX 2.3 with ComfyUI</p>
        </Link>
        <Link href="/workflows" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Workflow Templates →</p>
          <p className="text-xs text-gray-500 mt-0.5">Download ComfyUI workflow JSON for LTX 2.3</p>
        </Link>
      </div>
    </main>
  );
}

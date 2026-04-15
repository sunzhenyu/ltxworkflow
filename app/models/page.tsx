import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { MODELS } from "@/lib/models";

export const metadata: Metadata = {
  title: "Download LTX 2.3 Models Free — taeltx2_3.safetensors, FP8, Direct Links",
  description: "Free direct download links for all LTX 2.3 ComfyUI models. Get taeltx2_3.safetensors (VAE), FP8 quantized (16GB VRAM), and official checkpoints (32GB). Organized by GPU requirements with installation guide.",
  alternates: { canonical: "https://ltxworkflow.com/models" },
  openGraph: {
    title: "Download LTX 2.3 Models Free — All Variants",
    description: "Direct HuggingFace links to taeltx2_3.safetensors, FP8, and official LTX 2.3 models for ComfyUI",
    url: "https://ltxworkflow.com/models",
    type: "website",
  },
};

const VRAM_GROUPS = [
  {
    id: "16gb",
    label: "16GB VRAM — FP8 Quantized (RTX 40xx+)",
    ids: ["ltx23-distilled-fp8", "ltx23-dev-fp8"],
    note: "Requires RTX 40-series or newer for fp8 matrix multiplication. Use Distilled for fastest generation; use Dev if applying LoRA weights.",
  },
  {
    id: "24gb",
    label: "24GB VRAM — Official + Sequential Offloading",
    ids: ["ltx23-distilled-fp8-24gb"],
    note: "Enable sequential offloading in ComfyUI settings (Model Offload or Sequential). Slower than 32GB but uses full-quality official weights.",
  },
  {
    id: "32gb",
    label: "32GB VRAM — Official Full Precision",
    ids: ["ltx23-dev", "ltx23-distilled"],
    note: "Official Lightricks checkpoints at full bf16 precision. Distilled is recommended for most use cases (8 steps, CFG=1).",
  },
  {
    id: "required",
    label: "Required for All Setups",
    ids: ["ltx23-vae", "ltx23-spatial-upscaler"],
    note: "Download taeltx2_3.safetensors (VAE) regardless of your VRAM — all ComfyUI workflows require it. Spatial upscaler is optional.",
  },
];

export default function ModelsPage() {
  const modelMap = Object.fromEntries(MODELS.map((m) => [m.id, m]));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LTX 2.3 Models",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Windows, Linux",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Free LTX 2.3 AI video generation models for ComfyUI. Includes taeltx2_3.safetensors VAE, FP8 quantized models for 16GB VRAM, and official checkpoints.",
        "downloadUrl": "https://ltxworkflow.com/models",
        "softwareRequirements": "ComfyUI, CUDA GPU with 16GB+ VRAM"
      })}} />
      <Nav activeHref="/models" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Free LTX 2.3 Model Downloads — Direct Links</h1>
        <p className="text-gray-400">
          Download all LTX 2.3 model files for ComfyUI with direct HuggingFace links — organized by GPU VRAM.
          Start with <strong className="text-gray-200">taeltx2_3.safetensors</strong> (VAE, required for all setups),
          then choose a checkpoint: FP8 quantized for 16GB VRAM or official full precision for 32GB+.
        </p>
        <div className="flex gap-3 pt-1">
          <a href="#downloads" className="text-sm bg-violet-700 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
            Download Models ↓
          </a>
          <a href="#guide" className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg transition-colors font-medium">
            How to Choose ↓
          </a>
        </div>
      </section>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700/50 rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-bold text-violet-300">Quick Start: 3 Steps to Get Running</h2>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-violet-400 font-bold shrink-0">1.</span>
            <span>Download <strong>taeltx2_3.safetensors</strong> (VAE) — required for all workflows</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-400 font-bold shrink-0">2.</span>
            <span>Choose your checkpoint: <strong>FP8 v3</strong> (16GB VRAM) or <strong>Official Distilled</strong> (32GB VRAM)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-400 font-bold shrink-0">3.</span>
            <span>Place files in ComfyUI folders: VAE → <code className="text-green-400 bg-gray-900 px-1.5 py-0.5 rounded">models/vae/</code>, Checkpoint → <code className="text-green-400 bg-gray-900 px-1.5 py-0.5 rounded">models/checkpoints/</code></span>
          </li>
        </ol>
      </div>

      {/* Downloads section */}
      <div id="downloads" className="scroll-mt-8 space-y-8">
        {VRAM_GROUPS.map((group) => {
          const models = group.ids.map((id) => modelMap[id]).filter(Boolean);
          return (
            <section key={group.label} id={group.id} className="space-y-3 scroll-mt-8">
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
      </div>

      {/* How to Choose section */}
      <section id="guide" className="scroll-mt-8 bg-gray-900 rounded-xl p-5 space-y-4 border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">Official Guide</span>
          <h2 className="text-base font-bold text-gray-100">How to Choose the Right Model</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Distilled vs Dev</p>
            <p><strong className="text-gray-300">Distilled</strong> — 8 steps, CFG=1. Recommended for most users. Fastest generation, high quality. Cannot be fine-tuned.</p>
            <p><strong className="text-gray-300">Dev</strong> — Full model. Use only if you need LoRA training or fine-tuning. Slower, more flexible.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-200">FP8 vs Full Precision</p>
            <p><strong className="text-gray-300">FP8 (Kijai)</strong> — Quantized to 8-bit float. Runs on 16GB VRAM. Requires RTX 40xx+ for hardware fp8 support. Slight quality trade-off.</p>
            <p><strong className="text-gray-300">Full bf16</strong> — Official Lightricks weights. Best quality. Needs 32GB VRAM, or 24GB with sequential offloading.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Quick decision</p>
            <ul className="space-y-0.5">
              <li>→ <strong className="text-gray-300">16GB, RTX 40xx+:</strong> Distilled FP8 v3</li>
              <li>→ <strong className="text-gray-300">16GB + LoRA:</strong> Dev FP8</li>
              <li>→ <strong className="text-gray-300">24GB:</strong> Official Distilled + offloading</li>
              <li>→ <strong className="text-gray-300">32GB+:</strong> Official Distilled (recommended)</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Always required</p>
            <p><strong className="text-gray-300">taeltx2_3.safetensors</strong> (VAE) — place in <code className="text-green-400">models/vae/</code>. Every workflow needs this regardless of which checkpoint you use.</p>
            <a href="https://github.com/Lightricks/ComfyUI-LTXVideo" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
              Official ComfyUI-LTXVideo README →
            </a>
          </div>
        </div>
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

      <Footer />
    </main>
  );
}

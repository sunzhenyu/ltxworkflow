import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { MODELS } from "@/lib/models";

export const metadata: Metadata = {
  title: "LTX 2.3 Model Download — Dev, Distilled, FP8 Variants",
  description: "Download LTX-2.3 models: official dev & distilled (32GB VRAM), FP8 quantized by Kijai (16GB VRAM). Includes VAE and spatial upscaler for ComfyUI.",
  alternates: { canonical: "https://ltxworkflow.com/models" },
};

export default function ModelsPage() {
  const main = MODELS.filter((m) => m.type !== "lora");
  const extras = MODELS.filter((m) => m.type === "lora");

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-violet-400 font-bold text-lg flex items-center gap-2">
          <Logo size={24} />ltx workflow
        </Link>
      </header>

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 Model Downloads</h1>
        <p className="text-gray-400">All official LTX-2.3 checkpoints and quantized variants. Choose based on your GPU VRAM.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Main Checkpoints</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {main.map((m) => (
            <div key={m.id} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm">{m.name}</h3>
                {m.badge && (
                  <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full shrink-0 ml-2">{m.badge}</span>
                )}
              </div>
              <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded font-mono break-all">{m.filename}</code>
              <p className="text-xs text-gray-400 flex-1">{m.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{m.size}</span>
                <span className="text-violet-400">{m.vram}GB+ VRAM</span>
              </div>
              <a href={m.hfUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1 text-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg transition-colors">
                Download on HuggingFace →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Additional Files</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extras.map((m) => (
            <div key={m.id} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm">{m.name}</h3>
                {m.badge && (
                  <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full shrink-0 ml-2">{m.badge}</span>
                )}
              </div>
              <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded font-mono break-all">{m.filename}</code>
              <p className="text-xs text-gray-400 flex-1">{m.description}</p>
              <span className="text-xs text-gray-500">{m.size}</span>
              <a href={m.hfUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1 text-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg transition-colors">
                Download on HuggingFace →
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pt-2">
        <Link href="/guide">
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            View Setup Guide →
          </button>
        </Link>
      </div>
    </main>
  );
}

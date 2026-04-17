import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import Link from "next/link";
import ModelCards from "@/components/ModelCards";
import VramMatcher from "@/components/VramMatcher";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import PromptEnhancer from "@/components/PromptEnhancer";
import UserMenu from "@/components/UserMenu";

export default async function Home() {
  const session = await auth();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "ltx workflow",
        "url": "https://ltxworkflow.com",
        "description": "Generate ComfyUI workflow JSON for LTX 2.3 video model. Match GPU VRAM, download models, enhance prompts with AI.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      })}} />
      <Nav />

      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Free <span className="text-violet-400">LTX 2.3</span> Download & ComfyUI Workflow Generator
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Download <strong className="text-gray-200">LTX 2.3</strong> models with direct links —{" "}
          <strong className="text-gray-200">taeltx2_3.safetensors</strong> VAE, FP8 quantized (16GB VRAM), and official checkpoints (32GB).
          Generate <strong className="text-gray-200">ComfyUI workflow JSON</strong> instantly.
          Supports T2V, I2V, LoRA, and spatial upscaler.
        </p>

        {/* Startup Fame Highlight Badge */}
        <div className="flex justify-center py-2">
          <a href="https://startupfa.me/s/ltx-workflow?utm_source=ltxworkflow.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://startupfa.me/badges/highlight-badge.webp"
              alt="Featured on Startup Fame - Highlight"
              width="228"
              height="54"
              className="hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        <div className="flex gap-3 justify-center flex-wrap text-sm text-gray-500">
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ taeltx2_3.safetensors</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ FP8 16GB VRAM</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ Free Direct Links</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ ComfyUI Ready</span>
        </div>
      </section>

      <VramMatcher />
      <ModelCards />
      <PromptEnhancer />
      <WorkflowBuilder />

      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold mb-4">Official Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "LTX 2.3 on HuggingFace", desc: "Official model weights by Lightricks", url: "https://huggingface.co/Lightricks/LTX-2.3" },
            { label: "ComfyUI-LTXVideo", desc: "Official ComfyUI nodes & example workflows", url: "https://github.com/Lightricks/ComfyUI-LTXVideo" },
            { label: "Kijai FP8 Models", desc: "FP8 quantized variants for 16GB VRAM", url: "https://huggingface.co/Kijai/LTX2.3_comfy" },
            { label: "LTX-Video GitHub", desc: "Official LTX-Video model repository", url: "https://github.com/Lightricks/LTX-Video" },
            { label: "ComfyUI", desc: "Node-based UI for running diffusion models", url: "https://github.com/comfyanonymous/ComfyUI" },
            { label: "ComfyUI Manager", desc: "Install LTXVideo nodes via Manager", url: "https://github.com/ltdrdata/ComfyUI-Manager" },
          ].map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
              className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
              <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">{r.label} →</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
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
          <span className="text-violet-400">LTX 2.3</span> Download & ComfyUI Workflow Generator
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Download <strong className="text-gray-200">LTX 2.3</strong> models —{" "}
          <strong className="text-gray-200">taeltx2_3.safetensors</strong> VAE, FP8 distilled, and official checkpoints.
          Generate <strong className="text-gray-200">ComfyUI LTX 2.3</strong> workflow JSON.
          Supports LTX 2.3 LoRA, 16GB–32GB VRAM.
        </p>
        <div className="flex gap-3 justify-center flex-wrap text-sm text-gray-500">
          <span className="bg-gray-800 px-3 py-1 rounded-full">taeltx2_3.safetensors</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">ComfyUI LTX 2.3</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">LTX 2.3 LoRA</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">FP8 / 16GB VRAM</span>
        </div>
      </section>

      <VramMatcher />
      <PromptEnhancer />
      <WorkflowBuilder />
      <ModelCards />

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

      <footer className="border-t border-gray-800 pt-8 text-sm text-gray-500 space-y-2">
        <p>
          <strong className="text-gray-400">LTX 2.3</strong> is an open-source video generation model by Lightricks.
          Configure <strong className="text-gray-400">taeltx2_3.safetensors</strong>, generate ComfyUI workflow JSON,
          and optimize LTX 2.3 for 16GB+ VRAM with FP8 quantization. Supports{" "}
          <strong className="text-gray-400">spatial upscaler x2</strong> and all official variants.
        </p>
        <p className="text-xs text-gray-600">ltx workflow — Not affiliated with Lightricks.</p>
      </footer>
    </main>
  );
}

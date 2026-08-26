import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import ModelCards from "@/components/ModelCards";
import VramMatcher from "@/components/VramMatcher";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import EmailSubscribe from "@/components/EmailSubscribe";

export default function Home() {

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LTX Workflow — ComfyUI Workflow Generator for LTX 2.5 & LTX 2.3",
        "url": "https://ltxworkflow.com",
        "description": "Download LTX 2.5 and LTX 2.3 models matched to your GPU VRAM, generate ComfyUI workflow JSON for LTX 2.3, or run image-to-video online with either model.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "featureList": ["T2V workflow generation", "I2V workflow generation", "FP8 model matching", "LoRA workflow support", "VRAM-based GPU matching", "ICLoRA Union Control", "ICLoRA Motion Track", "HDR workflow"],
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      })}} />
      <Nav />

      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Run <span className="text-violet-400">LTX 2.5</span> &{" "}
          <span className="text-violet-400">LTX 2.3</span>{" "}in ComfyUI — Match Your VRAM, Fix Missing Files, Generate the Workflow
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Stuck on a missing <strong className="text-gray-200">taeltx2_3.safetensors</strong>, an out-of-memory error, or the wrong checkpoint for your GPU?
          Pick a model family and your VRAM — LTX 2.5&apos;s gated Gemma 4 files need 24GB+ unless you use the GGUF
          path, LTX 2.3&apos;s FP8 fits 16GB — get the exact files you need, and generate a
          ready-to-import <strong className="text-gray-200">ComfyUI workflow JSON</strong> for LTX 2.3 in under 2 minutes. T2V, I2V, LoRA, and spatial upscaler all supported.
        </p>

        {/* Featured Badges */}
        <div className="hidden flex justify-center gap-4 py-2 flex-wrap">
          <a href="https://startupfa.me/s/ltx-workflow?utm_source=ltxworkflow.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://startupfa.me/badges/highlight-badge.webp"
              alt="Featured on Startup Fame - Highlight"
              width="228"
              height="54"
              className="hover:opacity-80 transition-opacity"
            />
          </a>
          <a href="https://fazier.com/launches/ltxworkflow.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
              alt="Fazier badge"
              width="120"
              height="54"
              className="hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        <div className="flex gap-3 justify-center flex-wrap text-sm text-gray-500">
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ LTX 2.5 & 2.3</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ VRAM Matched (16-32GB)</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ Direct Links</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">✓ ComfyUI Ready</span>
        </div>

        <div className="flex gap-3 justify-center flex-wrap pt-3">
          <Link
            href="/generate"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
          >
            ▶ Try LTX 2.5 & 2.3 Online — Free
          </Link>
          <Link
            href="#vram"
            className="bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
          >
            Match My VRAM →
          </Link>
          <Link
            href="#workflow"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
          >
            Generate Workflow JSON →
          </Link>
        </div>
      </section>

      <VramMatcher />
      <ModelCards />
      <WorkflowBuilder />

      <EmailSubscribe />


      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold mb-4">Official Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "LTX 2.5 on HuggingFace", desc: "Official model weights by Lightricks (gated)", url: "https://huggingface.co/Lightricks/LTX-2.5" },
            { label: "LTX 2.3 on HuggingFace", desc: "Official model weights by Lightricks", url: "https://huggingface.co/Lightricks/LTX-2.3" },
            { label: "ComfyUI-LTXVideo", desc: "Official ComfyUI nodes & example workflows", url: "https://github.com/Lightricks/ComfyUI-LTXVideo" },
            { label: "Kijai FP8 Models (LTX 2.3)", desc: "FP8 quantized variants for 16GB VRAM", url: "https://huggingface.co/Kijai/LTX2.3_comfy" },
            { label: "Abiray GGUF Quants (LTX 2.5)", desc: "Community GGUF quants for 16GB+ VRAM", url: "https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF" },
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

import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "How to Install LTX 2.3 with ComfyUI — Complete Setup Guide (16GB-32GB VRAM)",
  description: "Complete step-by-step guide to install and run LTX 2.3 with ComfyUI. Download taeltx2_3.safetensors, install nodes, configure settings for 16GB or 32GB VRAM. Generate AI videos in minutes.",
  alternates: { canonical: "https://ltxworkflow.com/guide" },
  openGraph: {
    title: "LTX 2.3 ComfyUI Installation Guide — Easy Setup",
    description: "Learn how to install LTX 2.3 with ComfyUI. Step-by-step instructions for downloading models and generating videos.",
    url: "https://ltxworkflow.com/guide",
    type: "article",
  },
};

const steps = [
  {
    title: "1. Install ComfyUI",
    content: "Clone the ComfyUI repository and install dependencies. Requires Python 3.10+ and a CUDA-capable GPU with 16GB+ VRAM.",
    code: "git clone https://github.com/comfyanonymous/ComfyUI\ncd ComfyUI\npip install -r requirements.txt",
  },
  {
    title: "2. Install ComfyUI-LTXVideo Nodes",
    content: "Open ComfyUI Manager, search for \"LTXVideo\", and install the official Lightricks nodes. Or clone manually:",
    code: "cd ComfyUI/custom_nodes\ngit clone https://github.com/Lightricks/ComfyUI-LTXVideo",
  },
  {
    title: "3. Download LTX 2.3 Model",
    content: "Choose the right model for your VRAM. Place checkpoint files in ComfyUI/models/checkpoints/.",
    items: [
      { label: "32GB+ VRAM", value: "ltx-2.3-22b-dev.safetensors or ltx-2.3-22b-distilled.safetensors (official, ~42GB)" },
      { label: "16GB VRAM", value: "ltx-2.3-22b-dev_transformer_only_fp8_input_scaled.safetensors (FP8 by Kijai, ~25GB, requires 40xx+ GPU)" },
    ],
  },
  {
    title: "4. Download Required VAE",
    content: "The TAE (Tiny AutoEncoder) is required for all LTX 2.3 workflows. Place in ComfyUI/models/vae/.",
    code: "# Download from: https://huggingface.co/Kijai/LTX2.3_comfy\n# File: taeltx2_3.safetensors → ComfyUI/models/vae/",
  },
  {
    title: "5. Load a Workflow",
    content: "Use the workflow generator on this site to create a ComfyUI JSON workflow, or download official example workflows from the ComfyUI-LTXVideo repository. Drag the JSON file into ComfyUI to load it.",
  },
  {
    title: "6. Key Parameters",
    items: [
      { label: "Resolution", value: "Must be divisible by 32. Recommended: 768×512 or 1280×720" },
      { label: "Frames", value: "Must be 8n+1: 25, 49, or 97 frames" },
      { label: "Steps (Distilled)", value: "8 steps max, CFG=1" },
      { label: "Steps (Dev)", value: "20–50 steps, CFG=3–7" },
      { label: "Scheduler", value: "euler recommended for most cases" },
    ],
  },
];

export default async function GuidePage() {
  // Fetch video tutorials
  const supabase = await createClient();
  const { data: videoTutorials } = await supabase
    .from("tutorials")
    .select("slug, title, excerpt, video_url")
    .not("video_url", "is", null)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Install LTX 2.3 with ComfyUI",
        "description": "Step-by-step guide to install LTX 2.3 with ComfyUI and generate AI videos.",
        "url": "https://ltxworkflow.com/guide",
        "step": [
          { "@type": "HowToStep", "name": "Install ComfyUI", "text": "Clone ComfyUI and install dependencies." },
          { "@type": "HowToStep", "name": "Install ComfyUI-LTXVideo nodes", "text": "Install official Lightricks nodes via ComfyUI Manager." },
          { "@type": "HowToStep", "name": "Download LTX 2.3 model", "text": "Download the appropriate checkpoint for your VRAM." },
          { "@type": "HowToStep", "name": "Download VAE", "text": "Download taeltx2_3.safetensors and place in models/vae/." },
          { "@type": "HowToStep", "name": "Load workflow", "text": "Generate or download a workflow JSON and drag into ComfyUI." },
        ],
      })}} />
      <Nav activeHref="/guide" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 ComfyUI Setup Guide</h1>
        <p className="text-gray-400">How to install LTX 2.3, download models, and generate AI videos with ComfyUI.</p>
      </section>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.title} className="bg-gray-900 rounded-xl p-5 space-y-3">
            <h2 className="font-bold text-lg">{step.title}</h2>
            {step.content && <p className="text-gray-400 text-sm">{step.content}</p>}
            {step.code && (
              <pre className="bg-gray-950 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {step.code}
              </pre>
            )}
            {step.items && (
              <ul className="space-y-2">
                {step.items.map((item) => (
                  <li key={item.label} className="text-sm flex gap-2">
                    <span className="text-violet-400 font-medium shrink-0">{item.label}:</span>
                    <span className="text-gray-300">{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-lg">Useful Links</h2>
        <ul className="space-y-2 text-sm">
          {[
            { label: "ComfyUI-LTXVideo (official nodes)", url: "https://github.com/Lightricks/ComfyUI-LTXVideo" },
            { label: "LTX 2.3 models on HuggingFace", url: "https://huggingface.co/Lightricks/LTX-2.3" },
            { label: "Kijai FP8 models (16GB VRAM)", url: "https://huggingface.co/Kijai/LTX2.3_comfy" },
            { label: "ComfyUI Manager", url: "https://github.com/ltdrdata/ComfyUI-Manager" },
          ].map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/models" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.3 Model Downloads →</p>
          <p className="text-xs text-gray-500 mt-0.5">All official checkpoints and FP8 variants</p>
        </Link>
        <Link href="/workflows" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Workflow Templates →</p>
          <p className="text-xs text-gray-500 mt-0.5">Official T2V, I2V, ICLoRA workflow JSON files</p>
        </Link>
      </div>

      {videoTutorials && videoTutorials.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📹 Video Tutorials</h2>
            <Link href="/resources/tutorials" className="text-sm text-violet-400 hover:text-violet-300">
              View All →
            </Link>
          </div>
          <p className="text-gray-400 text-sm">
            Watch step-by-step video guides to master LTX 2.3 and ComfyUI workflows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {videoTutorials.map((tutorial) => (
              <Link
                key={tutorial.slug}
                href={`/resources/tutorials/${tutorial.slug}`}
                className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors group space-y-3"
              >
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-gray-100 group-hover:text-violet-300 transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">{tutorial.excerpt}</p>
                <p className="text-xs text-violet-400 group-hover:text-violet-300">Watch Tutorial →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center pt-4">
        <Link href="/">
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Generate ComfyUI Workflow JSON →
          </button>
        </Link>
      </div>

      <Footer />
    </main>
  );
}

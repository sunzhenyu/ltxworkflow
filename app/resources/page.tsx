import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LTX 2.3 Resources — Tutorials, Tools, Workflows & Papers",
  description: "Curated LTX 2.3 resources: official docs, ComfyUI nodes, example workflows, community tutorials, research papers, and showcase examples — organized by what you want to do.",
  alternates: { canonical: "https://ltxworkflow.com/resources" },
  openGraph: {
    title: "LTX 2.3 Resources Hub — Tutorials, Tools, Workflows & Papers",
    description: "Everything you need for LTX 2.3 video generation: setup guides, ComfyUI node plugins, workflow JSONs, community examples, and research papers.",
    url: "https://ltxworkflow.com/resources",
    type: "website",
  },
};

type LinkEntry = {
  title: string;
  description: string;
  href: string;
  kind: "internal" | "external";
};

type Section = {
  id: string;
  emoji: string;
  heading: string;
  subheading: string;
  headerClass: string;
  links: LinkEntry[];
};

const sections: Section[] = [
  {
    id: "learn",
    emoji: "📖",
    heading: "Learn",
    subheading: "Understand how LTX 2.3 works and how to set it up",
    headerClass: "bg-blue-700 text-blue-100",
    links: [
      {
        title: "LTX 2.3 ComfyUI Setup Guide",
        description: "Install ComfyUI, pick the right model for your VRAM, configure IC-LoRAs, and tune key parameters.",
        href: "/guide",
        kind: "internal",
      },
      {
        title: "Step-by-Step Tutorials",
        description: "Curated written tutorials covering I2V, T2V, HDR, Motion Track, and more.",
        href: "/resources/tutorials",
        kind: "internal",
      },
      {
        title: "LTX Workflow Blog",
        description: "Articles, model comparisons, prompting guides, and technique deep-dives.",
        href: "/blog",
        kind: "internal",
      },
      {
        title: "ComfyUI-LTXVideo — Official Nodes",
        description: "Official Lightricks ComfyUI node repository. README covers LTXVConditioning, scheduler, IC-LoRA loaders, and sampler settings.",
        href: "https://github.com/Lightricks/ComfyUI-LTXVideo",
        kind: "external",
      },
      {
        title: "LTX-2.3 Model Card (Lightricks)",
        description: "Official HuggingFace model card: architecture notes, quantization options, and generation parameters.",
        href: "https://huggingface.co/Lightricks/LTX-2.3",
        kind: "external",
      },
      {
        title: "Kijai LTX2.3 Comfy — FP8 / INT8 / MXFP8 Variants",
        description: "Community-built quantized checkpoints optimized for 16–24 GB VRAM. Includes FP8 scaled, INT8 convrot, and MXFP8 block-32 files.",
        href: "https://huggingface.co/Kijai/LTX2.3_comfy",
        kind: "external",
      },
      {
        title: "Comfy-Org LTX-2 Split Files (Gemma 3 Encoders)",
        description: "FP4-mixed (9.5 GB), FP8-scaled (13.2 GB), and full BF16 (24.4 GB) Gemma 3 12B IT text encoders for all VRAM tiers.",
        href: "https://huggingface.co/Comfy-Org/ltx-2/tree/main/split_files/text_encoders",
        kind: "external",
      },
    ],
  },
  {
    id: "tools",
    emoji: "🔧",
    heading: "Tools & Nodes",
    subheading: "ComfyUI extensions and plugins you'll need for advanced LTX 2.3 workflows",
    headerClass: "bg-violet-700 text-violet-100",
    links: [
      {
        title: "Tools Directory",
        description: "Curated list of ComfyUI nodes, plugins, and utilities reviewed for LTX 2.3 compatibility.",
        href: "/resources/tools",
        kind: "internal",
      },
      {
        title: "ComfyUI Manager",
        description: "The standard node installer for ComfyUI. Search and install any node including ComfyUI-LTXVideo directly inside the UI.",
        href: "https://github.com/ltdrdata/ComfyUI-Manager",
        kind: "external",
      },
      {
        title: "comfyui_controlnet_aux",
        description: "Preprocessor nodes for DWPose and Canny — required for the Union Control (Canny + Depth) IC-LoRA workflow.",
        href: "https://github.com/Fannovel16/comfyui_controlnet_aux",
        kind: "external",
      },
      {
        title: "ComfyUI-DepthCrafter-Nodes",
        description: "Depth estimation nodes used to drive the Union Control IC-LoRA depth channel from a reference video.",
        href: "https://github.com/kijai/ComfyUI-DepthCrafter-Nodes",
        kind: "external",
      },
      {
        title: "ComfyUI-Frame-Interpolation",
        description: "RIFE / FILM frame interpolation node — use to smooth temporal upscaling output after the LTX temporal x2 upscaler.",
        href: "https://github.com/Fannovel16/ComfyUI-Frame-Interpolation",
        kind: "external",
      },
      {
        title: "ComfyUI-VideoHelperSuite",
        description: "Video load, save, and preview nodes. Handles MP4 input/output and frame splitting for V2V workflows.",
        href: "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite",
        kind: "external",
      },
    ],
  },
  {
    id: "workflows",
    emoji: "⚡",
    heading: "Workflows",
    subheading: "Get a JSON and start generating right now",
    headerClass: "bg-emerald-700 text-emerald-100",
    links: [
      {
        title: "Workflow Configurator",
        description: "Answer 5 questions about your GPU — get the right workflow JSON, model file, and node settings instantly.",
        href: "/generate",
        kind: "internal",
      },
      {
        title: "Workflow Templates",
        description: "Curated official workflow JSONs: T2V, I2V, Union Control, Motion Track, HDR, LipDub, Upscaler.",
        href: "/workflows",
        kind: "internal",
      },
      {
        title: "Model Downloads",
        description: "All LTX 2.3 checkpoints, VAE files, Gemma encoders, IC-LoRAs, and upscaler files with VRAM guidance.",
        href: "/models",
        kind: "internal",
      },
      {
        title: "Official Example Workflows (GitHub)",
        description: "Lightricks' canonical workflow JSONs for every mode — reference implementation for the node graph structure.",
        href: "https://github.com/Lightricks/ComfyUI-LTXVideo/tree/main/example_workflows",
        kind: "external",
      },
      {
        title: "VRAM Requirements Guide",
        description: "Which GPU works for which configuration. FP8 vs INT8 vs MXFP8 vs NVFP4 decision table.",
        href: "/guide/vram-requirements",
        kind: "internal",
      },
    ],
  },
  {
    id: "showcase",
    emoji: "🎬",
    heading: "Showcase & Community",
    subheading: "See what LTX 2.3 can do and learn from other creators",
    headerClass: "bg-orange-700 text-orange-100",
    links: [
      {
        title: "Showcase Gallery",
        description: "Curated community generations: prompts, parameters, and technique breakdowns.",
        href: "/resources/showcase",
        kind: "internal",
      },
      {
        title: "Community Discussions",
        description: "Hot threads from Reddit and Discord — tips, workarounds, and emerging techniques.",
        href: "/resources/community",
        kind: "internal",
      },
      {
        title: "r/ltxvideo — Subreddit",
        description: "The main community hub for LTX Video discussion, examples, and troubleshooting.",
        href: "https://www.reddit.com/r/ltxvideo/",
        kind: "external",
      },
      {
        title: "r/comfyui — LTX 2.3 Posts",
        description: "ComfyUI community discussion filtered for LTX workflows, IC-LoRA setups, and generation tips.",
        href: "https://www.reddit.com/r/comfyui/search/?q=ltx+2.3&sort=top",
        kind: "external",
      },
      {
        title: "Lightricks Discord",
        description: "Official Lightricks community server — early announcements, IC-LoRA releases, and direct developer feedback.",
        href: "https://discord.gg/Lightricks",
        kind: "external",
      },
    ],
  },
  {
    id: "research",
    emoji: "🔬",
    heading: "Research & Papers",
    subheading: "The technical foundations behind LTX 2.3 and related video generation models",
    headerClass: "bg-red-700 text-red-100",
    links: [
      {
        title: "Research Papers",
        description: "Curated arXiv paper summaries with context on what each contribution means for LTX 2.3 users.",
        href: "/resources/research",
        kind: "internal",
      },
      {
        title: "LTX-Video: Realtime Video Latent Diffusion (arXiv)",
        description: "The original LTX-Video paper introducing the architecture, causal VAE, and rectified-flow training that underlies LTX 2.3.",
        href: "https://arxiv.org/abs/2501.00103",
        kind: "external",
      },
      {
        title: "DepthCrafter: Consistent Depth Estimation for Video (arXiv)",
        description: "The depth estimation model powering the Union Control IC-LoRA depth channel in ComfyUI-LTXVideo.",
        href: "https://arxiv.org/abs/2409.02095",
        kind: "external",
      },
      {
        title: "JustDubIt: Audio-Visual Lip-Dubbing (arXiv)",
        description: "Research behind the LipDub IC-LoRA — joint audio-visual generation that drives the lip-sync capability in LTX 2.3.",
        href: "https://arxiv.org/abs/2506.05691",
        kind: "external",
      },
      {
        title: "JavisBench: Audio-Visual Benchmark",
        description: "Benchmark used to measure audio-video sync quality. The LipDub LoRA achieves DeSync score 0.269 (vs 0.569 baseline) on this benchmark.",
        href: "https://arxiv.org/abs/2503.23528",
        kind: "external",
      },
    ],
  },
];

export default function ResourcesHubPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <Nav activeHref="/resources" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 Resources</h1>
        <p className="text-gray-400 max-w-2xl">
          Everything in one place — organized by what you want to do. Pick a section, follow the links, and you&apos;ll find the right source without digging through five different sites.
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${section.headerClass}`}>
              {section.emoji} {section.heading}
            </span>
            <p className="text-sm text-gray-400">{section.subheading}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.links.map((link) =>
              link.kind === "internal" ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-gray-900 rounded-xl px-4 py-3.5 hover:bg-gray-800 transition-colors group flex flex-col gap-1.5"
                >
                  <p className="text-sm font-semibold text-violet-400 group-hover:text-violet-300 leading-snug">
                    {link.title} →
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{link.description}</p>
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 rounded-xl px-4 py-3.5 hover:bg-gray-800 transition-colors group flex flex-col gap-1.5"
                >
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-white leading-snug">
                    {link.title} ↗
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{link.description}</p>
                </a>
              )
            )}
          </div>
        </section>
      ))}

      <div className="border-t border-gray-800 pt-6 text-center">
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

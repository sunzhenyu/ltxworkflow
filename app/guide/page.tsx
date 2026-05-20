import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI Setup Guide — Install, Download, IC-LoRAs, HDR (16-32GB)",
  description: "Complete step-by-step guide: install ComfyUI + LTX 2.3 nodes, download checkpoints / Gemma 3 text encoder / IC-LoRAs (Union Control, Motion Track, HDR, LipDub), and use the workflow Configurator. For 16GB to 32GB+ VRAM.",
  alternates: { canonical: "https://ltxworkflow.com/guide" },
  openGraph: {
    title: "LTX 2.3 ComfyUI Setup Guide — Install, IC-LoRAs, HDR, Gemma Encoder",
    description: "Install LTX 2.3 with ComfyUI, pick the right Gemma encoder for your VRAM, and use IC-LoRAs for Canny+Depth control, motion tracks, HDR, and lip-dubbing.",
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
      { label: "16GB, RTX 40xx+", value: "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors — v1.1 Distilled FP8 by Kijai (~25GB). Fastest, best quality for 16GB." },
      { label: "16GB + LoRA", value: "ltx-2.3-22b-dev_transformer_only_fp8_scaled.safetensors — Dev FP8 by Kijai (~25GB). Use this if you want to apply LoRA weights." },
      { label: "16GB, older GPU", value: "ltx-2.3-22b-distilled-1.1_transformer_only_mxfp8_block32.safetensors — MXFP8 variant for GPUs without standard FP8 support." },
      { label: "16/24GB, RTX 50xx", value: "ltx-2.3-22b-dev-nvfp4.safetensors — Official NVFP4 dev model (21.7 GB). Native nvfp4 matmul on Blackwell. Falls back to slow paths on older GPUs." },
      { label: "24GB VRAM", value: "ltx-2.3-22b-distilled-1.1.safetensors — Official v1.1 with sequential offloading enabled in ComfyUI settings." },
      { label: "32GB+ VRAM", value: "ltx-2.3-22b-distilled-1.1.safetensors — Official v1.1 full bf16 precision. Best quality, recommended for 32GB." },
      { label: "32GB, training", value: "ltx-2.3-22b-dev.safetensors — Full dev model. Use only for LoRA training or fine-tuning." },
    ],
  },
  {
    title: "4. Download Required VAE",
    content: "The TAE (Tiny AutoEncoder) is required for all LTX 2.3 workflows. Place in ComfyUI/models/vae/. For audio-conditioned workflows, also download the Audio VAE.",
    code: "# Required — Download from: https://huggingface.co/Kijai/LTX2.3_comfy\n# File: taeltx2_3.safetensors → ComfyUI/models/vae/\n\n# Audio-to-video workflows only:\n# File: LTX23_audio_vae_bf16.safetensors → ComfyUI/models/vae/",
  },
  {
    title: "5. Download the Gemma 3 12B Text Encoder",
    content: "LTX 2.3 uses Gemma 3 12B IT as its text encoder. Every workflow needs one of these files in ComfyUI/models/text_encoders/. Pick by VRAM, not by preference — the full BF16 file OOMs alongside the transformer on 16/24 GB cards.",
    items: [
      { label: "16GB / 24GB (recommended)", value: "gemma_3_12B_it_fp4_mixed.safetensors (9.5 GB, ~90% FP4 layers) — leaves headroom for the transformer." },
      { label: "16GB / 24GB (alternative)", value: "gemma_3_12B_it_fp8_scaled.safetensors (13.2 GB) — slightly higher precision than FP4 at 3.7 GB more VRAM." },
      { label: "32GB+", value: "gemma_3_12B_it.safetensors (24.4 GB) BF16 from Comfy-Org. IMPORTANT: rename the file to comfy_gemma_3_12B_it.safetensors after download — every workflow JSON references that exact name." },
      { label: "Source", value: "All three: https://huggingface.co/Comfy-Org/ltx-2/tree/main/split_files/text_encoders" },
    ],
  },
  {
    title: "6. Load a Workflow",
    content: "Use the ComfyUI Workflow Configurator on the homepage to pick a JSON for your GPU, mode, and control type — or download official example workflows from the ComfyUI-LTXVideo repository. Drag the JSON into ComfyUI to load it. The Configurator also tells you which model file and encoder file to select in each node, so you don't have to guess.",
  },
  {
    title: "7. Use IC-LoRAs (Control, HDR, LipDub, Motion Track)",
    content: "IC-LoRAs are In-Context LoRAs that attach on top of the dev model to add structural control, HDR output, lip-sync, or trajectory-driven motion. They share one rule: download the .safetensors into ComfyUI/models/loras/, then load through LTXICLoRALoaderModelOnly (not the normal LoraLoader) so the Reference Downscale Factor of 0.5 is applied. Pair each IC-LoRA with the distilled LoRA v1.1 at strength 0.5 for speed.",
    items: [
      { label: "Union Control (Canny + Depth)", value: "ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors. Pick \"V2V Composition\" in the Configurator — it generates LTX-2.3_ICLoRA_Union_Control_Distilled.json with the right LTXICLoRALoaderModelOnly + LTXAddVideoICLoRAGuide wiring. Requires comfyui_controlnet_aux (DWPose + Canny preprocessors) and ComfyUI-DepthCrafter-Nodes for depth." },
      { label: "Motion Track", value: "ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors. Pick \"Motion Track\" in the Configurator. Draw motion splines directly inside the LTXVSparseTrackEditor node (bundled with ComfyUI-LTXVideo, no extra plugins). Use it to animate a still image along your trajectories." },
      { label: "HDR", value: "ltx-2.3-22b-ic-lora-hdr-0.9.safetensors + ltx-2.3-22b-ic-lora-hdr-scene-emb.safetensors. Toggle \"HDR output\" in the Configurator (needs 24 GB+ — uses dev FP8). Outputs linear HDR EXR. Set OPENCV_IO_ENABLE_OPENEXR=1 in your shell before starting ComfyUI, otherwise the EXR save fails." },
      { label: "LipDub", value: "ltx-2.3-22b-ic-lora-lipdub-0.9.safetensors. No Configurator preset yet — use the official IC-LoRA workflow from Lightricks/ComfyUI-LTXVideo, swap the IC-LoRA file to lipdub, and pair with the audio VAE (LTX23_audio_vae_bf16.safetensors)." },
      { label: "Common gotcha", value: "Loading IC-LoRAs through plain LoraLoader breaks the Reference Downscale Factor — outputs come back blurry or with no control influence. Always use LTXICLoRALoaderModelOnly + LTXAddVideoICLoRAGuide." },
      { label: "Version pinning", value: "Always pair IC-LoRAs with the distilled LoRA v1.1 — the official JSONs ship v1.0 references by mistake. v1.0 on a v1.1 base causes stiff motion and color drift." },
    ],
  },
  {
    title: "8. Key Parameters",
    items: [
      { label: "Resolution", value: "Both width and height must be divisible by 32. Use 1280×704 (not 1280×720) and 1920×1088 (not 1920×1080)" },
      { label: "Frames", value: "Must be 8n+1: 65, 97, 121, or 161 frames. Official range: 65–257." },
      { label: "Steps (Distilled)", value: "8 steps, CFG=1, sampler=euler_ancestral_cfg_pp. Do NOT raise CFG — doubles VRAM without quality gain." },
      { label: "Steps (Dev)", value: "20–50 steps, CFG=3–5. Required for LoRA training." },
      { label: "Scheduler", value: "euler_ancestral_cfg_pp recommended (verified from official JSONs). HDR workflow uses plain euler_ancestral with ManualSigmas." },
      { label: "FP8 vs MXFP8 vs NVFP4", value: "FP8 scaled: RTX 40xx+ FP8 matmul. MXFP8 block-32: alternative format for GPUs without standard FP8 support. NVFP4: Blackwell-only (RTX 50xx) — falls back to slow paths on older cards, so prefer FP8 on RTX 40xx." },
      { label: "Upscalers", value: "Spatial x1.5 / x2 for resolution upscaling (models/latent_upscale_models/). Always use the v1.1 spatial upscaler — v1.0 produces text/logo artifacts in the last frames. Temporal x2 to double frame count." },
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
    .limit(6);

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
          { "@type": "HowToStep", "name": "Download Gemma 3 12B text encoder", "text": "Pick the FP4-mixed, FP8-scaled, or BF16 Gemma 3 12B file by VRAM and place in models/text_encoders/." },
          { "@type": "HowToStep", "name": "Load a workflow", "text": "Generate a JSON in the ComfyUI Workflow Configurator and drag it into ComfyUI." },
          { "@type": "HowToStep", "name": "Use IC-LoRAs", "text": "Install IC-LoRAs into models/loras/ and load through LTXICLoRALoaderModelOnly for Union Control, Motion Track, HDR, or LipDub." },
          { "@type": "HowToStep", "name": "Tune key parameters", "text": "Set resolution divisible by 32, frames 8n+1, distilled 8 steps CFG=1, dev 20+ steps." },
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
        <Link href="/guide/vram-requirements" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">VRAM Requirements →</p>
          <p className="text-xs text-gray-500 mt-0.5">Which GPU do you need? Full compatibility table</p>
        </Link>
      </div>

      {videoTutorials && videoTutorials.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Video Tutorials</h2>
              <p className="text-gray-400 text-sm">Step-by-step video guides to master LTX 2.3 and ComfyUI workflows.</p>
            </div>
            <Link href="/resources/tutorials" className="text-sm text-violet-400 hover:text-violet-300 shrink-0">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoTutorials.map((tutorial) => {
              const isBilibili = tutorial.video_url?.includes("bilibili");
              return (
                <Link
                  key={tutorial.slug}
                  href={`/resources/tutorials/${tutorial.slug}`}
                  className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors group flex gap-4 items-start"
                >
                  <div className="w-24 h-16 shrink-0 bg-gray-800 rounded-lg flex items-center justify-center relative">
                    <svg className="w-8 h-8 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded ${isBilibili ? "bg-pink-600 text-white" : "bg-red-600 text-white"}`}>
                      {isBilibili ? "B站" : "YT"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-sm text-gray-100 group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                      {tutorial.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{tutorial.excerpt}</p>
                    <p className="text-xs text-violet-400 group-hover:text-violet-300">Watch →</p>
                  </div>
                </Link>
              );
            })}
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

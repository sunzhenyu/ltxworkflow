import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI Workflow JSON Download — T2V, I2V, LoRA, Two-Stage",
  description: "Download LTX 2.3 ComfyUI workflow JSON files: T2V/I2V single-stage distilled, two-stage upscaler, ICLoRA union control, motion tracking. Drag into ComfyUI to load.",
  alternates: { canonical: "https://ltxworkflow.com/workflows" },
};

const workflows = [
  {
    name: "T2V / I2V Single Stage Distilled",
    file: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
    tags: ["T2V", "I2V", "Distilled", "Beginner"],
    vram: "16GB+",
    steps: "8 steps, CFG=1",
    useCase: "Start here. Text-to-video and image-to-video in one workflow using the distilled model. Fastest generation, works on 16GB VRAM with FP8.",
    requires: ["taeltx2_3.safetensors (VAE)", "ltx-2.3-22b-distilled_...fp8_input_scaled_v3.safetensors (16GB) or ltx-2.3-22b-distilled.safetensors (32GB)"],
  },
  {
    name: "T2V / I2V Two Stage Distilled",
    file: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
    tags: ["T2V", "I2V", "Distilled", "Upscaler", "High-Res"],
    vram: "16GB+",
    steps: "8 steps + upscale",
    useCase: "Two-stage pipeline: generate at low resolution then upscale 2× with the spatial upscaler. Better quality at higher resolution.",
    requires: ["taeltx2_3.safetensors (VAE)", "Distilled checkpoint (FP8 or full)", "ltx-2.3-spatial-upscaler-x2-1.0.safetensors"],
  },
  {
    name: "ICLoRA Union Control Distilled",
    file: "LTX-2.3_ICLoRA_Union_Control_Distilled.json",
    tags: ["ICLoRA", "LoRA", "Control", "Distilled", "Advanced"],
    vram: "16GB+",
    steps: "8 steps, CFG=1",
    useCase: "Image-conditioned LoRA with union control net. Apply a LoRA and control signal simultaneously for precise video generation from a reference image.",
    requires: ["taeltx2_3.safetensors (VAE)", "Distilled checkpoint", "A compatible LTX 2.3 LoRA file"],
  },
  {
    name: "ICLoRA Motion Track Distilled",
    file: "LTX-2.3_ICLoRA_Motion_Track_Distilled.json",
    tags: ["ICLoRA", "LoRA", "Motion", "Distilled", "Advanced"],
    vram: "16GB+",
    steps: "8 steps, CFG=1",
    useCase: "Motion tracking with ICLoRA. Define motion trajectories to control how objects or subjects move through the generated video.",
    requires: ["taeltx2_3.safetensors (VAE)", "Distilled checkpoint", "A compatible LTX 2.3 LoRA file"],
  },
];

export default function WorkflowsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/workflows" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 ComfyUI Workflow JSON</h1>
        <p className="text-gray-400">
          Download official LTX 2.3 ComfyUI workflow JSON files from Lightricks.
          Drag any <strong className="text-gray-200">.json</strong> file into ComfyUI to load it instantly.
          All workflows require <strong className="text-gray-200">taeltx2_3.safetensors</strong> (VAE) —{" "}
          <Link href="/models" className="text-violet-400 hover:text-violet-300 underline">download it here</Link> first.
        </p>
      </section>

      <section className="bg-gray-900 rounded-xl p-5 space-y-4 border border-violet-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">Quick Pick</span>
          <h2 className="text-sm font-bold text-gray-100">Which workflow should I use?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              q: "First time with LTX 2.3?",
              a: "Single Stage Distilled",
              detail: "Fastest setup. Works on 16GB VRAM with FP8. T2V + I2V in one workflow.",
            },
            {
              q: "Want higher resolution output?",
              a: "Two Stage Distilled",
              detail: "Generate at low res, then upscale 2× with the spatial upscaler model.",
            },
            {
              q: "Have a LTX 2.3 LoRA?",
              a: "ICLoRA Union Control",
              detail: "Apply LoRA + control signal together. Use with a reference image.",
            },
            {
              q: "Want to control motion paths?",
              a: "ICLoRA Motion Track",
              detail: "Draw motion trajectories to control how subjects move in the video.",
            },
          ].map((item) => (
            <div key={item.q} className="bg-gray-800 rounded-lg px-4 py-3 space-y-1">
              <p className="text-xs text-gray-400">{item.q}</p>
              <p className="text-sm font-semibold text-violet-300">→ {item.a}</p>
              <p className="text-xs text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {workflows.map((w) => (
          <div key={w.file} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3">
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-gray-100">{w.name}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">{w.useCase}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {w.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
              ))}
              <span className="text-xs bg-gray-800 text-violet-400 px-2 py-0.5 rounded-full">{w.vram}</span>
              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{w.steps}</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Requires:</p>
              <ul className="space-y-0.5">
                {w.requires.map((r) => (
                  <li key={r} className="text-xs text-gray-500 flex gap-1.5 items-start">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    <code className="break-all">{r}</code>
                  </li>
                ))}
              </ul>
            </div>

            <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded font-mono break-all">{w.file}</code>

            <a
              href={`/example_workflows/${w.file}`}
              download
              className="text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Download JSON →
            </a>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-2">
        <h2 className="font-bold text-sm">Custom Workflow Generator</h2>
        <p className="text-sm text-gray-400">
          Generate a personalized ComfyUI LTX 2.3 workflow JSON with your own prompt, resolution, VRAM, and model settings.
        </p>
        <Link href="/">
          <button className="mt-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Open Workflow Generator →
          </button>
        </Link>
      </div>
    </main>
  );
}

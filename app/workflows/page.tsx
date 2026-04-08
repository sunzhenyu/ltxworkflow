import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "LTX 2.3 ComfyUI Workflow Templates — T2V, I2V, Distilled",
  description: "Download official LTX-2.3 ComfyUI workflow JSON templates. Text-to-video, image-to-video, single-stage and two-stage distilled pipelines.",
  alternates: { canonical: "https://ltxworkflow.com/workflows" },
};

const workflows = [
  {
    name: "T2V / I2V Single Stage Distilled (Full)",
    description: "Text-to-video and image-to-video in a single stage using the distilled model. Best for fast generation with 8 steps.",
    file: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
    tags: ["T2V", "I2V", "Distilled", "Single Stage"],
  },
  {
    name: "T2V / I2V Two Stage Distilled",
    description: "Two-stage pipeline with spatial upscaler x2. Higher output resolution using the distilled model.",
    file: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
    tags: ["T2V", "I2V", "Distilled", "Upscaler"],
  },
  {
    name: "ICLoRA Union Control Distilled",
    description: "Image-conditioned LoRA with union control. Advanced conditioning for precise video generation.",
    file: "LTX-2.3_ICLoRA_Union_Control_Distilled.json",
    tags: ["ICLoRA", "Control", "Distilled"],
  },
  {
    name: "ICLoRA Motion Track Distilled",
    description: "Motion tracking with ICLoRA. Generate videos with controlled motion trajectories.",
    file: "LTX-2.3_ICLoRA_Motion_Track_Distilled.json",
    tags: ["ICLoRA", "Motion", "Distilled"],
  },
];

export default function WorkflowsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.3 ComfyUI Workflow Templates</h1>
        <p className="text-gray-400">Official workflow JSON files from Lightricks. Drag into ComfyUI to load instantly.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {workflows.map((w) => (
          <div key={w.file} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-sm">{w.name}</h2>
            <p className="text-xs text-gray-400 flex-1">{w.description}</p>
            <div className="flex flex-wrap gap-1">
              {w.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
            <a href={`/example_workflows/${w.file}`} download
              className="text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors">
              Download JSON →
            </a>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-2">
        <h2 className="font-bold">Custom Workflow Generator</h2>
        <p className="text-sm text-gray-400">Generate a personalized ComfyUI workflow JSON with your own prompt, resolution, and model settings.</p>
        <Link href="/">
          <button className="mt-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Open Workflow Generator →
          </button>
        </Link>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import { generateWorkflowJSON, WorkflowParams } from "@/lib/workflow";
import { MODELS } from "@/lib/models";

const RESOLUTIONS: WorkflowParams["resolution"][] = ["512x512", "768x512", "1024x576", "1280x720"];
const FRAMES: WorkflowParams["frames"][] = [25, 49, 97];
const FPS_OPTIONS: WorkflowParams["fps"][] = [8, 16, 24];
const SCHEDULERS: WorkflowParams["scheduler"][] = ["euler", "dpm", "lcm"];

export default function AdvancedWorkflowBuilder({ userId }: { userId: string }) {
  const [params, setParams] = useState<WorkflowParams>({
    resolution: "1024x576",
    frames: 49,
    fps: 24,
    steps: 30,
    cfg: 3.5,
    seed: 42,
    scheduler: "euler",
    prompt: "",
    negativePrompt: "blurry, low quality, distorted, watermark",
    modelFile: "ltx-2.3-22b-dev.safetensors",
  });
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof WorkflowParams>(k: K, v: WorkflowParams[K]) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  async function enhancePrompt() {
    if (!params.prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: params.prompt }),
      });
      const data = await res.json();
      if (data.enhanced) set("prompt", data.enhanced);
    } finally {
      setEnhancing(false);
    }
  }

  function downloadJSON() {
    const json = generateWorkflowJSON(params);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ltx23_${params.resolution}_${params.frames}f.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveWorkflow() {
    setSaving(true);
    try {
      await fetch("/api/workflows/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, params, name: `${params.resolution} ${params.frames}f` }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const json = generateWorkflowJSON(params);

  return (
    <section className="bg-gray-900 rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold">Advanced Workflow Builder</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Model */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Model</label>
            <select className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={params.modelFile} onChange={(e) => set("modelFile", e.target.value)}>
              {MODELS.filter((m) => m.type !== "lora").map((m) => (
                <option key={m.id} value={m.filename}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Resolution</label>
            <div className="flex gap-2 flex-wrap">
              {RESOLUTIONS.map((r) => (
                <button key={r} onClick={() => set("resolution", r)}
                  className={`px-3 py-1.5 rounded text-xs font-mono ${params.resolution === r ? "bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Frames + FPS */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Frames</label>
              <div className="flex gap-2">
                {FRAMES.map((f) => (
                  <button key={f} onClick={() => set("frames", f)}
                    className={`px-3 py-1.5 rounded text-xs ${params.frames === f ? "bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">FPS</label>
              <div className="flex gap-2">
                {FPS_OPTIONS.map((f) => (
                  <button key={f} onClick={() => set("fps", f)}
                    className={`px-3 py-1.5 rounded text-xs ${params.fps === f ? "bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced params */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Steps</label>
              <input type="number" min={1} max={100} value={params.steps}
                onChange={(e) => set("steps", Number(e.target.value))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">CFG Scale</label>
              <input type="number" min={1} max={20} step={0.5} value={params.cfg}
                onChange={(e) => set("cfg", Number(e.target.value))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Seed</label>
              <input type="number" value={params.seed}
                onChange={(e) => set("seed", Number(e.target.value))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Scheduler */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Scheduler</label>
            <div className="flex gap-2">
              {SCHEDULERS.map((s) => (
                <button key={s} onClick={() => set("scheduler", s)}
                  className={`px-3 py-1.5 rounded text-xs capitalize ${params.scheduler === s ? "bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Prompt</label>
              <button onClick={enhancePrompt} disabled={enhancing || !params.prompt.trim()}
                className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-40">
                {enhancing ? "Enhancing..." : "Enhance with AI"}
              </button>
            </div>
            <textarea rows={4} value={params.prompt} onChange={(e) => set("prompt", e.target.value)}
              placeholder="Describe your video scene..."
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Negative Prompt</label>
            <textarea rows={2} value={params.negativePrompt} onChange={(e) => set("negativePrompt", e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={downloadJSON}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              Download JSON
            </button>
            <button onClick={saveWorkflow} disabled={saving}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              {saved ? "Saved!" : saving ? "Saving..." : "Save to Cloud"}
            </button>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="bg-gray-950 rounded-lg p-4 overflow-auto max-h-[600px]">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

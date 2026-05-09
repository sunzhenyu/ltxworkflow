"use client";
import { useState } from "react";
import Link from "next/link";
import { recommendWorkflow, WorkflowConfig } from "@/lib/workflow";
import { MODELS } from "@/lib/models";

const RESOLUTIONS: WorkflowConfig["resolution"][] = ["768x512", "1024x576", "1280x720", "1920x1080"];
const FRAMES: WorkflowConfig["frames"][] = [25, 49, 97, 121];
const FPS_OPTIONS: WorkflowConfig["fps"][] = [8, 16, 24, 25];

const DEFAULT_MODEL_FILE = "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors";

export default function WorkflowBuilder() {
  const [config, setConfig] = useState<WorkflowConfig>({
    mode: "i2v",
    modelFile: DEFAULT_MODEL_FILE,
    resolution: "1024x576",
    frames: 49,
    fps: 25,
    useHDR: false,
    useUpscaler: false,
  });

  function set<K extends keyof WorkflowConfig>(k: K, v: WorkflowConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  function changeModel(filename: string) {
    setConfig((c) => ({ ...c, modelFile: filename }));
  }

  const rec = recommendWorkflow(config);

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-bold">ComfyUI Workflow Configurator</h2>
        <p className="text-sm text-gray-400">
          Tell us what you want to generate — we&apos;ll recommend the right official workflow and tell you exactly which nodes to update.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Controls ── */}
        <div className="space-y-5">

          {/* Mode */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">What are you generating?</label>
            <div className="flex gap-2">
              {(["i2v", "t2v"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => set("mode", m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.mode === m ? "bg-violet-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {m === "i2v" ? "Image → Video" : "Text → Video"}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Model</label>
            <select
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={config.modelFile}
              onChange={(e) => changeModel(e.target.value)}
            >
              {MODELS.filter((m) => m.type !== "lora").map((m) => (
                <option key={m.id} value={m.filename}>
                  {m.isNew ? "🔥 " : ""}{m.name} — {m.vram}GB VRAM
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {MODELS.find((m) => m.filename === config.modelFile)?.recommendation ?? ""}
            </p>
          </div>

          {/* Resolution */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Resolution</label>
            <div className="flex gap-2 flex-wrap">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => set("resolution", r)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    config.resolution === r ? "bg-violet-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Frames + FPS */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">Frames</label>
              <div className="flex gap-2 flex-wrap">
                {FRAMES.map((f) => (
                  <button
                    key={f}
                    onClick={() => set("frames", f)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${
                      config.frames === f ? "bg-violet-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">Must be 8n+1</p>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1.5 block">FPS</label>
              <div className="flex gap-2 flex-wrap">
                {FPS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => set("fps", f)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${
                      config.fps === f ? "bg-violet-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 block">Options</label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.useUpscaler}
                onChange={(e) => set("useUpscaler", e.target.checked)}
                disabled={config.useHDR}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Use 2× spatial upscaler <span className="text-xs text-gray-500">(better quality, slower)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.useHDR}
                onChange={(e) => {
                  set("useHDR", e.target.checked);
                  if (e.target.checked) set("useUpscaler", false);
                }}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                HDR output <span className="text-xs text-gray-500">(requires Gemma 3 12B + HDR LoRA)</span>
              </span>
            </label>
          </div>
        </div>

        {/* ── Right: Recommendation ── */}
        <div className="space-y-4">
          {/* Recommended workflow */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-violet-400 font-medium uppercase tracking-wide mb-1">Recommended workflow</p>
                <p className="text-sm font-bold text-white">{rec.workflowName}</p>
              </div>
              <a
                href={`/example_workflows/${rec.workflowFile}`}
                download
                className="shrink-0 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Download JSON →
              </a>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{rec.reason}</p>

            {/* Warnings */}
            {rec.warnings.length > 0 && (
              <div className="space-y-1">
                {rec.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-400 flex gap-1.5">
                    <span className="shrink-0">⚠</span>{w}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Required files */}
          <div className="bg-gray-800/60 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-400 font-medium">Required files</p>
            <ul className="space-y-1">
              {rec.requiredFiles.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-gray-300">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                  <code className="break-all">{f}</code>
                </li>
              ))}
            </ul>
            <Link href="/models" className="text-xs text-violet-400 hover:text-violet-300 underline">
              Download models →
            </Link>
          </div>

          {/* Node instructions */}
          <div className="bg-gray-800/60 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-400 font-medium">What to change after loading the workflow</p>
            <div className="space-y-2">
              {rec.nodeInstructions.map((inst, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-mono bg-gray-900 px-1.5 py-0.5 rounded">{inst.nodeName}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-400">{inst.field}:</span>
                    <code className="text-emerald-300 font-mono break-all">{inst.value}</code>
                  </div>
                  {inst.note && <p className="text-gray-600 pl-1">{inst.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

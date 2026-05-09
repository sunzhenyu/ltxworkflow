"use client";
import { useState } from "react";
import Link from "next/link";
import { recommendWorkflow, deriveModelFile, WorkflowConfig } from "@/lib/workflow";

type Vram = WorkflowConfig["vram"];
type Mode = WorkflowConfig["mode"];
type Priority = WorkflowConfig["priority"];

const VRAM_OPTIONS: { value: Vram; label: string; sub: string }[] = [
  { value: "16gb", label: "16 GB", sub: "RTX 3080 / 4080 / etc." },
  { value: "24gb", label: "24 GB", sub: "RTX 3090 / 4090" },
  { value: "32gb", label: "32 GB+", sub: "A100 / H100 / Pro" },
];

const RESOLUTIONS_BY_VRAM: Record<Vram, WorkflowConfig["resolution"][]> = {
  "16gb": ["768x512", "1024x576"],
  "24gb": ["768x512", "1024x576", "1280x720", "1920x1080"],
  "32gb": ["768x512", "1024x576", "1280x720", "1920x1080"],
};

const DEFAULT_RES_BY_VRAM: Record<Vram, WorkflowConfig["resolution"]> = {
  "16gb": "768x512",
  "24gb": "1024x576",
  "32gb": "1280x720",
};

const FRAME_OPTIONS: { value: WorkflowConfig["frames"]; label: string; sub: string }[] = [
  { value: 65, label: "65 f", sub: "~3–5 s" },
  { value: 97, label: "97 f", sub: "~5–7 s" },
  { value: 121, label: "121 f", sub: "~5–8 s ★" },
  { value: 161, label: "161 f", sub: "~7–11 s" },
];

const FPS_OPTIONS: { value: WorkflowConfig["fps"]; label: string }[] = [
  { value: 24, label: "24 fps (cinematic)" },
  { value: 25, label: "25 fps (default)" },
  { value: 30, label: "30 fps (smooth)" },
];

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-violet-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function WorkflowBuilder() {
  const [config, setConfig] = useState<WorkflowConfig>({
    vram: "16gb",
    mode: "i2v",
    priority: "speed",
    resolution: "768x512",
    frames: 121,
    fps: 24,
    useHDR: false,
    useUpscaler: false,
  });

  function set<K extends keyof WorkflowConfig>(k: K, v: WorkflowConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  function changeVram(vram: Vram) {
    const validRes = RESOLUTIONS_BY_VRAM[vram];
    const currentOk = validRes.includes(config.resolution);
    setConfig((c) => ({
      ...c,
      vram,
      resolution: currentOk ? c.resolution : DEFAULT_RES_BY_VRAM[vram],
      useHDR: vram === "16gb" ? false : c.useHDR,
    }));
  }

  const rec = recommendWorkflow(config);
  const modelFile = deriveModelFile(config);
  const availableRes = RESOLUTIONS_BY_VRAM[config.vram];

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-xl font-bold">ComfyUI Workflow Configurator</h2>
        <p className="text-sm text-gray-400">
          Answer 4 questions — we&apos;ll pick the right workflow and model for your GPU.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Questions ── */}
        <div className="space-y-6">

          {/* Q1: VRAM */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              1 · How much GPU VRAM do you have?
            </label>
            <div className="flex gap-2">
              {VRAM_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => changeVram(o.value)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-center transition-colors border ${
                    config.vram === o.value
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <div className="text-sm font-bold">{o.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{o.sub}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              The most important setting — determines which model fits in your GPU memory.
            </p>
          </div>

          {/* Q2: Mode */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              2 · What are you generating?
            </label>
            <div className="flex gap-2">
              <ToggleBtn active={config.mode === "i2v"} onClick={() => set("mode", "i2v")}>
                Image → Video
              </ToggleBtn>
              <ToggleBtn active={config.mode === "t2v"} onClick={() => set("mode", "t2v")}>
                Text → Video
              </ToggleBtn>
            </div>
          </div>

          {/* Q3: Priority */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              3 · What matters more to you?
            </label>
            <div className="flex gap-2">
              <ToggleBtn active={config.priority === "speed"} onClick={() => set("priority", "speed")}>
                <span className="block text-sm">Fast</span>
                <span className="block text-xs text-gray-400">8 steps · ~1 min</span>
              </ToggleBtn>
              <ToggleBtn active={config.priority === "quality"} onClick={() => set("priority", "quality")}>
                <span className="block text-sm">Quality</span>
                <span className="block text-xs text-gray-400">20+ steps · ~5 min</span>
              </ToggleBtn>
            </div>
          </div>

          {/* Q4: Length + Resolution */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">
                4 · Video length
              </label>
              <div className="flex gap-2">
                {FRAME_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => set("frames", o.value)}
                    className={`flex-1 py-2 rounded text-center transition-colors ${
                      config.frames === o.value
                        ? "bg-violet-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="text-xs font-mono">{o.label}</div>
                    <div className="text-xs text-gray-500">{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">
                Resolution <span className="text-gray-500 font-normal">(filtered for your VRAM)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableRes.map((r) => (
                  <button
                    key={r}
                    onClick={() => set("resolution", r)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                      config.resolution === r
                        ? "bg-violet-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                {config.vram === "16gb" && (
                  <span className="px-3 py-1.5 text-xs text-gray-600 italic">720p+ needs 24 GB</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">Frame rate</label>
              <div className="flex gap-2">
                {FPS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => set("fps", o.value)}
                    className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                      config.fps === o.value
                        ? "bg-violet-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional features */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">Options</label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.useUpscaler}
                onChange={(e) => {
                  set("useUpscaler", e.target.checked);
                  if (e.target.checked) set("useHDR", false);
                }}
                disabled={config.useHDR}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                2× spatial upscaler <span className="text-xs text-gray-500">(doubles resolution after generation)</span>
              </span>
            </label>
            <label className={`flex items-center gap-3 group ${config.vram === "16gb" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                checked={config.useHDR}
                onChange={(e) => {
                  set("useHDR", e.target.checked);
                  if (e.target.checked) set("useUpscaler", false);
                }}
                disabled={config.vram === "16gb" || config.useUpscaler}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                HDR output{" "}
                <span className="text-xs text-gray-500">
                  {config.vram === "16gb" ? "(requires 24GB+ VRAM)" : "(requires Gemma 3 12B + HDR LoRA)"}
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ── Right: Recommendation ── */}
        <div className="space-y-4">
          {/* Model auto-selected */}
          <div className="bg-gray-800/80 rounded-xl p-4 space-y-1.5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Model for your GPU</p>
            <code className="text-xs text-emerald-300 break-all leading-relaxed block">{modelFile}</code>
            <p className="text-xs text-gray-500">
              {config.vram === "16gb"
                ? "FP8 quantized (~25 GB) — requires RTX 40xx+ for fp8 matmuls. On RTX 30xx, use GGUF Q4 instead."
                : config.vram === "24gb" && (config.priority === "quality" || config.useHDR)
                ? "Official FP8 dev model (29.1 GB) — reliable on 24 GB without extra offloading."
                : config.vram === "24gb"
                ? "FP8 distilled (~25 GB) — runs fast on 24 GB, no offloading needed."
                : config.priority === "speed"
                ? "Full BF16 distilled (46 GB) — enable sequential offloading in ComfyUI settings."
                : "Official FP8 dev model (29.1 GB) — best quality/VRAM balance on 32 GB."}
            </p>
            {config.vram === "16gb" && (
              <p className="text-xs text-amber-500">
                ⚠ RTX 30xx user? Download the <span className="font-mono">fp8_e5m2</span> variant from Kijai instead — scaled-fp8 needs Ada/Blackwell hardware.
              </p>
            )}
          </div>

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

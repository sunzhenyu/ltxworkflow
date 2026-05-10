"use client";
import { useState } from "react";
import Link from "next/link";
import {
  recommendWorkflow, deriveModelFile, deriveGemmaFile,
  resolveResolution, RESOLUTION_TIERS_BY_VRAM, DEFAULT_TIER_BY_VRAM,
  WorkflowConfig,
} from "@/lib/workflow";

type Vram = WorkflowConfig["vram"];

const VRAM_OPTIONS: { value: Vram; label: string; sub: string }[] = [
  { value: "16gb", label: "16 GB", sub: "RTX 4080 / 4070 Ti" },
  { value: "24gb", label: "24 GB", sub: "RTX 4090 / 3090" },
  { value: "32gb", label: "32 GB+", sub: "A100 / H100 / Pro" },
];

const TIER_LABELS: Record<WorkflowConfig["resolutionTier"], string> = {
  low:   "Low",
  mid:   "Mid",
  high:  "High",
  ultra: "Ultra",
};

const FRAME_OPTIONS: { value: WorkflowConfig["frames"]; label: string; sub: string }[] = [
  { value: 65,  label: "65 f",  sub: "~3 s" },
  { value: 97,  label: "97 f",  sub: "~5 s" },
  { value: 121, label: "121 f", sub: "~6 s ★" },
  { value: 161, label: "161 f", sub: "~8 s" },
];

const FPS_OPTIONS: { value: WorkflowConfig["fps"]; label: string }[] = [
  { value: 24, label: "24 fps — cinematic" },
  { value: 25, label: "25 fps — default" },
  { value: 30, label: "30 fps — smooth" },
];

const CONTROL_OPTIONS: { value: WorkflowConfig["controlMode"]; label: string; desc: string }[] = [
  { value: "none",           label: "None",             desc: "Standard T2V or I2V" },
  { value: "v2v-composition", label: "V2V Composition",  desc: "Copy pose/depth/edges from a reference video" },
  { value: "motion-track",   label: "Motion Track",     desc: "Draw motion paths on a still image" },
];

function Btn({
  active, onClick, className = "", children,
}: { active: boolean; onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors ${active
        ? "bg-violet-600 text-white"
        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
      } ${className}`}
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
    orientation: "landscape",
    resolutionTier: "low",
    frames: 121,
    fps: 24,
    controlMode: "none",
    useHDR: false,
    useUpscaler: false,
  });

  function set<K extends keyof WorkflowConfig>(k: K, v: WorkflowConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  function changeVram(vram: Vram) {
    const validTiers = RESOLUTION_TIERS_BY_VRAM[vram];
    const tierOk = validTiers.includes(config.resolutionTier);
    setConfig((c) => ({
      ...c,
      vram,
      resolutionTier: tierOk ? c.resolutionTier : DEFAULT_TIER_BY_VRAM[vram],
      useHDR: vram === "16gb" ? false : c.useHDR,
    }));
  }

  function changeControlMode(mode: WorkflowConfig["controlMode"]) {
    setConfig((c) => ({
      ...c,
      controlMode: mode,
      // control modes need dev model — force quality priority
      priority: mode !== "none" ? "quality" : c.priority,
      // disable incompatible options
      useHDR: false,
      useUpscaler: false,
    }));
  }

  const rec = recommendWorkflow(config);
  const modelFile = deriveModelFile(config);
  const gemmaFile = deriveGemmaFile(config.vram);
  const resolution = resolveResolution(config);
  const availableTiers = RESOLUTION_TIERS_BY_VRAM[config.vram];

  const isControlMode = config.controlMode !== "none";

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-xl font-bold">ComfyUI Workflow Configurator</h2>
        <p className="text-sm text-gray-400">
          Answer a few questions — we&apos;ll pick the right workflow, model files, and node settings for your GPU.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Questions ── */}
        <div className="space-y-5">

          {/* Q1: VRAM */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              1 · How much GPU VRAM?
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
            {config.vram === "16gb" && (
              <p className="text-xs text-amber-500 mt-1.5">
                ⚠ RTX 30xx? The selected FP8 model needs RTX 40xx+ hardware. Use the <span className="font-mono">mxfp8_block32</span> variant or BF16 instead.
              </p>
            )}
            {config.vram === "24gb" && (
              <p className="text-xs text-amber-500 mt-1.5">
                ⚠ RTX 3090? FP8 scaled matmul requires RTX 40xx+. Use the <span className="font-mono">mxfp8_block32</span> or BF16 variant.
              </p>
            )}
          </div>

          {/* Q2: What to generate */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              2 · What are you generating?
            </label>
            <div className="flex gap-2">
              <Btn active={config.mode === "i2v"} onClick={() => set("mode", "i2v")} className="flex-1 py-2 rounded-lg text-sm font-medium">
                Image → Video
              </Btn>
              <Btn active={config.mode === "t2v"} onClick={() => set("mode", "t2v")} className="flex-1 py-2 rounded-lg text-sm font-medium">
                Text → Video
              </Btn>
            </div>
          </div>

          {/* Q3: Speed vs Quality */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              3 · What matters more?
            </label>
            <div className="flex gap-2">
              <Btn
                active={config.priority === "speed" && !isControlMode}
                onClick={() => set("priority", "speed")}
                className={`flex-1 py-2.5 rounded-lg text-center ${isControlMode ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="text-sm font-medium">Fast</div>
                <div className="text-xs text-gray-400">8 steps · ~1 min</div>
              </Btn>
              <Btn
                active={config.priority === "quality" || isControlMode}
                onClick={() => set("priority", "quality")}
                className="flex-1 py-2.5 rounded-lg text-center"
              >
                <div className="text-sm font-medium">Quality</div>
                <div className="text-xs text-gray-400">20+ steps · ~5 min</div>
              </Btn>
            </div>
            {isControlMode && (
              <p className="text-xs text-gray-500 mt-1">Control modes use the dev model (quality path).</p>
            )}
          </div>

          {/* Q4: Control mode */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 block">
              4 · Advanced control?
            </label>
            <div className="space-y-1.5">
              {CONTROL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => changeControlMode(o.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors border ${
                    config.controlMode === o.value
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">{o.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Length + Resolution + Orientation */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">
                5 · Video length
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
                Orientation
              </label>
              <div className="flex gap-2">
                <Btn active={config.orientation === "landscape"} onClick={() => set("orientation", "landscape")} className="flex-1 py-1.5 rounded text-sm">
                  Landscape
                </Btn>
                <Btn active={config.orientation === "portrait"} onClick={() => set("orientation", "portrait")} className="flex-1 py-1.5 rounded text-sm">
                  Portrait 9:16
                </Btn>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">
                Resolution tier <span className="text-gray-500 font-normal">(filtered for your VRAM)</span>
              </label>
              <div className="flex gap-2">
                {availableTiers.map((tier) => {
                  const res = config.orientation === "landscape"
                    ? { low: "768×512", mid: "1024×576", high: "1280×704", ultra: "1920×1088" }[tier]
                    : { low: "512×768", mid: "576×1024", high: "704×1280", ultra: "1088×1920" }[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => set("resolutionTier", tier)}
                      className={`flex-1 py-2 rounded text-center transition-colors ${
                        config.resolutionTier === tier
                          ? "bg-violet-600 text-white"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      <div className="text-xs font-semibold">{TIER_LABELS[tier]}</div>
                      <div className="text-xs text-gray-500 font-mono">{res}</div>
                    </button>
                  );
                })}
                {config.vram === "16gb" && (
                  <span className="flex-1 flex items-center justify-center text-xs text-gray-600 italic">High+: 24 GB</span>
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

          {/* Options — only when no control mode */}
          {!isControlMode && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">Options</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={config.useUpscaler} onChange={(e) => {
                  set("useUpscaler", e.target.checked);
                  if (e.target.checked) set("useHDR", false);
                }} disabled={config.useHDR} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  2× spatial upscaler <span className="text-xs text-gray-500">(doubles resolution; use v1.1 file)</span>
                </span>
              </label>
              <label className={`flex items-center gap-3 group ${config.vram === "16gb" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                <input type="checkbox" checked={config.useHDR} onChange={(e) => {
                  set("useHDR", e.target.checked);
                  if (e.target.checked) set("useUpscaler", false);
                }} disabled={config.vram === "16gb" || config.useUpscaler} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  HDR output <span className="text-xs text-gray-500">
                    {config.vram === "16gb" ? "(needs 24 GB+)" : "(Gemma 3 + HDR LoRA, outputs EXR)"}
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* ── Right: Recommendation ── */}
        <div className="space-y-4">
          {/* Models */}
          <div className="bg-gray-800/80 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Models for your GPU</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Transformer · <span className="text-gray-600">{resolution}</span></p>
                <code className="text-xs text-emerald-300 break-all">{modelFile}</code>
              </div>
              <div>
                <p className="text-xs text-gray-500">Text encoder (Gemma 3 12B)</p>
                <code className="text-xs text-emerald-300 break-all">{gemmaFile}</code>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {config.vram === "16gb"
                ? "FP8 transformer (~25 GB) + FP4 Gemma (9.5 GB)"
                : config.vram === "24gb"
                ? "FP8 transformer + FP4 Gemma — fits 24 GB without offloading"
                : "FP8 distilled/dev (29 GB, fits resident) + full Gemma BF16. BF16 distilled (46 GB) also available with offloading."}
            </p>
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
              <div className="space-y-1 border-t border-gray-700 pt-2">
                {rec.warnings.map((w, i) => (
                  <p key={i} className={`text-xs flex gap-1.5 ${w.startsWith("IMPORTANT") ? "text-red-400" : "text-amber-400"}`}>
                    <span className="shrink-0">{w.startsWith("IMPORTANT") ? "!" : "⚠"}</span>{w}
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
            <p className="text-xs text-gray-400 font-medium">Node settings after loading the workflow</p>
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

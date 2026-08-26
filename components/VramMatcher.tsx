"use client";
import { useState } from "react";
import Link from "next/link";
import { MODELS, familyOf, type ModelVariant } from "@/lib/models";

const VRAM_OPTIONS = [16, 24, 32];
const REQUIRED_IDS: Record<"2.3" | "2.5", string[]> = {
  "2.3": [
    // Required VAE
    "ltx23-vae",
    // Required text encoder (Gemma 3 12B)
    "ltx23-gemma-fp4",
    "ltx23-gemma-fp8",
    "ltx23-gemma-full",
    // Optional / specialized components (audio support is the new LTX 2.3 feature)
    "ltx23-audio-vae",
    "ltx23-video-vae",
    "ltx23-text-projection",
    // IC-LoRAs (Lightricks official)
    "ltx23-ic-lora-union",
    "ltx23-ic-lora-motion-track",
    "ltx23-ic-lora-hdr",
    "ltx23-ic-lora-hdr-emb",
    "ltx23-ic-lora-lipdub",
    // Spatial / temporal upscalers
    "ltx23-spatial-upscaler",
    "ltx23-spatial-upscaler-x2-11",
    "ltx23-spatial-upscaler-x15",
    "ltx23-temporal-upscaler",
  ],
  "2.5": [
    // Required VAEs
    "ltx25-video-vae",
    "ltx25-video-vae-conv",
    "ltx25-audio-vae",
    // Required text encoder (Gemma 4 12B, projection bundled in)
    "ltx25-gemma4-bf16",
    "ltx25-gemma4-int8",
    "ltx25-gemma4-gguf-q5km",
    // Optional / specialized components
    "ltx25-distilled-lora-450",
    "ltx25-spatial-upscaler-x2",
    "ltx25-temporal-upscaler-x2",
    "ltx25-duration-head",
    "ltx25-ic-lora-pixel-upscaler-x2",
  ],
};

const DEFAULT_VISIBLE = 3;

function ModelRow({ m }: { m: ModelVariant }) {
  return (
    <div className="bg-gray-800 rounded-lg px-4 py-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{m.name}</span>
          {m.isNew && (
            <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">🔥 New</span>
          )}
          {m.badge && (
            <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full">
              {m.badge}
            </span>
          )}
        </div>
      </div>
      <code className="text-xs text-green-400 font-mono break-all">{m.filename}</code>
      {m.recommendation && (
        <p className="text-xs text-gray-400">{m.recommendation}</p>
      )}
    </div>
  );
}

function CollapsibleList({ items, label }: { items: ModelVariant[]; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, DEFAULT_VISIBLE);
  const hidden = items.length - DEFAULT_VISIBLE;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <div className="grid gap-3">
        {visible.map((m) => <ModelRow key={m.id} m={m} />)}
        {items.length === 0 && (
          <p className="text-gray-500 text-sm">No checkpoints available for this VRAM.</p>
        )}
      </div>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-xs text-gray-500 hover:text-gray-300 py-2 border border-gray-800 rounded-lg transition-colors"
        >
          {expanded ? "Show less ↑" : `Show ${hidden} more ↓`}
        </button>
      )}
    </div>
  );
}

const FAMILIES: ("2.5" | "2.3")[] = ["2.5", "2.3"];

export default function VramMatcher() {
  const [family, setFamily] = useState<"2.3" | "2.5">("2.5");
  const [selected, setSelected] = useState<number>(16);

  const familyModels = MODELS.filter((m) => familyOf(m) === family);
  const requiredIds = REQUIRED_IDS[family];
  const checkpoints = familyModels.filter(
    (m) => !requiredIds.includes(m.id) && m.vram === selected && (m.vramMax === undefined || selected <= m.vramMax)
  );
  const required = familyModels.filter((m) => requiredIds.includes(m.id));

  // LTX 2.5's official files alone need ~34GB+ combined (transformer +
  // Gemma 4 text encoder), so a 16GB filter over official-only files is
  // honestly empty. Point at the GGUF path instead of showing nothing.
  const needsGgufGuidance = family === "2.5" && selected === 16 && checkpoints.length === 0;

  return (
    <section id="vram" className="bg-gray-900 rounded-xl p-6 space-y-5 scroll-mt-24">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">VRAM Adapter</h2>
          <p className="text-gray-400 text-sm">
            Select a model family and your GPU VRAM to see recommended LTX models:
          </p>
        </div>
        <Link
          href="/models"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </Link>
      </div>

      <div className="flex gap-2">
        {FAMILIES.map((f) => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              family === f
                ? "bg-amber-500 text-gray-950"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            LTX {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {VRAM_OPTIONS.map((v) => (
          <button
            key={v}
            onClick={() => setSelected(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === v
                ? "bg-violet-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {v}GB
          </button>
        ))}
      </div>

      {needsGgufGuidance ? (
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-amber-200">
            No official LTX 2.5 checkpoint fits 16GB.
          </p>
          <p className="text-xs text-gray-400">
            The smallest official transformer (21.5GB, int8-convrot) plus the smallest official
            Gemma 4 text encoder (15.37GB) already add up to well over 24GB. On 16GB, use the
            community GGUF transformer together with the community GGUF Gemma 4 encoder instead.
          </p>
          <Link
            href="/guide/ltx-2-5-vram-requirements"
            className="inline-block text-xs text-amber-300 hover:text-amber-200 underline"
          >
            See the LTX 2.5 VRAM guide for GGUF quant options →
          </Link>
        </div>
      ) : (
        <CollapsibleList items={checkpoints} label={`Checkpoints for ${selected}GB`} />
      )}
      <CollapsibleList items={required} label="Required & optional components" />
    </section>
  );
}

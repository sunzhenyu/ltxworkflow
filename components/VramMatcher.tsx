"use client";
import { useState } from "react";
import Link from "next/link";
import { MODELS } from "@/lib/models";

const VRAM_OPTIONS = [16, 24, 32];
const REQUIRED_IDS = [
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
];

const DEFAULT_VISIBLE = 3;

function ModelRow({ m }: { m: typeof MODELS[0] }) {
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

function CollapsibleList({ items, label }: { items: typeof MODELS; label: string }) {
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

export default function VramMatcher() {
  const [selected, setSelected] = useState<number>(16);
  const checkpoints = MODELS.filter(
    (m) => !REQUIRED_IDS.includes(m.id) && m.vram === selected && (m.vramMax === undefined || selected <= m.vramMax)
  );
  const required = MODELS.filter((m) => REQUIRED_IDS.includes(m.id));

  return (
    <section className="bg-gray-900 rounded-xl p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">VRAM Adapter</h2>
          <p className="text-gray-400 text-sm">
            Select your GPU VRAM to see recommended LTX 2.3 models:
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

      <CollapsibleList items={checkpoints} label={`Checkpoints for ${selected}GB`} />
      <CollapsibleList items={required} label="Required & optional components" />
    </section>
  );
}

"use client";
import { useState } from "react";
import { MODELS, getModelsForVram } from "@/lib/models";

const VRAM_OPTIONS = [16, 24, 32];
const REQUIRED_IDS = ["ltx23-vae", "ltx23-spatial-upscaler"];

function ModelRow({ m }: { m: ReturnType<typeof getModelsForVram>[0] }) {
  return (
    <div className="bg-gray-800 rounded-lg px-4 py-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{m.name}</span>
          {m.badge && (
            <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full">
              {m.badge}
            </span>
          )}
        </div>
        <a
          href={m.hfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-400 hover:text-violet-300 shrink-0 ml-4"
        >
          Download →
        </a>
      </div>
      <code className="text-xs text-green-400 font-mono break-all">{m.filename}</code>
      {m.recommendation && (
        <p className="text-xs text-gray-400">{m.recommendation}</p>
      )}
    </div>
  );
}

export default function VramMatcher() {
  const [selected, setSelected] = useState<number>(16);
  const all = getModelsForVram(selected);
  const checkpoints = all.filter((m) => !REQUIRED_IDS.includes(m.id));
  const required = MODELS.filter((m) => REQUIRED_IDS.includes(m.id));

  return (
    <section className="bg-gray-900 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">VRAM Adapter</h2>
        <p className="text-gray-400 text-sm">
          Select your GPU VRAM to see recommended LTX 2.3 models and download links:
        </p>
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

      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Checkpoints for {selected}GB</p>
        <div className="grid gap-3">
          {checkpoints.map((m) => <ModelRow key={m.id} m={m} />)}
          {checkpoints.length === 0 && (
            <p className="text-gray-500 text-sm">No checkpoints available for this VRAM.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Required for all setups</p>
        <div className="grid gap-3">
          {required.map((m) => <ModelRow key={m.id} m={m} />)}
        </div>
      </div>
    </section>
  );
}

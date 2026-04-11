"use client";
import { useState } from "react";
import { MODELS, getModelsForVram } from "@/lib/models";

const VRAM_OPTIONS = [16, 24, 32];

export default function VramMatcher() {
  const [selected, setSelected] = useState<number>(16);
  const compatible = getModelsForVram(selected);

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-1">VRAM Adapter</h2>
      <p className="text-gray-400 text-sm mb-4">
        Select your GPU VRAM to see compatible LTX 2.3 models:
      </p>
      <div className="flex gap-2 flex-wrap mb-6">
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
      <div className="grid gap-3">
        {compatible.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <div>
              <span className="font-medium text-sm">{m.name}</span>
              <span className="ml-2 text-xs text-gray-400 font-mono">{m.filename}</span>
              {m.badge && (
                <span className="ml-2 text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full">
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
              HuggingFace →
            </a>
          </div>
        ))}
        {compatible.length === 0 && (
          <p className="text-gray-500 text-sm">No models available for this VRAM.</p>
        )}
      </div>
    </section>
  );
}

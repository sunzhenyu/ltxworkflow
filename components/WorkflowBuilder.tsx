"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { generateWorkflowJSON, WorkflowParams } from "@/lib/workflow";
import { MODELS } from "@/lib/models";

const RESOLUTIONS: WorkflowParams["resolution"][] = ["512x512", "768x512", "1024x576", "1280x720"];
const FRAMES: WorkflowParams["frames"][] = [25, 49, 97];
const FPS_OPTIONS: WorkflowParams["fps"][] = [8, 16, 24];

export default function WorkflowBuilder() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const [params, setParams] = useState<WorkflowParams>({
    resolution: "768x512",
    frames: 49,
    fps: 16,
    steps: 20,
    cfg: 3.5,
    seed: 42,
    scheduler: "euler",
    prompt: "A cinematic shot of a mountain landscape at golden hour",
    negativePrompt: "blurry, low quality, distorted",
    modelFile: "ltx-2.3-22b-dev.safetensors",
  });

  const json = generateWorkflowJSON(params);
  const jsonStr = JSON.stringify(json, null, 2);

  function set<K extends keyof WorkflowParams>(k: K, v: WorkflowParams[K]) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  function handleDownload() {
    if (!isSignedIn) return;
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ltx23_workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">ComfyUI Workflow JSON Generator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Model</label>
            <select
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={params.modelFile}
              onChange={(e) => set("modelFile", e.target.value)}
            >
              {MODELS.filter((m) => m.type !== "lora").map((m) => (
                <option key={m.id} value={m.filename}>{m.name}</option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Prompt</label>
            <textarea
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
              value={params.prompt}
              onChange={(e) => set("prompt", e.target.value)}
            />
          </div>
          {isSignedIn ? (
            <button onClick={handleDownload}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              Download JSON
            </button>
          ) : (
            <Link href="/sign-in">
              <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                Sign in to Download JSON
              </button>
            </Link>
          )}
        </div>
        {/* Right: JSON Preview */}
        <div className="bg-gray-950 rounded-lg p-4 overflow-auto max-h-80 relative">
          {!isSignedIn && (
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <Link href="/sign-in">
                <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Sign in to see full JSON
                </button>
              </Link>
            </div>
          )}
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {jsonStr.slice(0, isSignedIn ? undefined : 300)}
            {!isSignedIn && "\n..."}
          </pre>
        </div>
      </div>
    </section>
  );
}

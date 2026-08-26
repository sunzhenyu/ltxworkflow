import Link from "next/link";

export default function ModelCards() {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-3">
          <div>
            <p className="text-base font-bold text-gray-100">LTX 2.5 & LTX 2.3 Model Downloads</p>
            <p className="text-xs text-gray-400 mt-1">
              LTX 2.3 FP8 (16GB) and official distilled & dev (24–32GB), plus LTX 2.5&apos;s gated
              Gemma 4 + INT8 convrot files (24GB+) or the community GGUF path for 16GB.
            </p>
          </div>
          <div className="flex gap-2 mt-auto">
            <Link href="/models" className="flex-1 text-center text-sm bg-violet-700 hover:bg-violet-600 text-white py-2.5 rounded-lg transition-colors font-medium">
              Download Models →
            </Link>
            <Link href="/models#guide" className="flex-1 text-center text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-lg transition-colors font-medium">
              How to Choose →
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-3">
          <div>
            <p className="text-base font-bold text-gray-100">LTX 2.3 ComfyUI Workflow JSON</p>
            <p className="text-xs text-gray-400 mt-1">
              Official workflow JSON files from Lightricks — T2V, I2V, two-stage upscaler,
              ICLoRA motion tracking. Drag into ComfyUI to load.
            </p>
          </div>
          <div className="flex gap-2 mt-auto">
            <Link href="/workflows" className="flex-1 text-center text-sm bg-violet-700 hover:bg-violet-600 text-white py-2.5 rounded-lg transition-colors font-medium">
              Download Workflows →
            </Link>
            <Link href="/workflows#guide" className="flex-1 text-center text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-lg transition-colors font-medium">
              How to Choose →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

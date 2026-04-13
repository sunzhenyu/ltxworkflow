import Link from "next/link";

export default function ModelCards() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">LTX 2.3 Model Downloads</h2>
        <Link href="/models" className="text-sm text-violet-400 hover:text-violet-300">
          View all models →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 space-y-2">
          <div className="text-violet-400 text-lg font-bold">16GB VRAM</div>
          <p className="text-sm text-gray-300 font-medium">FP8 Quantized (Kijai)</p>
          <p className="text-xs text-gray-400">
            Use <strong className="text-gray-200">Distilled FP8 v3</strong> for fastest generation (8 steps).
            Use <strong className="text-gray-200">Dev FP8</strong> if you want to apply LoRA weights.
            Requires RTX 40xx+ GPU.
          </p>
          <Link href="/models#16gb" className="block mt-3 text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors font-medium">
            Download 16GB Models →
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-2">
          <div className="text-violet-400 text-lg font-bold">24GB VRAM</div>
          <p className="text-sm text-gray-300 font-medium">Official + Offloading</p>
          <p className="text-xs text-gray-400">
            Run the official <strong className="text-gray-200">Distilled</strong> checkpoint with sequential offloading enabled in ComfyUI.
            Full quality, slower than 32GB.
          </p>
          <Link href="/models#24gb" className="block mt-3 text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors font-medium">
            Download 24GB Models →
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-2">
          <div className="text-violet-400 text-lg font-bold">32GB VRAM</div>
          <p className="text-sm text-gray-300 font-medium">Official Full Precision</p>
          <p className="text-xs text-gray-400">
            Official <strong className="text-gray-200">Distilled</strong> (recommended, 8 steps) or
            <strong className="text-gray-200"> Dev</strong> (for LoRA training).
            Full bf16 quality from Lightricks.
          </p>
          <Link href="/models#32gb" className="block mt-3 text-center text-xs bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition-colors font-medium">
            Download 32GB Models →
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-medium text-gray-200">Not sure which model to pick?</span>
          <span className="text-xs text-gray-400 ml-2">See the full comparison with official recommendations.</span>
        </div>
        <Link href="/models" className="shrink-0 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors font-medium">
          Model Guide →
        </Link>
      </div>
    </section>
  );
}

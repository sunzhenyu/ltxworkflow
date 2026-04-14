import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 pt-8 pb-4 text-sm text-gray-500 space-y-4">
      <p>
        Download <strong className="text-gray-400">LTX 2.3</strong> models for ComfyUI —{" "}
        <strong className="text-gray-400">taeltx2_3.safetensors</strong> (VAE, required),{" "}
        <strong className="text-gray-400">ltx-2.3-22b-distilled_transformer_only_fp8_input_scaled_v3.safetensors</strong> (16GB FP8),
        and official full-precision checkpoints (32GB). Generate ComfyUI workflow JSON for LTX 2.3 text-to-video and image-to-video.
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <Link href="/feedback" className="hover:text-gray-400 transition-colors">Feedback</Link>
        <Link href="/changelog" className="hover:text-gray-400 transition-colors">Changelog</Link>
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
      </div>

      <p className="text-xs text-gray-600">ltx workflow — Not affiliated with Lightricks.</p>
    </footer>
  );
}

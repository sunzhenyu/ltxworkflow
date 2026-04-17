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

      {/* Featured Badges Marquee */}
      <div className="relative overflow-hidden py-4">
        <div className="flex gap-6 animate-marquee">
          <a href="https://www.producthunt.com/products/ltx-workflow" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=ltx-workflow&theme=dark" alt="Featured on Product Hunt" className="h-[54px] w-auto block" />
          </a>
          <a href="https://dev.to" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://d2fltix0v2e0sb.cloudfront.net/dev-badge.svg" alt="Listed on DEV.to" className="h-[54px] w-auto block" />
          </a>
          <a href="https://toolfame.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://toolfame.com/badge-light.svg" alt="Featured on ToolFame" className="h-[54px] w-auto block" />
          </a>
          <a href="https://showmebest.ai" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://showmebest.ai/badge/feature-badge-white.webp" alt="Featured on ShowMeBestAI" className="h-[54px] w-auto block" />
          </a>
          <a href="https://turbo0.com/item/ltx-workflow" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" className="h-[54px] w-auto block" />
          </a>
          <a href="https://startupfa.me" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://startupfa.me/badges/featured/default.webp" alt="Featured on Startup Fame" className="h-[54px] w-auto block" />
          </a>
          <a href="https://fazier.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light" alt="Featured on Fazier" className="h-[54px] w-auto block" />
          </a>
          <a href="https://futuretools.io/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://futuretools.io/_next/image?url=%2Flogo%402x.png&w=64&q=75&dpl=dpl_4cALsf7ySXmctGdvC7T5DdTzupW6" alt="Listed on Future Tools" className="h-[54px] w-auto block" />
          </a>
          {/* Duplicate for seamless loop */}
          <a href="https://www.producthunt.com/products/ltx-workflow" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=ltx-workflow&theme=dark" alt="Featured on Product Hunt" className="h-[54px] w-auto block" />
          </a>
          <a href="https://dev.to" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://d2fltix0v2e0sb.cloudfront.net/dev-badge.svg" alt="Listed on DEV.to" className="h-[54px] w-auto block" />
          </a>
          <a href="https://toolfame.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://toolfame.com/badge-light.svg" alt="Featured on ToolFame" className="h-[54px] w-auto block" />
          </a>
          <a href="https://showmebest.ai" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://showmebest.ai/badge/feature-badge-white.webp" alt="Featured on ShowMeBestAI" className="h-[54px] w-auto block" />
          </a>
          <a href="https://turbo0.com/item/ltx-workflow" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" className="h-[54px] w-auto block" />
          </a>
          <a href="https://startupfa.me" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://startupfa.me/badges/featured/default.webp" alt="Featured on Startup Fame" className="h-[54px] w-auto block" />
          </a>
          <a href="https://fazier.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light" alt="Featured on Fazier" className="h-[54px] w-auto block" />
          </a>
          <a href="https://futuretools.io/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://futuretools.io/_next/image?url=%2Flogo%402x.png&w=64&q=75&dpl=dpl_4cALsf7ySXmctGdvC7T5DdTzupW6" alt="Listed on Future Tools" className="h-[54px] w-auto block" />
          </a>
        </div>
      </div>

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

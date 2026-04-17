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
          <a href="https://github.com/AlonzoLeeeooo/awesome-video-generation" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Awesome-Video_Generation-blue?style=for-the-badge&logo=github" alt="Featured on Awesome Video Generation" className="h-[54px] w-auto" />
          </a>
          <a href="https://github.com/showlab/Awesome-Video-Diffusion" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Awesome-Video_Diffusion-purple?style=for-the-badge&logo=github" alt="Featured on Awesome Video Diffusion" className="h-[54px] w-auto" />
          </a>
          <a href="https://theresanaiforthat.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/There's_An_AI-For_That-orange?style=for-the-badge" alt="Listed on There's An AI For That" className="h-[54px] w-auto" />
          </a>
          <a href="https://www.futuretools.io" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Future-Tools-green?style=for-the-badge" alt="Listed on Future Tools" className="h-[54px] w-auto" />
          </a>
          <a href="https://topai.tools" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Top-AI_Tools-red?style=for-the-badge" alt="Listed on TopAI.tools" className="h-[54px] w-auto" />
          </a>
          <a href="https://www.uneed.best" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Uneed-Best-yellow?style=for-the-badge" alt="Featured on Uneed" className="h-[54px] w-auto" />
          </a>
          {/* Duplicate for seamless loop */}
          <a href="https://github.com/AlonzoLeeeooo/awesome-video-generation" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Awesome-Video_Generation-blue?style=for-the-badge&logo=github" alt="Featured on Awesome Video Generation" className="h-[54px] w-auto" />
          </a>
          <a href="https://github.com/showlab/Awesome-Video-Diffusion" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Awesome-Video_Diffusion-purple?style=for-the-badge&logo=github" alt="Featured on Awesome Video Diffusion" className="h-[54px] w-auto" />
          </a>
          <a href="https://theresanaiforthat.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/There's_An_AI-For_That-orange?style=for-the-badge" alt="Listed on There's An AI For That" className="h-[54px] w-auto" />
          </a>
          <a href="https://www.futuretools.io" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Future-Tools-green?style=for-the-badge" alt="Listed on Future Tools" className="h-[54px] w-auto" />
          </a>
          <a href="https://topai.tools" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Top-AI_Tools-red?style=for-the-badge" alt="Listed on TopAI.tools" className="h-[54px] w-auto" />
          </a>
          <a href="https://www.uneed.best" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img src="https://img.shields.io/badge/Uneed-Best-yellow?style=for-the-badge" alt="Featured on Uneed" className="h-[54px] w-auto" />
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

export type ModelVariant = {
  id: string;
  name: string;
  filename: string;
  size: string;
  vram: number;
  vramMax?: number; // upper bound — model won't show above this VRAM tier
  type: "full" | "distilled" | "fp8" | "lora";
  hfUrl: string;
  description: string;
  badge?: string;
  recommendation?: string; // official usage guidance
};

// Source: https://github.com/Lightricks/ComfyUI-LTXVideo
// Official checkpoints go to: COMFYUI_ROOT/models/checkpoints/
export const MODELS: ModelVariant[] = [
  {
    id: "ltx23-dev",
    name: "LTX 2.3 Dev",
    filename: "ltx-2.3-22b-dev.safetensors",
    size: "~42 GB",
    vram: 32,
    type: "full",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Full dev model. Flexible and trainable. Recommended 32GB+ VRAM.",
    badge: "Official",
    recommendation: "Best for LoRA training and fine-tuning. Supports CFG guidance.",
  },
  {
    id: "ltx23-distilled",
    name: "LTX 2.3 Distilled",
    filename: "ltx-2.3-22b-distilled.safetensors",
    size: "~42 GB",
    vram: 32,
    type: "distilled",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Distilled version. 8 steps, CFG=1. Faster inference, same quality.",
    badge: "Recommended",
    recommendation: "Official recommendation for 32GB VRAM. 8 steps, fastest full-precision inference.",
  },
  {
    id: "ltx23-distilled-fp8",
    name: "LTX 2.3 Distilled FP8 v3 (Kijai)",
    filename: "ltx-2.3-22b-distilled_transformer_only_fp8_input_scaled_v3.safetensors",
    size: "25 GB",
    vram: 16,
    vramMax: 24,
    type: "fp8",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy",
    description: "FP8 distilled v3 by Kijai. Best for 16GB VRAM. 8 steps, CFG=1.",
    badge: "16GB Best",
    recommendation: "Best choice for 16GB VRAM. Distilled = 8 steps, fastest generation. Requires RTX 40xx+ for fp8 matmuls.",
  },
  {
    id: "ltx23-dev-fp8",
    name: "LTX 2.3 Dev FP8 (Kijai)",
    filename: "ltx-2.3-22b-dev_transformer_only_fp8_input_scaled.safetensors",
    size: "25 GB",
    vram: 16,
    vramMax: 24,
    type: "fp8",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy",
    description: "FP8 quantized dev model by Kijai. Runs on 16GB VRAM. Supports LoRA. Place in models/checkpoints/.",
    badge: "16GB LoRA",
    recommendation: "Use this (not distilled) if you want to apply LoRA weights on 16GB VRAM.",
  },
  {
    id: "ltx23-distilled-fp8-24gb",
    name: "LTX 2.3 Distilled (bf16, 24GB)",
    filename: "ltx-2.3-22b-distilled.safetensors",
    size: "~42 GB",
    vram: 24,
    vramMax: 31,
    type: "distilled",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Official distilled model runnable on 24GB with sequential offloading enabled in ComfyUI.",
    badge: "24GB",
    recommendation: "Enable sequential offloading in ComfyUI settings. Slower than 32GB but uses official weights at full quality.",
  },
  {
    id: "ltx23-spatial-upscaler",
    name: "Spatial Upscaler x2",
    filename: "ltx-2.3-spatial-upscaler-x2-1.0.safetensors",
    size: "~1 GB",
    vram: 4,
    type: "lora",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Spatial upscaler x2 for two-stage pipelines. Place in models/latent_upscale_models/.",
    recommendation: "Optional. Use in a two-stage pipeline to upscale output resolution after generation.",
  },
  {
    id: "ltx23-vae",
    name: "LTX 2.3 VAE",
    filename: "taeltx2_3.safetensors",
    size: "~0.5 GB",
    vram: 2,
    type: "lora",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy/blob/main/vae/taeltx2_3.safetensors",
    description: "VAE by Kijai. Required for all ComfyUI workflows. Place in models/vae/.",
    badge: "Required",
    recommendation: "Required for all setups. Download this first regardless of your VRAM.",
  },
];

export function getModelsForVram(vram: number): ModelVariant[] {
  return MODELS.filter((m) => m.vram <= vram && (m.vramMax === undefined || vram <= m.vramMax));
}

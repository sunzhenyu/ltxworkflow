export type ModelVariant = {
  id: string;
  name: string;
  filename: string;
  size: string;
  vram: number;
  type: "full" | "distilled" | "fp8" | "lora";
  hfUrl: string;
  description: string;
  badge?: string;
};

// Source: https://github.com/Lightricks/ComfyUI-LTXVideo
// Official checkpoints go to: COMFYUI_ROOT/models/checkpoints/
export const MODELS: ModelVariant[] = [
  {
    id: "ltx23-dev",
    name: "LTX-2.3 Dev",
    filename: "ltx-2.3-22b-dev.safetensors",
    size: "~42 GB",
    vram: 32,
    type: "full",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Full dev model. Flexible and trainable. Recommended 32GB+ VRAM.",
    badge: "Official",
  },
  {
    id: "ltx23-distilled",
    name: "LTX-2.3 Distilled",
    filename: "ltx-2.3-22b-distilled.safetensors",
    size: "~42 GB",
    vram: 32,
    type: "distilled",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "Distilled version. 8 steps, CFG=1. Faster inference, same quality.",
    badge: "Recommended",
  },
  {
    id: "ltx23-dev-fp8",
    name: "LTX-2.3 Dev (FP8, Kijai)",
    filename: "ltx-2.3-22b-dev_transformer_only_fp8_input_scaled.safetensors",
    size: "25 GB",
    vram: 16,
    type: "fp8",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy",
    description: "FP8 quantized by Kijai. Runs on 16GB VRAM. Requires 40xx+ GPU for fp8 matmuls. Place in models/checkpoints/.",
    badge: "16GB VRAM",
  },
  {
    id: "ltx23-distilled-fp8",
    name: "LTX-2.3 Distilled (FP8 v3, Kijai)",
    filename: "ltx-2.3-22b-distilled_transformer_only_fp8_input_scaled_v3.safetensors",
    size: "25 GB",
    vram: 16,
    type: "fp8",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy",
    description: "FP8 distilled v3 by Kijai. Best for 16GB VRAM. 8 steps, CFG=1.",
    badge: "16GB VRAM",
  },
  {
    id: "ltx23-spatial-upscaler",
    name: "Spatial Upscaler x2",
    filename: "ltx-2.3-spatial-upscaler-x2-1.0.safetensors",
    size: "~1 GB",
    vram: 4,
    type: "lora",
    hfUrl: "https://huggingface.co/Lightricks/LTX-2.3",
    description: "spatial upscaler x2 for two-stage pipelines. Place in models/latent_upscale_models/.",
  },
  {
    id: "ltx23-vae",
    name: "LTX-2.3 VAE",
    filename: "taeltx2_3.safetensors",
    size: "~0.5 GB",
    vram: 2,
    type: "lora",
    hfUrl: "https://huggingface.co/Kijai/LTX2.3_comfy/blob/main/vae/taeltx2_3.safetensors",
    description: "VAE by Kijai. Required for ComfyUI workflows. Place in models/vae/.",
    badge: "Required",
  },
];

export function getModelsForVram(vram: number): ModelVariant[] {
  return MODELS.filter((m) => m.vram <= vram);
}

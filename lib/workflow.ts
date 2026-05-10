export type WorkflowConfig = {
  vram: "16gb" | "24gb" | "32gb";
  mode: "t2v" | "i2v";
  priority: "speed" | "quality";
  resolution: "768x512" | "1024x576" | "1280x704" | "1920x1088";
  frames: 65 | 97 | 121 | 161;
  fps: 24 | 25 | 30;
  useHDR: boolean;
  useUpscaler: boolean;
};

export type WorkflowRecommendation = {
  workflowName: string;
  workflowFile: string;
  reason: string;
  nodeInstructions: NodeInstruction[];
  requiredFiles: string[];
  warnings: string[];
};

export type NodeInstruction = {
  nodeName: string;
  field: string;
  value: string;
  note?: string;
};

export function deriveModelFile(config: WorkflowConfig): string {
  // HDR uses the dev base + distilled LoRA — same routing as quality
  if (config.vram === "16gb") {
    return config.priority === "quality" || config.useHDR
      ? "ltx-2.3-22b-dev_transformer_only_fp8_scaled.safetensors"
      : "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors";
  }
  if (config.vram === "24gb") {
    return config.priority === "quality" || config.useHDR
      ? "ltx-2.3-22b-dev-fp8.safetensors"          // official fp8 dev, 29.1 GB — fits 24 GB
      : "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors";
  }
  // 32gb: bf16 distilled fits with sequential offload; quality → fp8 dev is more reliable than bf16 dev (42GB)
  return config.priority === "quality" || config.useHDR
    ? "ltx-2.3-22b-dev-fp8.safetensors"
    : "ltx-2.3-22b-distilled-1.1.safetensors";
}

// Returns the correct Gemma 3 12B text encoder filename based on available VRAM.
// Full bf16 (~24 GB) OOMs on 16/24 GB cards alongside the transformer.
export function deriveGemmaFile(vram: WorkflowConfig["vram"]): string {
  if (vram === "16gb") return "gemma_3_12B_it_fp4_mixed.safetensors";  // 9.5 GB — only option that fits
  if (vram === "24gb") return "gemma_3_12B_it_fp4_mixed.safetensors";  // fp8_scaled also works but fp4 safer
  return "comfy_gemma_3_12B_it.safetensors";                           // full bf16 on 32 GB+
}

export function recommendWorkflow(config: WorkflowConfig): WorkflowRecommendation {
  const modelFile = deriveModelFile(config);
  const gemmaFile = deriveGemmaFile(config.vram);
  const isDistilled = modelFile.includes("distilled");
  const steps = isDistilled ? 8 : 20;
  const cfg = isDistilled ? 1 : 3.5;
  const sampler = "euler";
  const warnings: string[] = [];

  // HDR path
  if (config.useHDR) {
    return {
      workflowName: "ICLoRA HDR Distilled",
      workflowFile: "LTX-2.3_ICLoRA_HDR_Distilled.json",
      reason: "HDR generation requires the ICLoRA HDR LoRA with the dev model base. Enhanced highlights, shadows, and dynamic range.",
      requiredFiles: [
        "ltx-2.3-22b-dev-fp8.safetensors",
        gemmaFile,
        "LTX23_audio_vae_bf16.safetensors",
        "ltx-2.3-22b-ic-lora-hdr-0.9.safetensors",
        "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: "ltx-2.3-22b-dev-fp8.safetensors" },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        { nodeName: "LTXVAudioVAELoader", field: "model_name", value: "LTX23_audio_vae_bf16.safetensors" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Divisible by 32" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
        { nodeName: "LTXVScheduler", field: "steps", value: "20", note: "Dev model: 20 steps, CFG ~3.5" },
      ],
      warnings: [
        config.vram === "16gb"
          ? "HDR workflow requires 24 GB+ VRAM — the dev fp8 model (29 GB) exceeds 16 GB"
          : `Gemma 3 text encoder: using ${gemmaFile} for your VRAM tier`,
        "Input must be a video file — use LoadVideo node",
      ].filter(Boolean) as string[],
    };
  }

  // Two-stage upscaler path (pin to v1.1 — v1.0 has confirmed endscreen artifact bug)
  if (config.useUpscaler) {
    if (!isDistilled) warnings.push("Upscaler works best with distilled models (8 steps)");
    warnings.push("Use spatial upscaler v1.1 — v1.0 produces text/logo artifacts in the last frames. File: ltx-2.3-spatial-upscaler-x2-1.1.safetensors");
    return {
      workflowName: "T2V / I2V Two Stage Distilled",
      workflowFile: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
      reason: "Two-stage pipeline: generate at lower resolution, then upscale 2× in latent space. Best quality-to-time ratio for high-res output.",
      requiredFiles: [
        modelFile,
        "taeltx2_3.safetensors",
        "LTX23_audio_vae_bf16.safetensors",
        gemmaFile,
        "ltx-2.3-spatial-upscaler-x2-1.1.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
        { nodeName: "LTXVAudioVAELoader", field: "model_name", value: "LTX23_audio_vae_bf16.safetensors" },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        { nodeName: "LatentUpscaleModelLoader", field: "model_name", value: "ltx-2.3-spatial-upscaler-x2-1.1.safetensors" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Set to HALF your target resolution — upscaler doubles it" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
        { nodeName: "CFGGuider", field: "cfg", value: String(cfg), note: isDistilled ? "Distilled: keep at 1.0. Raising CFG doubles VRAM with no quality gain." : "Dev: 3.0–5.0" },
        { nodeName: "LTXVScheduler", field: "steps", value: String(steps), note: `Sampler: ${sampler}` },
      ],
      warnings,
    };
  }

  // Default: Single Stage (T2V + I2V)
  // i2v is the same workflow — image feeds into LTXVImgToVideoConditioning node.
  // Audio is generated jointly in the same diffusion pass (single-stage workflow).
  const versionedLoRA = isDistilled
    ? "ltx-2.3-22b-distilled-lora-384-1.1.safetensors"
    : "ltx-2.3-22b-distilled-lora-384-1.1.safetensors";

  if (!isDistilled) {
    warnings.push("Dev model: use 20+ steps, CFG ~3.5, sampler=euler. Much slower than distilled.");
  }

  return {
    workflowName: "T2V / I2V Single Stage Distilled",
    workflowFile: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
    reason: config.mode === "i2v"
      ? "Standard I2V workflow — attach your image to the LTXVImgToVideoConditioning node. Generates video + audio in a single diffusion pass."
      : "Standard T2V workflow. Generates video + synchronized audio in one pass.",
    requiredFiles: [
      modelFile,
      "taeltx2_3.safetensors",
      "LTX23_audio_vae_bf16.safetensors",
      gemmaFile,
      versionedLoRA,
    ],
    nodeInstructions: [
      { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
      { nodeName: "LTXVAudioVAELoader", field: "model_name", value: "LTX23_audio_vae_bf16.safetensors" },
      { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
      ...(config.mode === "i2v" ? [
        { nodeName: "LoadImage", field: "image", value: "your-image.png", note: "Drag your source image here" },
      ] : []),
      { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Both must be divisible by 32" },
      { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1 (65, 97, 121…)" },
      { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
      { nodeName: "CFGGuider", field: "cfg", value: String(cfg), note: isDistilled ? "Keep at 1.0 — raising CFG doubles VRAM with no quality benefit" : "Dev model: 3.0–5.0" },
      { nodeName: "LTXVScheduler", field: "steps", value: String(steps), note: `Sampler: ${sampler}` },
    ],
    warnings,
  };
}

// ── Legacy types kept for dashboard components ────────────────────────────────
export type WorkflowParams = {
  resolution: "512x512" | "768x512" | "1024x576" | "1280x720";
  frames: 25 | 49 | 97;
  fps: 8 | 16 | 24;
  steps: number;
  cfg: number;
  seed: number;
  scheduler: "euler" | "dpm" | "lcm";
  prompt: string;
  negativePrompt: string;
  modelFile: string;
};

export function generateWorkflowJSON(params: WorkflowParams): object {
  const [width, height] = params.resolution.split("x").map(Number);
  const isDistilled = params.modelFile.includes("distilled");
  const steps = isDistilled ? Math.min(params.steps, 8) : params.steps;
  const cfg = isDistilled ? 1 : params.cfg;
  return {
    "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: params.modelFile } },
    "2": { class_type: "CLIPTextEncode", inputs: { text: params.prompt, clip: ["1", 1] } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: params.negativePrompt, clip: ["1", 1] } },
    "4": { class_type: "EmptyLTXVLatentVideo", inputs: { width, height, length: params.frames, batch_size: 1 } },
    "5": { class_type: "LTXVConditioning", inputs: { positive: ["2", 0], negative: ["3", 0], vae: ["1", 2], latent: ["4", 0], frame_rate: params.fps } },
    "6": { class_type: "LTXVScheduler", inputs: { steps, max_shift: 2.05, base_shift: 0.95, stretch: true, terminal: 0.1, latent: ["4", 0] } },
    "7": { class_type: "SamplerCustomAdvanced", inputs: { noise: { class_type: "RandomNoise", inputs: { noise_seed: params.seed } }, guider: { class_type: "CFGGuider", inputs: { model: ["1", 0], positive: ["5", 0], negative: ["5", 1], cfg } }, sampler: { class_type: "KSamplerSelect", inputs: { sampler_name: params.scheduler } }, sigmas: ["6", 0], latent_image: ["4", 0] } },
    "8": { class_type: "VAEDecodeTiled", inputs: { samples: ["7", 0], vae: ["1", 2], tile_size: 512, overlap: 64 } },
    "9": { class_type: "SaveVideo", inputs: { images: ["8", 0], frame_rate: params.fps, filename_prefix: "ltx23_output" } },
  };
}

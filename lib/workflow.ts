export type WorkflowConfig = {
  vram: "16gb" | "24gb" | "32gb";
  mode: "t2v" | "i2v";
  priority: "speed" | "quality";
  resolution: "768x512" | "1024x576" | "1280x720" | "1920x1080";
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

export function recommendWorkflow(config: WorkflowConfig): WorkflowRecommendation {
  const modelFile = deriveModelFile(config);
  const isDistilled = modelFile.includes("distilled");
  const isDev = modelFile.includes("dev");
  const steps = isDistilled ? 8 : 20;
  const cfg = isDistilled ? 1 : 3.5;
  const warnings: string[] = [];

  // HDR path
  if (config.useHDR) {
    return {
      workflowName: "ICLoRA HDR Distilled",
      workflowFile: "LTX-2.3_ICLoRA_HDR_Distilled.json",
      reason: "HDR generation requires the ICLoRA HDR LoRA. This is the only official workflow with HDR support.",
      requiredFiles: [
        "ltx-2.3-22b-dev.safetensors",
        "comfy_gemma_3_12B_it.safetensors",
        "ltx-2.3-22b-ic-lora-hdr-0.9.safetensors",
        "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: "ltx-2.3-22b-dev.safetensors" },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: "comfy_gemma_3_12B_it.safetensors" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Must be divisible by 32" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1 (25, 49, 97…)" },
        { nodeName: "CreateVideo", field: "frame_rate", value: String(config.fps) },
      ],
      warnings: [
        "HDR requires comfy_gemma_3_12B_it.safetensors (12B model, ~24GB download)",
        "Input must be a video file — use LoadVideo node",
      ],
    };
  }

  // Two-stage upscaler path
  if (config.useUpscaler) {
    if (!isDistilled) warnings.push("Upscaler works best with distilled models (8 steps)");
    return {
      workflowName: "T2V / I2V Two Stage Distilled",
      workflowFile: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
      reason: "Two-stage pipeline: generate at lower resolution then upscale 2× in latent space. Best quality-to-time ratio for high-res output.",
      requiredFiles: [
        modelFile,
        "taeltx2_3.safetensors",
        "ltx-2.3-spatial-upscaler-x2-1.0.safetensors",
        "comfy_gemma_3_12B_it.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
        { nodeName: "LTXVAudioVAELoader", field: "model_name", value: modelFile },
        { nodeName: "LatentUpscaleModelLoader", field: "model_name", value: "ltx-2.3-spatial-upscaler-x2-1.0.safetensors" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Set to HALF your target — upscaler doubles it" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
        { nodeName: "SamplerCustomAdvanced (CFGGuider)", field: "cfg", value: String(cfg) },
        { nodeName: "LTXVScheduler", field: "steps", value: String(steps) },
      ],
      warnings,
    };
  }

  // Default: Single Stage (T2V + I2V, best for beginners)
  // Note: i2v is the same workflow as t2v — image feeds into LTXVImgToVideoConditioning node.
  // ICLoRA Union Control is a ControlNet adapter (canny/depth/pose), not a generic i2v path.
  return {
    workflowName: "T2V / I2V Single Stage Distilled",
    workflowFile: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
    reason: config.mode === "i2v"
      ? "Best all-in-one workflow for image-to-video with the distilled model. Fast and works on 16GB VRAM."
      : "Best starting point for text-to-video. Handles both T2V and I2V in one workflow.",
    requiredFiles: [
      modelFile,
      "taeltx2_3.safetensors",
      "comfy_gemma_3_12B_it.safetensors",
      "ltx-2.3-22b-distilled-lora-384.safetensors",
    ],
    nodeInstructions: [
      { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
      { nodeName: "LTXVAudioVAELoader", field: "model_name", value: modelFile },
      ...(config.mode === "i2v" ? [
        { nodeName: "LoadImage", field: "image", value: "your-image.png", note: "Drag your source image into this node" },
      ] : []),
      { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: config.resolution.replace("x", " / "), note: "Must be divisible by 32" },
      { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1 (25, 49, 97…)" },
      { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
      { nodeName: "SamplerCustomAdvanced (CFGGuider)", field: "cfg", value: String(cfg) },
      { nodeName: "LTXVScheduler", field: "steps", value: String(steps) },
    ],
    warnings: isDistilled ? [] : ["Dev model needs 20+ steps and CFG ~3.5 — slower but sharper quality"],
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

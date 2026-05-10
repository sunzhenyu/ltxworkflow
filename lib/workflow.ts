export type WorkflowConfig = {
  vram: "16gb" | "24gb" | "32gb";
  mode: "t2v" | "i2v";
  priority: "speed" | "quality";
  orientation: "landscape" | "portrait";
  resolutionTier: "low" | "mid" | "high" | "ultra";
  frames: 65 | 97 | 121 | 161;
  fps: 24 | 25 | 30;
  controlMode: "none" | "v2v-composition" | "motion-track";
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

// Resolution map — all values divisible by 32 (hard LTX 2.3 constraint)
const RESOLUTION_MAP = {
  landscape: { low: "768x512", mid: "1024x576", high: "1280x704", ultra: "1920x1088" },
  portrait:  { low: "512x768", mid: "576x1024", high: "704x1280", ultra: "1088x1920" },
} as const;

export function resolveResolution(config: WorkflowConfig): string {
  return RESOLUTION_MAP[config.orientation][config.resolutionTier];
}

// Landscape tiers available per VRAM (ultra is too heavy for 16GB)
export const RESOLUTION_TIERS_BY_VRAM: Record<WorkflowConfig["vram"], WorkflowConfig["resolutionTier"][]> = {
  "16gb": ["low", "mid"],
  "24gb": ["low", "mid", "high", "ultra"],
  "32gb": ["low", "mid", "high", "ultra"],
};

export const DEFAULT_TIER_BY_VRAM: Record<WorkflowConfig["vram"], WorkflowConfig["resolutionTier"]> = {
  "16gb": "low",
  "24gb": "mid",
  "32gb": "high",
};

export function deriveModelFile(config: WorkflowConfig): string {
  const needsDev = config.priority === "quality" || config.useHDR
    || config.controlMode === "v2v-composition" || config.controlMode === "motion-track";

  if (config.vram === "16gb") {
    return needsDev
      ? "ltx-2.3-22b-dev_transformer_only_fp8_scaled.safetensors"
      : "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors";
  }
  if (config.vram === "24gb") {
    return needsDev
      ? "ltx-2.3-22b-dev-fp8.safetensors"
      : "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors";
  }
  // 32gb — use fp8 distilled (29.5GB, fits resident) rather than bf16 (46GB, needs offloading)
  return needsDev
    ? "ltx-2.3-22b-dev-fp8.safetensors"
    : "ltx-2.3-22b-distilled-fp8.safetensors";
}

// Returns VRAM-appropriate Gemma 3 12B text encoder.
// Full bf16 (~24 GB) OOMs on 16/24 GB cards alongside the transformer.
export function deriveGemmaFile(vram: WorkflowConfig["vram"]): string {
  if (vram === "32gb") return "comfy_gemma_3_12B_it.safetensors";
  return "gemma_3_12B_it_fp4_mixed.safetensors"; // 9.5 GB — safe for 16/24 GB
}

// Returns "LTX23_audio_vae_bf16.safetensors" only for transformer-only Kijai variants
// where the audio VAE is not embedded. For full checkpoints (dev, distilled bf16) the
// audio VAE is embedded in the checkpoint itself.
export function deriveAudioVAEFile(modelFile: string): string | null {
  return modelFile.includes("_transformer_only") ? "LTX23_audio_vae_bf16.safetensors" : null;
}

export function recommendWorkflow(config: WorkflowConfig): WorkflowRecommendation {
  const modelFile = deriveModelFile(config);
  const gemmaFile = deriveGemmaFile(config.vram);
  const audioVAE = deriveAudioVAEFile(modelFile);
  const isDistilled = modelFile.includes("distilled");
  const resolution = resolveResolution(config);
  const cfg = isDistilled ? 1 : 3.5;
  const warnings: string[] = [];

  // OOM warning: 161 frames + high/ultra resolution on 16/24 GB
  if (config.frames === 161) {
    if (config.vram === "16gb") {
      warnings.push("161 frames on 16 GB only reliably fits at low/mid resolution. Drop to 121 frames for high resolution.");
    } else if (config.vram === "24gb" && (config.resolutionTier === "high" || config.resolutionTier === "ultra")) {
      warnings.push("161 frames at high/ultra resolution often OOMs on 24 GB. Drop to 121 frames or use mid resolution.");
    }
  }

  // Portrait ultra warning
  if (config.orientation === "portrait" && config.resolutionTier === "ultra" && config.vram === "16gb") {
    warnings.push("1088×1920 portrait requires 24 GB+ VRAM. Drop to 704×1280 on 16 GB.");
  }

  // ── ICLoRA V2V Composition (Union Control) ──────────────────────────────────
  if (config.controlMode === "v2v-composition") {
    return {
      workflowName: "ICLoRA Union Control Distilled",
      workflowFile: "LTX-2.3_ICLoRA_Union_Control_Distilled.json",
      reason: "Video-to-video: copies pose, depth, and edges from a reference video. Drives generation with full structural control.",
      requiredFiles: [
        modelFile,
        gemmaFile,
        ...(audioVAE ? [audioVAE] : []),
        "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
        "ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        ...(audioVAE ? [{ nodeName: "LTXVAudioVAELoader", field: "model_name", value: audioVAE, note: "Place in models/checkpoints/" }] : []),
        { nodeName: "LoraLoaderModelOnly (Distilled)", field: "lora_name", value: "ltx-2.3-22b-distilled-lora-384-1.1.safetensors", note: "strength 0.5 — v1.1 required; v1.0 causes stiff motion" },
        { nodeName: "LTXICLoRALoaderModelOnly", field: "lora_name", value: "ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors", note: "strength 1.0, place in models/loras/" },
        { nodeName: "LoadVideo", field: "video", value: "your-reference-video.mp4", note: "Reference video for pose/depth/edge extraction" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: resolution.replace("x", " / "), note: "Divisible by 32" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "CFGGuider", field: "cfg", value: "1.0", note: "Manual sigmas (8-step distilled schedule)" },
        { nodeName: "KSamplerSelect", field: "sampler_name", value: "euler_ancestral_cfg_pp" },
      ],
      warnings: [
        ...warnings,
        "Install: comfyui_controlnet_aux (Fannovel16) — for DWPose + Canny preprocessors",
        "Install: ComfyUI-DepthCrafter-Nodes (akatz-ai) — for depth extraction (auto-downloads ~1.5 GB model on first run)",
        "v1.0 LoRA on v1.1 base causes frozen motion and color drift — always use v1.1 LoRA",
      ],
    };
  }

  // ── ICLoRA Motion Track ──────────────────────────────────────────────────────
  if (config.controlMode === "motion-track") {
    return {
      workflowName: "ICLoRA Motion Track Distilled",
      workflowFile: "LTX-2.3_ICLoRA_Motion_Track_Distilled.json",
      reason: "Animate a still image along drawn motion paths. Use LTXVSparseTrackEditor to draw trajectories (bundled with ComfyUI-LTXVideo, no extra plugins needed).",
      requiredFiles: [
        modelFile,
        gemmaFile,
        ...(audioVAE ? [audioVAE] : []),
        "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
        "ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        ...(audioVAE ? [{ nodeName: "LTXVAudioVAELoader", field: "model_name", value: audioVAE, note: "Place in models/checkpoints/" }] : []),
        { nodeName: "LoraLoaderModelOnly (Distilled)", field: "lora_name", value: "ltx-2.3-22b-distilled-lora-384-1.1.safetensors", note: "strength 0.5 — v1.1 required" },
        { nodeName: "LTXICLoRALoaderModelOnly", field: "lora_name", value: "ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors", note: "strength 1.0, place in models/loras/" },
        { nodeName: "LoadImage", field: "image", value: "your-image.png", note: "Source image to animate" },
        { nodeName: "LTXVSparseTrackEditor", field: "(draw tracks)", value: "(interactive)", note: "Draw motion splines in this node — no reference video needed" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: resolution.replace("x", " / "), note: "Divisible by 32" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "CFGGuider", field: "cfg", value: "1.0", note: "Manual sigmas (8-step distilled schedule)" },
        { nodeName: "KSamplerSelect", field: "sampler_name", value: "euler_ancestral_cfg_pp" },
      ],
      warnings: [
        ...warnings,
        "No extra node packs needed — LTXVSparseTrackEditor is bundled with ComfyUI-LTXVideo",
        "v1.0 LoRA on v1.1 base causes frozen motion and color drift — always use v1.1 LoRA",
      ],
    };
  }

  // ── ICLoRA HDR ───────────────────────────────────────────────────────────────
  // Verified from JSON: dev base, CFG=1, euler_ancestral, 8-step ManualSigmas, NO audio path
  if (config.useHDR) {
    if (config.vram === "16gb") {
      warnings.push("HDR uses dev FP8 (29 GB) — does not fit 16 GB VRAM. Upgrade to 24 GB.");
    }
    warnings.push("Run with OPENCV_IO_ENABLE_OPENEXR=1 in your shell, otherwise EXR save fails");
    warnings.push("Input must be a video file — use LoadVideo node (not LoadImage)");
    return {
      workflowName: "ICLoRA HDR Distilled",
      workflowFile: "LTX-2.3_ICLoRA_HDR_Distilled.json",
      reason: "Dev base + HDR IC-LoRA + distilled LoRA. Outputs linear HDR (EXR). 8-step manual sigma schedule at CFG=1.",
      requiredFiles: [
        "ltx-2.3-22b-dev-fp8.safetensors",
        gemmaFile,
        // No audio VAE — HDR workflow has no audio path (verified from JSON)
        "ltx-2.3-22b-ic-lora-hdr-0.9.safetensors",
        "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: "ltx-2.3-22b-dev-fp8.safetensors" },
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        { nodeName: "LTXICLoRALoaderModelOnly (HDR)", field: "lora_name", value: "ltx-2.3-22b-ic-lora-hdr-0.9.safetensors", note: "strength 1.0 — place in models/loras/" },
        { nodeName: "LTXICLoRALoaderModelOnly (Distilled)", field: "lora_name", value: "ltx-2.3-22b-distilled-lora-384-1.1.safetensors", note: "strength 0.5 — v1.1 required" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: resolution.replace("x", " / "), note: "Divisible by 32" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
        { nodeName: "CFGGuider", field: "cfg", value: "1.0", note: "8-step ManualSigmas schedule — not LTXVScheduler" },
        { nodeName: "KSamplerSelect", field: "sampler_name", value: "euler_ancestral", note: "Verified from official JSON" },
      ],
      warnings,
    };
  }

  // ── Two-stage upscaler (pin to v1.1 — v1.0 has endscreen artifact bug) ───────
  if (config.useUpscaler) {
    if (!isDistilled) warnings.push("Upscaler works best with distilled models (8 steps)");
    warnings.push("Use upscaler v1.1 — v1.0 produces text/logo artifacts in the last frames");
    if (config.vram === "24gb" && (config.resolutionTier === "high" || config.resolutionTier === "ultra") && config.frames >= 161) {
      warnings.push("Upscale stage at high resolution + 161 frames may OOM on 24 GB");
    }
    return {
      workflowName: "T2V / I2V Two Stage Distilled",
      workflowFile: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
      reason: "Two-stage pipeline: generate at lower resolution, then upscale 2× in latent space. Best quality-to-time ratio for high-res output.",
      requiredFiles: [
        modelFile,
        "taeltx2_3.safetensors",
        ...(audioVAE ? [audioVAE] : []),
        gemmaFile,
        "ltx-2.3-spatial-upscaler-x2-1.1.safetensors",
      ],
      nodeInstructions: [
        { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
        ...(audioVAE ? [{ nodeName: "LTXVAudioVAELoader", field: "model_name", value: audioVAE, note: "Place in models/checkpoints/" }] : [
          { nodeName: "LTXVAudioVAELoader", field: "model_name", value: modelFile, note: "Audio VAE embedded in full checkpoint" },
        ]),
        { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
        { nodeName: "LatentUpscaleModelLoader", field: "model_name", value: "ltx-2.3-spatial-upscaler-x2-1.1.safetensors" },
        { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: resolution.replace("x", " / "), note: "Set to HALF your target — upscaler doubles it" },
        { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1" },
        { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
        { nodeName: "CFGGuider", field: "cfg", value: String(cfg), note: isDistilled ? "Keep at 1.0 — raising CFG doubles VRAM" : "Dev: 3.0–5.0" },
        { nodeName: "KSamplerSelect", field: "sampler_name", value: "euler_ancestral_cfg_pp" },
      ],
      warnings,
    };
  }

  // ── Single Stage (default — T2V and I2V) ────────────────────────────────────
  // i2v is the same workflow — image feeds into LTXVImgToVideoConditioning node.
  // Audio is generated jointly in the same diffusion pass.
  // Sampler verified from JSON: euler_ancestral_cfg_pp (not plain euler)
  if (!isDistilled) {
    warnings.push("Dev model: 20+ steps, CFG ~3.5. Much slower than distilled.");
  }
  // LoRA version mismatch warning — official JSON ships v1.0 refs but v1.1 is required for v1.1 base
  warnings.push("IMPORTANT: After loading the JSON, update LoraLoaderModelOnly → ltx-2.3-22b-distilled-lora-384-1.1.safetensors. The official JSON ships v1.0 refs — v1.0 LoRA on v1.1 base causes stiff motion and color drift.");

  return {
    workflowName: "T2V / I2V Single Stage Distilled",
    workflowFile: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
    reason: config.mode === "i2v"
      ? "Standard I2V workflow — attach your image to LTXVImgToVideoConditioning. Generates video + synchronized audio in one pass."
      : "Standard T2V workflow. Generates video + synchronized audio in one pass.",
    requiredFiles: [
      modelFile,
      "taeltx2_3.safetensors",
      ...(audioVAE ? [audioVAE] : []),
      gemmaFile,
      "ltx-2.3-22b-distilled-lora-384-1.1.safetensors",
    ],
    nodeInstructions: [
      { nodeName: "CheckpointLoaderSimple", field: "ckpt_name", value: modelFile },
      ...(audioVAE ? [{ nodeName: "LTXVAudioVAELoader", field: "model_name", value: audioVAE, note: "Place in models/checkpoints/" }] : [
        { nodeName: "LTXVAudioVAELoader", field: "model_name", value: modelFile, note: "Audio VAE embedded in this checkpoint" },
      ]),
      { nodeName: "LTXAVTextEncoderLoader", field: "model_name", value: gemmaFile },
      ...(config.mode === "i2v" ? [
        { nodeName: "LTXVImgToVideoConditioning", field: "image", value: "your-image.png", note: "Drag your source image here" },
      ] : []),
      { nodeName: "EmptyLTXVLatentVideo", field: "width / height", value: resolution.replace("x", " / "), note: "Both must be divisible by 32" },
      { nodeName: "EmptyLTXVLatentVideo", field: "length", value: String(config.frames), note: "Must be 8n+1 (65, 97, 121…)" },
      { nodeName: "LTXVConditioning", field: "frame_rate", value: String(config.fps) },
      { nodeName: "CFGGuider", field: "cfg", value: String(cfg), note: isDistilled ? "Keep at 1.0 — raising CFG doubles VRAM with no quality benefit" : "Dev: 3.0–5.0" },
      { nodeName: "KSamplerSelect", field: "sampler_name", value: "euler_ancestral_cfg_pp", note: "Verified from official JSON" },
      { nodeName: "LoraLoaderModelOnly", field: "lora_name", value: "ltx-2.3-22b-distilled-lora-384-1.1.safetensors", note: "strength 0.5 — must be v1.1 (official JSON ships v1.0 by mistake)" },
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

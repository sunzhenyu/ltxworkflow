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

// ComfyUI LTXVideo official nodes (install via ComfyUI Manager, search "LTXVideo")
// Source: https://github.com/Lightricks/ComfyUI-LTXVideo/tree/main/example_workflows/2.3
// Resolution must be divisible by 32; frames must be 8n+1 (25, 49, 97)
export function generateWorkflowJSON(params: WorkflowParams): object {
  const [width, height] = params.resolution.split("x").map(Number);
  const isDistilled = params.modelFile.includes("distilled");
  const steps = isDistilled ? Math.min(params.steps, 8) : params.steps;
  const cfg = isDistilled ? 1 : params.cfg;

  return {
    "1": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: params.modelFile },
    },
    "2": {
      class_type: "CLIPTextEncode",
      inputs: { text: params.prompt, clip: ["1", 1] },
    },
    "3": {
      class_type: "CLIPTextEncode",
      inputs: { text: params.negativePrompt, clip: ["1", 1] },
    },
    "4": {
      class_type: "EmptyLTXVLatentVideo",
      inputs: { width, height, length: params.frames, batch_size: 1 },
    },
    "5": {
      class_type: "LTXVConditioning",
      inputs: {
        positive: ["2", 0],
        negative: ["3", 0],
        vae: ["1", 2],
        latent: ["4", 0],
        frame_rate: params.fps,
      },
    },
    "6": {
      class_type: "LTXVScheduler",
      inputs: {
        steps,
        max_shift: 2.05,
        base_shift: 0.95,
        stretch: true,
        terminal: 0.1,
        latent: ["4", 0],
      },
    },
    "7": {
      class_type: "SamplerCustomAdvanced",
      inputs: {
        noise: { class_type: "RandomNoise", inputs: { noise_seed: params.seed } },
        guider: {
          class_type: "CFGGuider",
          inputs: { model: ["1", 0], positive: ["5", 0], negative: ["5", 1], cfg },
        },
        sampler: { class_type: "KSamplerSelect", inputs: { sampler_name: params.scheduler } },
        sigmas: ["6", 0],
        latent_image: ["4", 0],
      },
    },
    "8": {
      class_type: "VAEDecodeTiled",
      inputs: { samples: ["7", 0], vae: ["1", 2], tile_size: 512, overlap: 64 },
    },
    "9": {
      class_type: "SaveVideo",
      inputs: { images: ["8", 0], frame_rate: params.fps, filename_prefix: "ltx23_output" },
    },
  };
}

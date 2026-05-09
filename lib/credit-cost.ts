// Pure credit-cost helpers — safe to import from client and server.
// Anything that touches Supabase / fal lives in `lib/credits.ts` (server-only).
//
// Pricing convention: 1 credit = $0.04 USD of fal compute.
// Two pricing modes coexist on fal:
//   • per_second   — used by fal-ai/ltx-2.3 (Fast/Pro). Resolution preset → per-sec rate.
//   • per_megapixel — used by fal-ai/ltx-2.3-22b. cost = W×H×frames / 1e6 × rate.

export type Resolution = "1080p" | "1440p" | "2160p";
export type Fps = 24 | 25 | 48 | 50;

// User-facing aspect ratios.
// • Per-second models (Fast/Pro): auto / 16:9 / 9:16 only.
// • 22B family: full set including 4:3 / 3:4 / 1:1 (square_hd).
// UI shows only the subset valid for the selected model.
export type AspectRatio = "auto" | "16:9" | "9:16" | "4:3" | "3:4" | "1:1";

// Allowed durations (seconds). Common subset across Fast/Standard/22B.
export const ALLOWED_DURATIONS = [6, 8, 10] as const;
export type Duration = (typeof ALLOWED_DURATIONS)[number];

export type ModelKey =
  | "ltx-2.3-fast"
  | "ltx-2.3-pro"
  | "ltx-2.3-22b-distilled"
  | "ltx-2.3-22b";

export type ModelInfo = {
  key: ModelKey;
  label: string;
  shortDescription: string;
  endpoint: string;
  /** true = requires at least one past `purchase` credit transaction */
  premium: boolean;
  pricingType: "per_second" | "per_megapixel";
  badge?: string;
};

export const MODELS: ModelInfo[] = [
  {
    key: "ltx-2.3-fast",
    label: "LTX 2.3 Fast",
    shortDescription: "Fastest. Free trial credits work here.",
    endpoint: "fal-ai/ltx-2.3/image-to-video/fast",
    premium: false,
    pricingType: "per_second",
  },
  {
    key: "ltx-2.3-pro",
    label: "LTX 2.3 Pro",
    shortDescription: "Higher quality / finer motion. Slower.",
    endpoint: "fal-ai/ltx-2.3/image-to-video",
    premium: true,
    pricingType: "per_second",
  },
  {
    key: "ltx-2.3-22b-distilled",
    label: "LTX 2.3 22B Distilled",
    shortDescription: "22B model, distilled — premium quality at moderate cost.",
    endpoint: "fal-ai/ltx-2.3-22b/distilled/image-to-video",
    premium: true,
    pricingType: "per_megapixel",
    badge: "New",
  },
  {
    key: "ltx-2.3-22b",
    label: "LTX 2.3 22B Full",
    shortDescription: "Full 22B weights — highest fidelity, highest cost.",
    endpoint: "fal-ai/ltx-2.3-22b/image-to-video",
    premium: true,
    pricingType: "per_megapixel",
    badge: "New",
  },
];

export function getModel(key: ModelKey): ModelInfo {
  const m = MODELS.find((x) => x.key === key);
  if (!m) throw new Error(`Unknown model: ${key}`);
  return m;
}

// ─── Aspect support per model family ────────────────────────────────────────
const PER_SECOND_ASPECTS: AspectRatio[] = ["auto", "16:9", "9:16"];
const PER_MEGAPIXEL_ASPECTS: AspectRatio[] = [
  "auto",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "1:1",
];

export function aspectsForModel(key: ModelKey): AspectRatio[] {
  return getModel(key).pricingType === "per_megapixel"
    ? PER_MEGAPIXEL_ASPECTS
    : PER_SECOND_ASPECTS;
}

export function isAspectSupported(key: ModelKey, aspect: AspectRatio): boolean {
  return aspectsForModel(key).includes(aspect);
}

// ─── Pricing data ───────────────────────────────────────────────────────────

// Pixel counts per per-second resolution preset.
const RESOLUTION_PIXELS: Record<Resolution, number> = {
  "1080p": 1920 * 1080,
  "1440p": 2560 * 1440,
  "2160p": 3840 * 2160,
};

// fal per-second rates ($USD) — keep in sync with fal pricing pages.
const PER_SECOND_USD: Record<"ltx-2.3-fast" | "ltx-2.3-pro", Record<Resolution, number>> = {
  "ltx-2.3-fast": { "1080p": 0.04, "1440p": 0.08, "2160p": 0.16 },
  "ltx-2.3-pro": { "1080p": 0.06, "1440p": 0.12, "2160p": 0.24 },
};

// fal per-megapixel-frame rates ($USD).
const PER_MP_USD: Record<"ltx-2.3-22b-distilled" | "ltx-2.3-22b", number> = {
  "ltx-2.3-22b-distilled": 0.001205,
  "ltx-2.3-22b": 0.001605,
};

// 22B's `video_size` enum maps to fixed pixel dimensions. Used for cost
// estimation; real fal billing uses what fal actually generated.
// Pixel numbers based on fal docs (Portrait 9:16 = 576×1024 confirmed;
// 4:3 / 3:4 follow the 1024×768 / 768×1024 standard fal uses for image models).
export type VideoSize22B =
  | "auto"
  | "landscape_16_9"
  | "portrait_16_9"
  | "landscape_4_3"
  | "portrait_4_3"
  | "square_hd";

const VIDEO_SIZE_22B_PIXELS: Record<VideoSize22B, number> = {
  // `auto` lets fal infer from input image; estimate 16:9 landscape for cost preview.
  auto: 1024 * 576,
  landscape_16_9: 1024 * 576,
  portrait_16_9: 576 * 1024,
  landscape_4_3: 1024 * 768,
  portrait_4_3: 768 * 1024,
  square_hd: 1024 * 1024,
};

/** Convert a UI aspect choice to the fal 22B `video_size` enum. */
export function aspectTo22BVideoSize(aspect: AspectRatio): VideoSize22B {
  switch (aspect) {
    case "16:9":
      return "landscape_16_9";
    case "9:16":
      return "portrait_16_9";
    case "4:3":
      return "landscape_4_3";
    case "3:4":
      return "portrait_4_3";
    case "1:1":
      return "square_hd";
    case "auto":
    default:
      return "auto";
  }
}

const USD_PER_CREDIT = 0.04;

/**
 * Estimate fal-side USD cost for a request. Used for credit conversion and
 * bookkeeping. Real billing comes from fal afterward — for `auto` size on 22B,
 * the actual cost may be slightly higher or lower depending on fal's chosen
 * dimensions.
 */
export function falCostUsd(input: {
  model: ModelKey;
  durationSeconds: number;
  resolution: Resolution;
  fps: Fps;
  aspect: AspectRatio;
}): number {
  const m = getModel(input.model);
  if (m.pricingType === "per_second") {
    const rate = PER_SECOND_USD[m.key as "ltx-2.3-fast" | "ltx-2.3-pro"][input.resolution];
    return Number((input.durationSeconds * rate).toFixed(4));
  }
  // 22B per-megapixel
  const videoSize = aspectTo22BVideoSize(input.aspect);
  const pixels = VIDEO_SIZE_22B_PIXELS[videoSize];
  const rate = PER_MP_USD[m.key as "ltx-2.3-22b-distilled" | "ltx-2.3-22b"];
  const usd = ((pixels * input.durationSeconds * input.fps) / 1_000_000) * rate;
  return Number(usd.toFixed(4));
}

/**
 * Credits a generation will cost. Always rounds up so we never under-charge.
 * Margin is preserved automatically because the retail price of a credit
 * already includes a markup over USD_PER_CREDIT.
 */
export function creditCostFor(input: {
  model: ModelKey;
  durationSeconds: number;
  resolution: Resolution;
  fps: Fps;
  aspect: AspectRatio;
}): number {
  return Math.ceil(falCostUsd(input) / USD_PER_CREDIT);
}

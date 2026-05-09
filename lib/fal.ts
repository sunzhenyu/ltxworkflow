// Thin wrapper over fal.ai's queue API. Server-only — never exposes FAL_KEY.
//
// fal queue protocol:
//   POST https://queue.fal.run/{model_id}      → { request_id, status_url, response_url, ... }
//   GET  status_url                             → { status: IN_QUEUE | IN_PROGRESS | COMPLETED | ERROR, ... }
//   GET  response_url                           → final result payload
//
// IMPORTANT: fal returns the EXACT status_url / response_url to use. They
// don't always equal `${FAL_BASE}/{model_id}/requests/{id}/...` because
// fal routes status/result on the bare app id, not the sub-route used at
// submit time. Always use the URLs fal hands back.
//
// Auth is `Authorization: Key {FAL_KEY}` (note: "Key", not "Bearer").
//
// Two parameter shapes coexist:
//   • per_second models (Fast/Pro): aspect_ratio + resolution + duration
//   • per_megapixel models (22B):   video_size + num_frames + fps

import "server-only";

import {
  aspectTo22BVideoSize,
  getModel,
  type AspectRatio,
  type Duration,
  type Fps,
  type ModelKey,
  type Resolution,
} from "./credit-cost";

const FAL_BASE = "https://queue.fal.run";

export type FalI2VModel =
  | "fal-ai/ltx-2.3/image-to-video"
  | "fal-ai/ltx-2.3/image-to-video/fast"
  | "fal-ai/ltx-2.3-22b/distilled/image-to-video"
  | "fal-ai/ltx-2.3-22b/image-to-video";

export type FalQueueStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "ERROR";

export type FalSubmitResponse = {
  request_id: string;
  status_url: string;
  response_url: string;
  cancel_url?: string;
};

export type FalStatusResponse = {
  status: FalQueueStatus;
  queue_position?: number;
  logs?: { message: string; timestamp?: string }[];
};

export type FalI2VResult = {
  video?: { url: string; content_type?: string; file_size?: number };
  seed?: number;
  prompt?: string;
};

function falKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY env var is not set");
  return key;
}

export function endpointForModel(model: ModelKey): FalI2VModel {
  return getModel(model).endpoint as FalI2VModel;
}

export type SubmitI2VParams = {
  model: ModelKey;
  imageUrl: string;
  prompt: string;
  durationSeconds: Duration;
  aspect: AspectRatio;
  fps: Fps;
  resolution: Resolution;
  generateAudio: boolean;
  endImageUrl?: string;
};

export type SubmitI2VResult = {
  requestId: string;
  modelId: FalI2VModel;
  statusUrl: string;
  responseUrl: string;
};

/**
 * Submit an image-to-video job. Dispatches the right param shape based on the
 * model's pricing family. Returns the request_id plus the EXACT status/response
 * URLs fal wants us to use — we store those and use them verbatim later.
 */
export async function submitI2V(params: SubmitI2VParams): Promise<SubmitI2VResult> {
  const m = getModel(params.model);
  const modelId = m.endpoint as FalI2VModel;

  const body: Record<string, unknown> = {
    image_url: params.imageUrl,
    prompt: params.prompt,
    generate_audio: params.generateAudio,
  };
  if (params.endImageUrl) body.end_image_url = params.endImageUrl;

  if (m.pricingType === "per_second") {
    body.duration = params.durationSeconds;
    body.resolution = params.resolution;
    body.aspect_ratio = params.aspect;
    body.fps = params.fps;
  } else {
    body.video_size = aspectTo22BVideoSize(params.aspect);
    body.num_frames = Math.round(params.durationSeconds * params.fps);
    body.fps = params.fps;
  }

  const res = await fetch(`${FAL_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal submit failed (${res.status}): ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as FalSubmitResponse;
  if (!data.request_id || !data.status_url || !data.response_url) {
    console.error("[fal] submit response missing expected fields:", data);
    throw new Error("fal submit returned incomplete payload");
  }
  return {
    requestId: data.request_id,
    modelId,
    statusUrl: data.status_url,
    responseUrl: data.response_url,
  };
}

/**
 * Fetch current job status. Pass the EXACT URL fal handed us back at submit.
 */
export async function getStatusByUrl(statusUrl: string): Promise<FalStatusResponse> {
  const res = await fetch(statusUrl, {
    headers: { Authorization: `Key ${falKey()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal status failed (${res.status}) at ${statusUrl}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as FalStatusResponse;
}

/**
 * Fetch the completed result. Pass the EXACT URL fal handed us back at submit.
 */
export async function getResultByUrl(responseUrl: string): Promise<FalI2VResult> {
  const res = await fetch(responseUrl, {
    headers: { Authorization: `Key ${falKey()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal result failed (${res.status}) at ${responseUrl}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as FalI2VResult;
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ALLOWED_DURATIONS,
  aspectsForModel,
  creditCostFor,
  getModel,
  isAspectSupported,
  MODELS,
  type AspectRatio,
  type Duration,
  type Fps,
  type ModelKey,
  type Resolution,
} from "@/lib/credit-cost";
import { WELCOME_CREDITS } from "@/lib/credits-constants";

type ApiStatus = "pending" | "running" | "completed" | "failed";
type UiStatus = "idle" | "submitting" | "running" | "completed" | "failed";

const DEFAULT_MODEL: ModelKey = "ltx-2.3-fast";
const DEFAULT_RES: Resolution = "1080p";
const DEFAULT_DURATION: Duration = 6;
const DEFAULT_ASPECT: AspectRatio = "auto";
const DEFAULT_AUDIO = true;
const DEFAULT_FPS: Fps = 25;

const RESOLUTION_OPTIONS: Resolution[] = ["1080p", "1440p", "2160p"];

const ASPECT_LABEL: Record<AspectRatio, string> = {
  auto: "Auto (match image)",
  "16:9": "16:9 Landscape",
  "9:16": "9:16 Portrait",
  "4:3": "4:3 Landscape (22B only)",
  "3:4": "3:4 Portrait (22B only)",
  "1:1": "1:1 Square HD (22B only)",
};

type HistoryItem = {
  id: string;
  status: ApiStatus;
  mode: string;
  model: string;
  prompt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  resolution: string;
  durationSeconds: number;
  creditsCharged: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
};

export default function Generator({
  initialBalance,
}: {
  initialBalance: number;
}) {
  const { data: session } = useSession();
  const isAuthed = !!session;
  const router = useRouter();

  // Account state
  const [balance, setBalance] = useState(initialBalance);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelKey>(DEFAULT_MODEL);
  const [aspect, setAspect] = useState<AspectRatio>(DEFAULT_ASPECT);
  const [duration, setDuration] = useState<Duration>(DEFAULT_DURATION);
  const [resolution, setResolution] = useState<Resolution>(DEFAULT_RES);
  const [generateAudio, setGenerateAudio] = useState(DEFAULT_AUDIO);
  // fps is hidden by default — most users don't care
  const fps: Fps = DEFAULT_FPS;

  const [uploading, setUploading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Run state
  const [status, setStatus] = useState<UiStatus>("idle");
  const [genId, setGenId] = useState<string | null>(null);
  const [video, setVideo] = useState<{ url: string; expiresAt: string | null } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const modelInfo = getModel(model);
  const isPerMegapixel = modelInfo.pricingType === "per_megapixel";
  const aspectOptionsForModel = aspectsForModel(model);

  // If the user switches to a model that doesn't support the current aspect
  // (e.g. 1:1 selected then they pick LTX 2.3 Fast), snap back to "auto".
  useEffect(() => {
    if (!isAspectSupported(model, aspect)) setAspect("auto");
  }, [model, aspect]);

  const cost = useMemo(
    () => creditCostFor({ model, durationSeconds: duration, resolution, fps, aspect }),
    [model, duration, resolution, fps, aspect],
  );

  const formDisabled = status === "submitting" || status === "running" || uploading;
  const canSubmit =
    !formDisabled &&
    balance >= cost &&
    imageUrl.trim().length > 0 &&
    prompt.trim().length > 0;

  // ── Side effects ────────────────────────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    if (!isAuthed) return;
    try {
      const res = await fetch("/api/generations?limit=20", { cache: "no-store" });
      if (!res.ok) return;
      const data: { items: HistoryItem[] } = await res.json();
      setHistory(data.items ?? []);
      setHistoryLoaded(true);
    } catch {
      /* non-fatal */
    }
  }, [isAuthed]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  async function refreshBalance() {
    if (!isAuthed) return;
    try {
      const res = await fetch("/api/credits/balance", { cache: "no-store" });
      const data = await res.json();
      if (typeof data.balance === "number") setBalance(data.balance);
    } catch {
      /* non-fatal */
    }
  }

  // Tick elapsed time while running.
  useEffect(() => {
    if (status !== "running" && status !== "submitting") return;
    const t = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // Poll the server for completion.
  useEffect(() => {
    if (!genId || status !== "running") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/generate/${genId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: {
          status: ApiStatus;
          videoUrl?: string | null;
          expiresAt?: string | null;
          errorMessage?: string | null;
        } = await res.json();
        if (cancelled) return;
        if (data.status === "completed" && data.videoUrl) {
          setVideo({ url: data.videoUrl, expiresAt: data.expiresAt ?? null });
          setStatus("completed");
          refreshHistory();
        } else if (data.status === "failed") {
          setErrorMsg(data.errorMessage || "Generation failed");
          setStatus("failed");
          refreshBalance();
          refreshHistory();
        }
      } catch {
        /* keep polling */
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [genId, status, refreshHistory]);

  // ── Handlers ────────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAuthed) {
      router.push("/sign-in?callbackUrl=/generate");
      return;
    }
    setErrorMsg(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSuggest() {
    if (!isAuthed) { router.push("/sign-in?callbackUrl=/generate"); return; }
    if (suggesting) return;
    setSuggesting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/suggest-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageUrl ? { image_url: imageUrl } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suggestion failed");
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not load suggestions");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthed) { router.push("/sign-in?callbackUrl=/generate"); return; }
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMsg(null);
    setVideo(null);
    setGenId(null);
    setElapsedSec(0);
    startedAtRef.current = Date.now();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "i2v",
          model,
          image_url: imageUrl.trim(),
          prompt: prompt.trim(),
          resolution,
          aspect_ratio: aspect,
          fps,
          generate_audio: generateAudio,
          duration_seconds: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setGenId(data.id);
      if (typeof data.balanceAfter === "number") setBalance(data.balanceAfter);
      setStatus("running");
      refreshHistory();
    } catch (err) {
      setStatus("failed");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  function resetForAnother() {
    setStatus("idle");
    setVideo(null);
    setGenId(null);
    setErrorMsg(null);
    setSuggestions([]);
    startedAtRef.current = null;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="space-y-5 w-full">
        {/* Balance */}
        {isAuthed ? (
          <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-sm gap-3">
            <span className="text-gray-300">
              <span className="text-white font-bold">{balance}</span>{" "}
              {balance === 1 ? "credit" : "credits"}
            </span>
            {balance < cost ? (
              <a
                href="/pricing"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Buy more credits →
              </a>
            ) : (
              <span className="text-xs text-gray-500">{cost} credits / clip</span>
            )}
          </div>
        ) : (
          <a
            href="/sign-in?callbackUrl=/generate"
            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-sm gap-3 hover:border-violet-700 transition-colors"
          >
            <span className="text-gray-400">Sign in to claim your free credits</span>
            <span className="text-xs bg-amber-500 text-gray-950 font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
              Get {WELCOME_CREDITS} free credits →
            </span>
          </a>
        )}

        {/* Prompt + image card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Prompt</span>
            <button
              type="button"
              onClick={handleSuggest}
              disabled={suggesting || formDisabled}
              className="text-xs inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span aria-hidden>🎲</span>
              {suggesting ? "Thinking…" : imageUrl ? "Suggest from image" : "Random prompt"}
            </button>
          </div>

          <div className="flex gap-3 items-stretch">
            <ImageTile
              imageUrl={imageUrl}
              uploading={uploading}
              disabled={formDisabled}
              onClear={() => setImageUrl("")}
              onChange={handleFileChange}
            />
            <textarea
              required
              rows={4}
              placeholder="Describe the motion you want — e.g. 'camera slowly pushes in, leaves rustle in the wind, soft cinematic light'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={formDisabled}
              maxLength={1000}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-violet-600 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Chip row — options adapt to selected model */}
          <div className="flex gap-2 flex-wrap items-center">
            <Chip
              icon="📐"
              value={aspect === "auto" ? "Auto" : aspect}
              options={aspectOptionsForModel.map((a) => ({
                value: a,
                label: ASPECT_LABEL[a],
              }))}
              onChange={(v) => setAspect(v as AspectRatio)}
              disabled={formDisabled}
            />
            <Chip
              icon="⏱"
              value={`${duration}s`}
              options={ALLOWED_DURATIONS.map((d) => ({ value: d, label: `${d} seconds` }))}
              onChange={(v) => setDuration(v as Duration)}
              disabled={formDisabled}
            />
            {/* 22B uses video_size internally — its pixel dims come from the
                aspect choice, so a separate resolution chip would be misleading. */}
            {!isPerMegapixel && (
              <Chip
                icon="🎬"
                value={resolution}
                options={RESOLUTION_OPTIONS.map((r) => ({ value: r, label: r }))}
                onChange={(v) => setResolution(v as Resolution)}
                disabled={formDisabled}
              />
            )}
            <Chip
              icon="🔊"
              value={generateAudio ? "On" : "Off"}
              options={[
                { value: true, label: "Audio on" },
                { value: false, label: "Audio off" },
              ]}
              onChange={(v) => setGenerateAudio(v as boolean)}
              disabled={formDisabled}
            />
            {isPerMegapixel && (
              <span className="text-[11px] text-gray-500 italic ml-1">
                22B: pixel size set by aspect
              </span>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <SuggestionsPanel
              suggestions={suggestions}
              onPick={(p) => {
                setPrompt(p);
                setSuggestions([]);
              }}
              onClose={() => setSuggestions([])}
              onMore={handleSuggest}
              loadingMore={suggesting}
            />
          )}

          {/* Model + submit footer */}
          <div className="border-t border-gray-800 pt-4 space-y-4">
            <ModelSelector
              model={model}
              setModel={setModel}
              cost={cost}
              durationSeconds={duration}
              resolution={resolution}
              fps={fps}
              aspect={aspect}
            />

            <div className="flex justify-end gap-3 items-center">
              <button
                type="button"
                onClick={resetForAnother}
                disabled={formDisabled}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-30"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isAuthed && !canSubmit}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                {status === "submitting" && <>Starting…</>}
                {status === "running" && <>Generating… {elapsedSec}s</>}
                {status !== "submitting" && status !== "running" && !isAuthed && (
                  <>Sign in to generate →</>
                )}
                {status !== "submitting" && status !== "running" && isAuthed && (
                  <>
                    <span aria-hidden>✨</span>
                    Generate
                    <span className="text-xs bg-white/15 px-1.5 py-0.5 rounded">
                      {cost}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded p-3">
              {errorMsg}
            </p>
          )}
        </form>

        {(status === "running" || status === "submitting") && (
          <div className="bg-violet-900/20 border border-violet-700/50 rounded-xl p-5 text-sm text-gray-300 text-center space-y-1">
            <p>Generating your video — typically 30–90 seconds.</p>
            <p className="text-xs text-gray-500">Don&apos;t close this tab.</p>
          </div>
        )}

        {video && status === "completed" && (
          <div className="space-y-3">
            <video
              src={video.url}
              controls
              playsInline
              className="w-full rounded-xl bg-black"
            />
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 text-xs text-amber-100/80 flex items-start gap-2">
              <span aria-hidden>⚠</span>
              <p>
                Video link expires{" "}
                {video.expiresAt
                  ? `around ${new Date(video.expiresAt).toLocaleDateString()}`
                  : "in ~7 days"}
                .{" "}
                <button
                  type="button"
                  onClick={() => downloadVideo(video.url)}
                  className="underline text-amber-200 hover:text-amber-100 cursor-pointer"
                >
                  Download to save permanently
                </button>
                .
              </p>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={resetForAnother}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2 rounded-lg transition-colors"
              >
                Generate another →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History — signed-in only */}
      {isAuthed && <section className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your recent generations</h2>
          {history.length > 0 && (
            <span className="text-xs text-gray-500">{history.length} total</span>
          )}
        </div>
        {!historyLoaded ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nothing yet. Your generations will appear here so you can rewatch and download them.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image tile (upload-only, no URL paste)
// ─────────────────────────────────────────────────────────────────────────────
function ImageTile({
  imageUrl,
  uploading,
  disabled,
  onClear,
  onChange,
}: {
  imageUrl: string;
  uploading: boolean;
  disabled: boolean;
  onClear: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  if (imageUrl) {
    return (
      <div className="relative shrink-0 self-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="source"
          className="w-24 h-24 object-cover rounded-lg bg-black border border-gray-800"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
          }}
        />
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center disabled:opacity-30"
          aria-label="Remove image"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <label
      className={`shrink-0 self-start w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
        disabled
          ? "border-gray-800 bg-gray-950 opacity-50 cursor-not-allowed"
          : "border-gray-700 bg-gray-950 hover:bg-gray-900 hover:border-violet-600 cursor-pointer"
      }`}
    >
      {uploading ? (
        <span className="text-xs text-gray-400">Uploading…</span>
      ) : (
        <>
          <span className="text-2xl text-gray-500">+</span>
          <span className="text-[10px] text-gray-500 mt-0.5">Image *</span>
        </>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact "chip" with click-out popover for a small list of options.
// ─────────────────────────────────────────────────────────────────────────────
function Chip<T>({
  icon,
  value,
  options,
  onChange,
  disabled,
}: {
  icon: string;
  value: string;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
          disabled
            ? "border-gray-800 text-gray-600 bg-gray-900 cursor-not-allowed"
            : open
            ? "border-violet-500 bg-violet-900/30 text-white"
            : "border-gray-700 bg-gray-900 hover:border-gray-600 text-gray-200"
        }`}
      >
        <span aria-hidden className="text-sm leading-none">{icon}</span>
        <span>{value}</span>
        <span className="text-[10px] text-gray-500 ml-0.5">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1.5 bg-gray-950 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="block w-full text-left text-xs px-3 py-2 hover:bg-violet-900/40 text-gray-200 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Force-download a video by fetching as blob — bypasses fal.media's
// `Content-Disposition: inline` which makes plain `<a download>` open the
// video in a new tab instead of triggering a browser save.
// ─────────────────────────────────────────────────────────────────────────────
async function downloadVideo(url: string, filename = "ltx-2.3-video.mp4") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download fetch ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);
  } catch (err) {
    console.error("[download] blob fetch failed, falling back:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Model selector — collapsed shows current model + cost; expanded shows all 4.
// ─────────────────────────────────────────────────────────────────────────────
function ModelSelector({
  model,
  setModel,
  cost,
  durationSeconds,
  resolution,
  fps,
  aspect,
}: {
  model: ModelKey;
  setModel: (k: ModelKey) => void;
  cost: number;
  durationSeconds: Duration;
  resolution: Resolution;
  fps: Fps;
  aspect: AspectRatio;
}) {
  const [open, setOpen] = useState(false);
  const current = getModel(model);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-left transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{current.label}</span>
            {current.badge && (
              <span className="text-[10px] bg-amber-600/40 text-amber-200 px-1.5 py-0.5 rounded">
                {current.badge}
              </span>
            )}
            {/* All models accept any credits — premium gating removed. */}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{current.shortDescription}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">Cost</div>
          <div className="text-sm font-bold text-violet-300">
            {cost} {cost === 1 ? "credit" : "credits"}
          </div>
        </div>
        <span className="text-gray-500 text-sm ml-1">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {MODELS.map((m) => {
            const selected = m.key === model;
            // Cost preview uses the aspect the caller already picked. If the
            // current aspect isn't supported by this option (e.g. "1:1" but
            // the option is Fast), fall back to "auto" so the preview stays
            // sensible.
            const previewAspect = isAspectSupported(m.key, aspect) ? aspect : "auto";
            const optionCost = creditCostFor({
              model: m.key,
              durationSeconds,
              resolution,
              fps,
              aspect: previewAspect,
            });
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => {
                  setModel(m.key);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                  selected
                    ? "border-violet-500 bg-violet-900/20"
                    : "border-gray-800 bg-gray-950 hover:bg-gray-900"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{m.label}</span>
                    {m.badge && (
                      <span className="text-[10px] bg-amber-600/40 text-amber-200 px-1.5 py-0.5 rounded">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.shortDescription}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-violet-300">
                    {optionCost}
                  </div>
                  <div className="text-[10px] text-gray-500">credits</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestions panel — list of generated prompt candidates.
// ─────────────────────────────────────────────────────────────────────────────
function SuggestionsPanel({
  suggestions,
  onPick,
  onClose,
  onMore,
  loadingMore,
}: {
  suggestions: string[];
  onPick: (p: string) => void;
  onClose: () => void;
  onMore: () => void;
  loadingMore: boolean;
}) {
  return (
    <div className="bg-gray-950 border border-violet-800/50 rounded-xl p-3 space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-violet-300 font-medium">
          Suggestions · click one to use
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onMore}
            disabled={loadingMore}
            className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50"
          >
            {loadingMore ? "…" : "More"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      </div>
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s)}
          className="block w-full text-left text-xs text-gray-200 bg-gray-900 hover:bg-violet-900/30 hover:text-white border border-gray-800 hover:border-violet-700 rounded-lg px-3 py-2 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History row
// ─────────────────────────────────────────────────────────────────────────────
function HistoryRow({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const expired = item.expiresAt && new Date(item.expiresAt) < new Date();
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className="flex gap-3 items-start">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt="Source image for this generation"
            className="w-16 h-16 object-cover rounded shrink-0 bg-black"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-950 rounded shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={item.status} />
            <span className="text-xs text-gray-500">{item.model}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          {item.prompt && (
            <p className="text-xs text-gray-300 line-clamp-2 break-words">{item.prompt}</p>
          )}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="text-gray-500">
              {item.resolution} · {item.durationSeconds}s · {item.creditsCharged}{" "}
              {item.creditsCharged === 1 ? "credit" : "credits"}
            </span>
            {item.status === "completed" && item.videoUrl && !expired && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-violet-400 hover:text-violet-300"
              >
                {expanded ? "Hide ▴" : "▶ Watch"}
              </button>
            )}
            {item.status === "completed" && expired && (
              <span className="text-amber-400">Link expired</span>
            )}
            {item.errorMessage && (
              <span className="text-red-400 line-clamp-1">{item.errorMessage}</span>
            )}
          </div>
        </div>
      </div>
      {expanded && item.videoUrl && (
        <video
          src={item.videoUrl}
          controls
          playsInline
          className="w-full rounded mt-3 bg-black"
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ApiStatus }) {
  const styles: Record<ApiStatus, string> = {
    pending: "bg-gray-800 text-gray-400",
    running: "bg-violet-900/40 text-violet-300",
    completed: "bg-emerald-900/40 text-emerald-300",
    failed: "bg-red-900/40 text-red-300",
  };
  const labels: Record<ApiStatus, string> = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

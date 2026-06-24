import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { MODELS, ModelVariant } from "@/lib/models";
import EmailSubscribe from "@/components/EmailSubscribe";
import CopyFilenameButton from "@/components/CopyFilenameButton";

export function generateStaticParams() {
  return MODELS.map((m) => ({ id: m.id }));
}

function findModel(id: string): ModelVariant | null {
  return MODELS.find((m) => m.id === id) ?? null;
}

type ModelCategory = "vae" | "text-encoder" | "upscaler" | "lora" | "checkpoint";

function getModelCategory(model: ModelVariant): ModelCategory {
  if (["ltx23-vae", "ltx23-audio-vae", "ltx23-video-vae"].includes(model.id))
    return "vae";
  if (model.id === "ltx23-text-projection" || model.id.includes("gemma"))
    return "text-encoder";
  if (model.id.includes("upscaler") || model.id.includes("temporal"))
    return "upscaler";
  if (model.type === "lora") return "lora";
  return "checkpoint";
}

// ComfyUI install folder, single source of truth for both the page body and metadata.
function getInstallFolder(category: ModelCategory): string {
  switch (category) {
    case "vae":
      return "ComfyUI/models/vae/";
    case "text-encoder":
      return "ComfyUI/models/text_encoders/";
    case "upscaler":
      return "ComfyUI/models/latent_upscale_models/";
    case "lora":
      return "ComfyUI/models/loras/";
    case "checkpoint":
      return "ComfyUI/models/checkpoints/";
  }
}

// Components (VAE / text-encoder / upscaler / distillation LoRA) are folder-led:
// VRAM is noise for them, so titles/descriptions lead with the install folder and
// what the file pairs with — the questions HuggingFace's bare file listing can't answer.
function isFolderLed(category: ModelCategory): boolean {
  return category !== "checkpoint";
}

function categoryLabel(model: ModelVariant, category: ModelCategory): string {
  switch (category) {
    case "vae":
      return "VAE";
    case "text-encoder":
      return model.id === "ltx23-text-projection" ? "text encoder part" : "text encoder";
    case "upscaler":
      return "latent upscaler";
    case "lora":
      return "LoRA";
    case "checkpoint":
      return "checkpoint";
  }
}

function categorySentence(model: ModelVariant, category: ModelCategory): string {
  switch (category) {
    case "vae":
      return model.id === "ltx23-audio-vae"
        ? "the audio VAE for LTX 2.3 audio-video generation."
        : "the VAE that decodes LTX 2.3 latents into video frames.";
    case "text-encoder":
      return model.id === "ltx23-text-projection"
        ? "the projection layer that connects the Gemma text encoder to LTX 2.3."
        : "the Gemma 3 text encoder LTX 2.3 uses to read your prompt.";
    case "upscaler":
      return "the latent upscaler for two-stage LTX 2.3 pipelines.";
    case "lora":
      return "a distillation LoRA applied on the LTX 2.3 dev model.";
    case "checkpoint":
      return model.description;
  }
}

function relatedModels(model: ModelVariant): ModelVariant[] {
  // Same type or matching VRAM tier, excluding self
  return MODELS.filter(
    (m) =>
      m.id !== model.id &&
      (m.type === model.type || (m.vram === model.vram && m.type !== "lora"))
  ).slice(0, 6);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = findModel(id);
  if (!model) return { title: "Model Not Found" };

  const category = getModelCategory(model);
  const folder = getInstallFolder(category);
  const shortFolder = folder.replace(/^ComfyUI\//, "");
  const label = categoryLabel(model, category);

  let title: string;
  let description: string;

  if (isFolderLed(category)) {
    // VRAM is noise here. Lead with the install folder — the single answer searchers
    // get wrong (the "not in list" red node) and that HuggingFace never shows.
    title = `${model.filename} → ${shortFolder} · LTX 2.3 ${label} download`;
    description = `${model.filename} goes in ${folder} — ${categorySentence(model, category)} Free direct download, what it pairs with, and the fix when ComfyUI says it can't find the file.`;
  } else {
    title = `${model.filename} — ${model.vram}GB VRAM · download + ComfyUI setup`;
    description = `${model.filename}: ${model.size}, runs on ${model.vram}GB VRAM. ${model.description} Free direct download plus the install path, compatible workflows, and CFG/step settings.`;
  }

  return {
    title,
    description,
    alternates: { canonical: `https://ltxworkflow.com/models/${model.id}` },
    openGraph: {
      title: `${model.filename} — ${model.name}`,
      description,
      url: `https://ltxworkflow.com/models/${model.id}`,
      type: "website",
    },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = findModel(id);
  if (!model) notFound();

  const related = relatedModels(model);

  // ComfyUI install location
  const installPath = getInstallFolder(getModelCategory(model));

  // Compatible workflows — all ICLoRA workflows are distilled-only
  const isDistilledModel =
    model.type === "distilled" ||
    (model.type === "fp8" && model.filename.includes("distilled")) ||
    (model.type === "lora" && model.id.includes("distilled"));
  const isVaeOrComponent = ["ltx23-vae", "ltx23-audio-vae", "ltx23-video-vae", "ltx23-text-projection"].includes(model.id);
  const isUpscaler = model.id.includes("upscaler") || model.id.includes("temporal");

  const compatibleWorkflows = [
    {
      name: "T2V / I2V Single Stage Distilled",
      file: "LTX-2.3_T2V_I2V_Single_Stage_Distilled_Full.json",
      compat: isDistilledModel && !isVaeOrComponent && !isUpscaler,
    },
    {
      name: "T2V / I2V Two Stage Distilled",
      file: "LTX-2.3_T2V_I2V_Two_Stage_Distilled.json",
      compat: (isDistilledModel || isUpscaler) && !isVaeOrComponent,
    },
    {
      name: "ICLoRA Union Control Distilled",
      file: "LTX-2.3_ICLoRA_Union_Control_Distilled.json",
      compat: isDistilledModel && !isVaeOrComponent && !isUpscaler,
    },
    {
      name: "ICLoRA Motion Track Distilled",
      file: "LTX-2.3_ICLoRA_Motion_Track_Distilled.json",
      compat: isDistilledModel && !isVaeOrComponent && !isUpscaler,
    },
    {
      name: "ICLoRA HDR Distilled",
      file: "LTX-2.3_ICLoRA_HDR_Distilled.json",
      compat: isDistilledModel && !isVaeOrComponent && !isUpscaler,
    },
  ].filter((w) => w.compat);

  // Common troubleshooting based on type/VRAM, merged with model-specific knownIssues
  const genericTroubleshooting = buildTroubleshooting(model);
  const modelSpecificIssues = (model.knownIssues ?? []).map((issue) => ({
    q: issue.error,
    a: `${issue.cause}\n\nFix: ${issue.fix}`,
  }));
  // Model-specific issues first (more relevant), then generic type-level issues
  const troubleshooting = [...modelSpecificIssues, ...genericTroubleshooting];

  // JSON-LD SoftwareApplication schema
  const softwareSchema: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `https://ltxworkflow.com/models/${model.id}#software`,
    name: model.filename,
    alternateName: model.name,
    description: model.description,
    applicationCategory: "VideoGeneration",
    operatingSystem: "Linux, Windows, macOS",
    url: `https://ltxworkflow.com/models/${model.id}`,
    downloadUrl: model.hfUrl,
    fileSize: model.size,
    softwareRequirements: `NVIDIA GPU with ${model.vram}GB+ VRAM, ComfyUI`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
  if (model.releaseInfo?.released) {
    softwareSchema.datePublished = model.releaseInfo.released;
  }

  // FAQPage schema — emit when we have at least one Q/A pair, exposing
  // troubleshooting + path-variant fixes as Google rich-result candidates.
  const faqEntities = troubleshooting.map((t) => ({
    "@type": "Question",
    name: t.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: t.a,
    },
  }));
  if (model.pathVariants && model.pathVariants.length > 0) {
    faqEntities.push({
      "@type": "Question",
      name: `Why does ComfyUI say it can't find ${model.filename}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          `The workflow JSON references this file under a subdirectory prefix. ` +
          `Observed variants in published workflows include: ${model.pathVariants.join(", ")}. ` +
          `Either create the matching subdirectory inside ${installPath} and place the file there, ` +
          `or edit the workflow JSON and remove the prefix so it references just ${model.filename}.`,
      },
    });
  }

  const graphNodes: Record<string, unknown>[] = [softwareSchema];
  if (faqEntities.length > 0) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `https://ltxworkflow.com/models/${model.id}#faq`,
      mainEntity: faqEntities,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/models" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="space-y-6">
        <nav className="text-sm">
          <Link href="/models" className="text-violet-400 hover:text-violet-300">
            ← All Models
          </Link>
        </nav>

        <header className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {model.badge && (
              <span className="bg-violet-700 text-violet-100 text-xs px-2 py-0.5 rounded-full font-medium">
                {model.badge}
              </span>
            )}
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">
              {model.size}
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {model.vram}GB+ VRAM
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">
              {model.type}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-100 break-all font-mono">
            {model.filename}
          </h1>
          <p className="text-lg text-gray-300">{model.name}</p>
          <p className="text-gray-400 leading-relaxed">{model.description}</p>
          {model.releaseInfo && (
            <p className="text-xs text-gray-500">
              Released {model.releaseInfo.released} · Source:{" "}
              <span className="text-gray-400">{model.releaseInfo.source}</span>
              {model.releaseInfo.notes && (
                <span className="text-gray-500"> — {model.releaseInfo.notes}</span>
              )}
            </p>
          )}
        </header>

        {/* Download CTA */}
        <section className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-700/50 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Download {model.filename}</h2>
            <p className="text-sm text-violet-200">
              Direct HuggingFace download. {model.size} · Free.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={model.hfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <span>Open on HuggingFace</span>
              <span aria-hidden>↗</span>
            </a>
            <CopyFilenameButton filename={model.filename} />
          </div>
          <div className="text-xs text-gray-400 bg-gray-950/40 rounded-lg p-3 font-mono break-all">
            <span className="text-gray-500">Install path:</span>{" "}
            <span className="text-gray-200">{installPath}</span>
            <span className="text-gray-500"> + </span>
            <span className="text-violet-300">{model.filename}</span>
          </div>
        </section>

        {/* Try Online CTA — captures users without a GPU */}
        <section className="bg-gradient-to-br from-amber-900/25 via-orange-900/15 to-amber-900/10 border border-amber-600/50 rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden>▶</span>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-white">
                No {model.vram}GB GPU? Try {model.filename} online — free generation included
              </h2>
              <p className="text-sm text-amber-100/80">
                Skip the {model.size} download and ComfyUI setup. Generate a 6-second video using
                this exact model in your browser, ~30 seconds.
              </p>
            </div>
          </div>
          <Link
            href={`/generate?model=${model.id}`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Try this model online — free →
          </Link>
        </section>

        {/* Technical details — model-specific */}
        {model.technicalNotes && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-100">Technical details</h2>
            <div className="bg-gray-900 rounded-xl p-5 space-y-3 text-sm text-gray-300 leading-relaxed">
              {model.technicalNotes
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </section>
        )}

        {/* When to choose this over alternatives — model-specific */}
        {model.whenToChoose && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-100">
              When to choose {model.filename}
            </h2>
            <div className="bg-gray-900 rounded-xl p-5 space-y-3 text-sm text-gray-300 leading-relaxed">
              {model.whenToChoose
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </section>
        )}

        {/* Will it run on my GPU */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-100">Will this run on my GPU?</h2>
          <div className="bg-gray-900 rounded-xl p-5 space-y-3 text-sm">
            <p className="text-gray-300">
              <span className="font-semibold text-white">Minimum:</span>{" "}
              {model.vram}GB VRAM.
              {model.vramMax && (
                <>
                  {" "}
                  <span className="font-semibold text-white">Headroom up to:</span>{" "}
                  {model.vramMax}GB.
                </>
              )}
            </p>
            <GpuCompatibilityTable vram={model.vram} type={model.type} />
            {model.recommendation && (
              <p className="text-gray-400 leading-relaxed pt-2 border-t border-gray-800">
                <span className="text-gray-500">Recommendation: </span>
                {model.recommendation}
              </p>
            )}
          </div>
        </section>

        {/* How to use */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-100">How to use {model.filename}</h2>
          <div className="bg-gray-900 rounded-xl p-5 space-y-4 text-sm text-gray-300">
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                Download the file from{" "}
                <a
                  href={model.hfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  HuggingFace
                </a>
                .
              </li>
              <li>
                Place it in <span className="font-mono text-gray-200">{installPath}</span>{" "}
                inside your ComfyUI directory.
              </li>
              <li>
                Restart ComfyUI (or refresh the model list from the menu).
              </li>
              <li>
                Load a compatible workflow — see below.
              </li>
            </ol>
            {compatibleWorkflows.length > 0 && (
              <div className="pt-3 border-t border-gray-800">
                <p className="text-gray-400 mb-2">Compatible official workflows:</p>
                <ul className="space-y-1.5">
                  {compatibleWorkflows.map((w) => (
                    <li key={w.file} className="font-mono text-xs">
                      <Link href="/workflows" className="text-violet-400 hover:text-violet-300">
                        {w.file}
                      </Link>
                      <span className="text-gray-500 ml-2 font-sans">— {w.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-3 border-t border-gray-800">
              <p className="text-gray-400">
                Don&apos;t want to run this locally? Try {model.filename} online with{" "}
                <Link
                  href={`/generate?model=${model.id}`}
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  a free generation
                </Link>
                {" "}— no GPU, no install, ~30 seconds per clip.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow path variants — captures "cannot find model" path-prefix queries */}
        {model.pathVariants && model.pathVariants.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-100">
              ComfyUI says it can&apos;t find {model.filename}?
            </h2>
            <div className="bg-gray-900 rounded-xl p-5 space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                Some published workflow JSONs reference this file under a custom
                subdirectory. If ComfyUI shows a &quot;cannot find model&quot; error and
                your workflow references one of these path-prefixed variants:
              </p>
              <ul className="space-y-1 font-mono text-xs text-violet-300 bg-gray-950/50 rounded-lg p-3 break-all">
                {model.pathVariants.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
              <p>
                The prefix before the slash or backslash is a subdirectory the
                workflow author used. The actual file is the same{" "}
                <span className="font-mono text-violet-300">{model.filename}</span>{" "}
                — you have two fixes:
              </p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>
                  Create the matching subdirectory inside{" "}
                  <span className="font-mono text-gray-200">{installPath}</span>{" "}
                  and place the file there. Example: if the workflow references{" "}
                  <span className="font-mono text-violet-300">
                    {model.pathVariants[0]}
                  </span>
                  , create the corresponding subfolder under{" "}
                  <span className="font-mono text-gray-200">{installPath}</span>{" "}
                  and put {model.filename} inside it.
                </li>
                <li>
                  Or open the workflow JSON in a text editor and replace the
                  prefixed string with just{" "}
                  <span className="font-mono text-violet-300">
                    {model.filename}
                  </span>
                  . ComfyUI then resolves it directly from{" "}
                  <span className="font-mono text-gray-200">{installPath}</span>.
                </li>
              </ol>
              <p className="text-gray-400">
                On Windows the separator is{" "}
                <span className="font-mono">\</span>, on macOS/Linux it is{" "}
                <span className="font-mono">/</span> — they refer to the same
                nested folder regardless of platform.
              </p>
            </div>
          </section>
        )}

        {/* Troubleshooting */}
        {troubleshooting.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-100">Common issues</h2>
            <div className="space-y-2">
              {troubleshooting.map((t) => (
                <details key={t.q} className="bg-gray-900 rounded-lg p-4 group">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between text-sm">
                    <span>{t.q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-gray-300 text-sm mt-3 leading-relaxed whitespace-pre-line">
                    {t.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        <EmailSubscribe
          headline={`Get notified when ${model.name} updates`}
          subhead="Occasional updates on what's new in LTX 2.3 — new FP8 quants, LoRAs, IC-LoRA releases — with our hands-on verdict on whether they're worth re-downloading. No fixed cadence."
        />

        {/* Related models */}
        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-100">Related models</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/models/${r.id}`}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-violet-700/60 rounded-lg p-4 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">
                      {r.type}
                    </span>
                    <span className="text-gray-500">{r.size}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{r.vram}GB</span>
                  </div>
                  <p className="font-mono text-xs text-gray-200 break-all group-hover:text-violet-300 transition-colors">
                    {r.filename}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}

function GpuCompatibilityTable({
  vram,
  type,
}: {
  vram: number;
  type: ModelVariant["type"];
}) {
  const isFp8 = type === "fp8";
  const rows: { gpu: string; vramAmt: number; isRtx30: boolean; verdict: string }[] = [
    { gpu: "RTX 3060 12GB", vramAmt: 12, isRtx30: true },
    { gpu: "RTX 4060 Ti / 4070 (16GB)", vramAmt: 16, isRtx30: false },
    { gpu: "RTX 4070 Ti SUPER / 4080 (16GB)", vramAmt: 16, isRtx30: false },
    { gpu: "RTX 3090 (24GB)", vramAmt: 24, isRtx30: true },
    { gpu: "RTX 4090 (24GB)", vramAmt: 24, isRtx30: false },
    { gpu: "RTX 5090 / A6000 (32GB+)", vramAmt: 32, isRtx30: false },
  ].map((r) => {
    let verdict: string;
    if (r.vramAmt < vram) {
      verdict = "Insufficient VRAM";
    } else if (isFp8 && r.isRtx30) {
      verdict = "No FP8 support";
    } else if (r.vramAmt === vram) {
      verdict = "Tight fit";
    } else {
      verdict = "Comfortable";
    }
    return { ...r, verdict };
  });

  return (
    <div className="text-xs">
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-800 text-gray-500 font-medium">
        <span>GPU</span>
        <span>VRAM</span>
        <span>Verdict</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.gpu}
          className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-800/50 last:border-0"
        >
          <span className="text-gray-300">{r.gpu}</span>
          <span className="text-gray-500 font-mono">{r.vramAmt}GB</span>
          <span
            className={
              r.verdict === "Insufficient VRAM" || r.verdict === "No FP8 support"
                ? "text-red-400"
                : r.verdict === "Tight fit"
                ? "text-amber-400"
                : "text-emerald-400"
            }
          >
            {r.verdict}
          </span>
        </div>
      ))}
      {isFp8 && (
        <p className="text-amber-300/80 text-xs mt-3 bg-amber-900/10 border border-amber-700/30 rounded p-2">
          ⚠ FP8 scaled matmul requires RTX 40-series or newer (Ada Lovelace architecture). RTX 30xx cannot run this format — use the MXFP8 block-32 or BF16 variant instead.
        </p>
      )}
    </div>
  );
}

function buildTroubleshooting(
  model: ModelVariant
): { q: string; a: string }[] {
  const list: { q: string; a: string }[] = [];

  const installPathForTrouble = getInstallFolder(getModelCategory(model));
  list.push({
    q: "ComfyUI doesn't see the file after I downloaded it",
    a: `Make sure the file is in ${installPathForTrouble} (not a subfolder). Restart ComfyUI fully — the menu refresh sometimes misses new files. Filename must match exactly: ${model.filename}.`,
  });

  if (model.type === "fp8") {
    list.push({
      q: "I get a CUDA error mentioning fp8 / scaled / matmul",
      a: "FP8 scaled matmuls require an RTX 40-series GPU or newer (Ada Lovelace architecture). RTX 30-series and older cannot run FP8 weights at native precision. Use the BF16 variant instead, or the MXFP8 block-32 alternative.",
    });
  }

  list.push({
    q: "CUDA out of memory error when loading the model",
    a: `${model.filename} needs ~${model.vram}GB VRAM minimum. If you're hitting OOM:\n• Enable Sequential Offloading in ComfyUI settings\n• Lower the resolution (768×512 instead of 1280×704) — both dimensions must be divisible by 32\n• Reduce frame count (65 frames instead of 161) — must be 8n+1\n• Use a smaller variant — see Related models below.`,
  });

  if (model.type === "distilled") {
    list.push({
      q: "What CFG and step count should I use?",
      a: "Distilled models work best with CFG=1 and 8 sampling steps. Higher CFG or more steps with a distilled checkpoint produces over-saturated output and wastes time.",
    });
  } else if (model.type === "full") {
    list.push({
      q: "What CFG and step count should I use?",
      a: "The dev (full) model supports CFG guidance. Try CFG=3.5 with 20-30 steps for highest quality. For faster iteration use CFG=2.5 with 15 steps.",
    });
  }

  if (model.type === "lora") {
    list.push({
      q: "How do I apply this LoRA in ComfyUI?",
      a: `Load it in a 'LoraLoader' node and connect it after your model loader. Pair this LoRA with the dev base model (not the distilled one) for the right behavior. LoRA strength 1.0 is the trained value — start there.`,
    });
  }

  return list;
}

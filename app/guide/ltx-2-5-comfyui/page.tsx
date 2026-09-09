import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { MODELS, familyOf } from "@/lib/models";

export const metadata: Metadata = {
  title: "LTX 2.5 ComfyUI Setup Guide — Gated Repo Access, Gemma 4, Downloads (16-32GB)",
  description: "Install LTX 2.5 in ComfyUI: get access to the gated Lightricks/LTX-2.5 repo, download the transformer + Gemma 4 12B text encoder for your VRAM, and see exactly what changed from LTX 2.3 (no Kijai fork, no FP8, int8-convrot instead).",
  alternates: { canonical: "https://ltxworkflow.com/guide/ltx-2-5-comfyui" },
  openGraph: {
    title: "LTX 2.5 ComfyUI Setup Guide — Gated Access, Gemma 4, Downloads",
    description: "Step-by-step: accept the LTX 2.5 license, download the right transformer + Gemma 4 encoder for your VRAM, and see what's different from LTX 2.3.",
    url: "https://ltxworkflow.com/guide/ltx-2-5-comfyui",
    type: "article",
  },
};

const FOLDER: Record<string, string> = {
  "ltx25-dev-bf16": "ComfyUI/models/checkpoints/",
  "ltx25-dev-int8": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-bf16": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-int8": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-nvfp4": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-gguf-q3ks": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-gguf-q4km": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-gguf-q6k": "ComfyUI/models/checkpoints/",
  "ltx25-distilled-gguf-q8": "ComfyUI/models/checkpoints/",
  "ltx25-video-vae": "ComfyUI/models/vae/",
  "ltx25-video-vae-conv": "ComfyUI/models/vae/",
  "ltx25-audio-vae": "ComfyUI/models/vae/",
  "ltx25-gemma4-bf16": "ComfyUI/models/text_encoders/",
  "ltx25-gemma4-int8": "ComfyUI/models/text_encoders/",
  "ltx25-gemma4-gguf-q5km": "ComfyUI/models/text_encoders/",
  "ltx25-gemma4-gguf-q4km": "ComfyUI/models/text_encoders/",
  "ltx25-gemma4-gguf-q2k": "ComfyUI/models/text_encoders/",
  "ltx25-distilled-lora-450": "ComfyUI/models/loras/",
  "ltx25-spatial-upscaler-x2": "ComfyUI/models/latent_upscale_models/",
  "ltx25-temporal-upscaler-x2": "ComfyUI/models/latent_upscale_models/",
  "ltx25-duration-head": "ComfyUI/models/model_patches/",
  "ltx25-ic-lora-pixel-upscaler-x2": "ComfyUI/models/loras/",
};

const models25 = MODELS.filter((m) => familyOf(m) === "2.5");
const byId = (id: string) => models25.find((m) => m.id === id)!;

const transformerIds = [
  "ltx25-dev-bf16",
  "ltx25-dev-int8",
  "ltx25-distilled-bf16",
  "ltx25-distilled-int8",
  "ltx25-distilled-nvfp4",
  "ltx25-distilled-gguf-q3ks",
  "ltx25-distilled-gguf-q4km",
  "ltx25-distilled-gguf-q6k",
  "ltx25-distilled-gguf-q8",
];
const vaeIds = ["ltx25-video-vae", "ltx25-video-vae-conv", "ltx25-audio-vae"];
const encoderIds = ["ltx25-gemma4-bf16", "ltx25-gemma4-int8", "ltx25-gemma4-gguf-q5km", "ltx25-gemma4-gguf-q4km", "ltx25-gemma4-gguf-q2k"];
const optionalIds = [
  "ltx25-distilled-lora-450",
  "ltx25-spatial-upscaler-x2",
  "ltx25-temporal-upscaler-x2",
  "ltx25-duration-head",
  "ltx25-ic-lora-pixel-upscaler-x2",
];

function FileTable({ ids }: { ids: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
            <th className="py-2 pr-4 font-medium">File</th>
            <th className="py-2 pr-4 font-medium whitespace-nowrap">Size</th>
            <th className="py-2 pr-4 font-medium whitespace-nowrap">Target folder</th>
            <th className="py-2 font-medium whitespace-nowrap">Gated</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id) => {
            const m = byId(id);
            return (
              <tr key={id} className="border-b border-gray-800/60">
                <td className="py-2.5 pr-4">
                  <Link href={`/models/${m.id}`} className="text-emerald-300 hover:text-emerald-200">
                    <code className="text-xs break-all">{m.filename}</code>
                  </Link>
                </td>
                <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs whitespace-nowrap">{m.size}</td>
                <td className="py-2.5 pr-4 text-gray-300 font-mono text-xs whitespace-nowrap">{FOLDER[id]}</td>
                <td className="py-2.5 text-xs whitespace-nowrap">
                  {m.gated ? (
                    <span className="text-amber-400">🔒 Yes</span>
                  ) : (
                    <span className="text-emerald-400">No</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const differences = [
  "Text encoder is Gemma 4 12B, not Gemma 3 12B — and the projection layer is bundled into the same file. LTX 2.3 needed a separate ltx-2.3_text_projection_bf16.safetensors; LTX 2.5 does not.",
  "The official ComfyUI quant format is int8-convrot (filenames contain \"comfy\"), not FP8 scaled. There is no official FP8 build and no Kijai fork for LTX 2.5 — Lightricks/LTX-2.5 is the only official source.",
  "The smallest official text encoder is 15.37GB (Gemma 4 INT8) versus 9.5GB for LTX 2.3's Gemma 3 FP4. Combined with the smallest official transformer (18.72GB NVFP4 or 21.50GB INT8), an all-official pipeline needs well over 24GB — 16GB cards must use community GGUF files instead.",
  "A new duration-head model patch ships with LTX 2.5, with no LTX 2.3 equivalent — it belongs in ComfyUI/models/model_patches/.",
  "A second video VAE variant (video-vae-conv) ships alongside the standard video VAE, with no LTX 2.3 equivalent.",
  "The official distillation LoRA is rank 450, up from rank 384 in LTX 2.3.",
  "The Lightricks/LTX-2.5 repo is gated — you must sign in to HuggingFace and click \"Agree and Access\" before any file will download. LTX 2.3's repo is not gated.",
];

export default function LTX25ComfyUIGuidePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Install LTX 2.5 with ComfyUI",
            description: "Step-by-step guide to access the gated LTX 2.5 repo, download the transformer and Gemma 4 text encoder, and install LTX 2.5 in ComfyUI.",
            url: "https://ltxworkflow.com/guide/ltx-2-5-comfyui",
            step: [
              { "@type": "HowToStep", name: "Install ComfyUI", text: "Clone ComfyUI and install dependencies." },
              { "@type": "HowToStep", name: "Accept the LTX 2.5 license", text: "Sign in to HuggingFace and click Agree and Access on Lightricks/LTX-2.5." },
              { "@type": "HowToStep", name: "Download a transformer", text: "Pick BF16, INT8 convrot, NVFP4, or a community GGUF quant by VRAM." },
              { "@type": "HowToStep", name: "Download the required VAEs", text: "Video VAE, video VAE conv, and audio VAE go in models/vae/." },
              { "@type": "HowToStep", name: "Download the Gemma 4 12B text encoder", text: "Pick BF16, INT8 convrot, or a community GGUF quant (Q5_K_M / Q4_K_M / Q2_K) by VRAM." },
              { "@type": "HowToStep", name: "Download optional components", text: "Distillation LoRA, spatial/temporal upscalers, duration-head patch, IC-LoRA upscaler." },
            ],
          }),
        }}
      />
      <Nav activeHref="/guide" />

      <nav className="text-sm">
        <Link href="/guide" className="text-violet-400 hover:text-violet-300">← Setup Guide</Link>
      </nav>

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">LTX 2.5 ComfyUI Setup Guide</h1>
        <p className="text-gray-400">
          LTX 2.5 lives in a <strong className="text-gray-200">gated</strong> HuggingFace repo. Sign in and accept
          the license first, then pick a transformer and Gemma 4 text encoder for your VRAM. If you&apos;re on 16GB,
          the official files won&apos;t fit — you need the community GGUF path.
        </p>
      </section>

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">1. Install ComfyUI</h2>
          <p className="text-gray-400 text-sm">Clone the ComfyUI repository and install dependencies. Requires Python 3.10+ and a CUDA-capable GPU.</p>
          <pre className="bg-gray-950 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
{`git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
pip install -r requirements.txt`}
          </pre>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">2. Accept the LTX 2.5 license (gated repo)</h2>
          <p className="text-gray-400 text-sm">
            Every official LTX 2.5 file lives in{" "}
            <a href="https://huggingface.co/Lightricks/LTX-2.5" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              Lightricks/LTX-2.5
            </a>{" "}
            (license: <code className="text-xs text-emerald-300">ltx-2-community-license-agreement</code>), which is gated. Sign in to
            HuggingFace, open the repo, click &quot;Agree and Access,&quot; and only then will file downloads succeed —
            an anonymous download attempt returns 401. The separate IC-LoRA pixel upscaler repo is gated the same way.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">3. Download a transformer</h2>
          <p className="text-gray-400 text-sm">
            Pick one. Official BF16/INT8/NVFP4 files require sign-in from step 2; community GGUF quants (last four
            rows) are not gated but need the ComfyUI-GGUF custom node to load.
          </p>
          <FileTable ids={transformerIds} />
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">4. Download the required VAEs</h2>
          <p className="text-gray-400 text-sm">Video VAE decodes latents to frames; video VAE conv is a second variant shipped alongside it; audio VAE is for audio-video generation.</p>
          <FileTable ids={vaeIds} />
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">5. Download the Gemma 4 12B text encoder</h2>
          <p className="text-gray-400 text-sm">
            Every LTX 2.5 workflow needs one of these. The projection layer is bundled in, unlike LTX 2.3&apos;s
            separate text-projection file. On 16GB, only the GGUF quants fit alongside a GGUF transformer — Q5_K_M (9.51GB) for
            quality, Q4_K_M (8.41GB) when you want to step up the transformer quant, Q2_K (5.96GB) as a last resort.
          </p>
          <FileTable ids={encoderIds} />
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">6. Optional components</h2>
          <p className="text-gray-400 text-sm">Distillation LoRA, latent upscalers for two-stage pipelines, the duration-head patch, and the IC-LoRA pixel upscaler.</p>
          <FileTable ids={optionalIds} />
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">7. What&apos;s different from LTX 2.3</h2>
          <ul className="space-y-2 text-sm list-disc list-inside marker:text-violet-400">
            {differences.map((d) => (
              <li key={d} className="text-gray-300">{d}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">8. Loading a workflow</h2>
          <p className="text-gray-400 text-sm">
            We haven&apos;t independently verified specific ComfyUI node graphs or example workflow JSON filenames for
            LTX 2.5 yet, so we won&apos;t list any here and risk sending you after a file that doesn&apos;t exist.
            Check the file listing on the gated{" "}
            <a href="https://huggingface.co/Lightricks/LTX-2.5" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              Lightricks/LTX-2.5
            </a>{" "}
            repo and the{" "}
            <a href="https://github.com/Lightricks/ComfyUI-LTXVideo" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              ComfyUI-LTXVideo
            </a>{" "}
            node repo for the current example graphs, and confirm your node version explicitly supports LTX 2.5
            before wiring anything up. We&apos;ll add a verified workflow section here once we can confirm exact
            filenames.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-lg">Useful Links</h2>
        <ul className="space-y-2 text-sm">
          {[
            { label: "LTX 2.5 official repo (gated)", url: "https://huggingface.co/Lightricks/LTX-2.5" },
            { label: "IC-LoRA Pixel Spatial Upscaler (gated)", url: "https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler" },
            { label: "Abiray GGUF distilled quants", url: "https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF" },
            { label: "elix3r Gemma 4 GGUF encoder", url: "https://huggingface.co/elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF" },
            { label: "ComfyUI-GGUF custom node", url: "https://github.com/city96/ComfyUI-GGUF" },
          ].map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/guide/ltx-2-5-vram-requirements" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.5 VRAM Requirements →</p>
          <p className="text-xs text-gray-500 mt-0.5">Why 16GB needs the GGUF path, full quant table</p>
        </Link>
        <Link href="/models#ltx25-downloads" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.5 Model Downloads →</p>
          <p className="text-xs text-gray-500 mt-0.5">Every file, grouped by VRAM</p>
        </Link>
        <Link href="/guide" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
          <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.3 Setup Guide →</p>
          <p className="text-xs text-gray-500 mt-0.5">Still the deeper guide — IC-LoRAs, workflows, parameters</p>
        </Link>
      </div>

      <Footer />
    </main>
  );
}

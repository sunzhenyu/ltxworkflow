import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LTX 2.3 VRAM Requirements — Which GPU Do You Need?",
  description: "LTX 2.3 runs on 16 GB VRAM (RTX 4060 Ti / 4070) with FP8 quantization. Full BF16 requires 32 GB+. Detailed table of every checkpoint vs GPU.",
  alternates: { canonical: "https://ltxworkflow.com/guide/vram-requirements" },
  openGraph: {
    title: "LTX 2.3 VRAM Requirements — Which GPU Do You Need?",
    description: "LTX 2.3 runs on 16 GB VRAM with FP8. Full BF16 requires 32 GB+. Complete GPU compatibility table.",
    url: "https://ltxworkflow.com/guide/vram-requirements",
    type: "article",
  },
};

const LAST_UPDATED = "2025-05-13";

const checkpoints = [
  {
    file: "ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors",
    size: "25 GB",
    minVram: "16 GB",
    gpus: "RTX 4060 Ti, 4070, 4070 Ti, 4080",
    notes: "Requires RTX 40xx+ for FP8 matmul. Best default for 16 GB.",
    recommended: true,
  },
  {
    file: "ltx-2.3-22b-distilled-1.1_transformer_only_mxfp8_block32.safetensors",
    size: "~25 GB",
    minVram: "16 GB",
    gpus: "RTX 3080 / 3090 (RTX 30xx workaround)",
    notes: "MXFP8 block-32 — use when standard FP8 scaled is unsupported on your GPU.",
    recommended: false,
  },
  {
    file: "ltx-2.3-22b-dev_transformer_only_fp8_scaled.safetensors",
    size: "~25 GB",
    minVram: "16 GB",
    gpus: "RTX 4060 Ti, 4070, 4080",
    notes: "Dev model FP8 — use when you need LoRA support on 16 GB. Requires RTX 40xx+.",
    recommended: false,
  },
  {
    file: "ltx-2.3-22b-distilled-fp8.safetensors",
    size: "29.5 GB",
    minVram: "32 GB",
    gpus: "RTX 4090 (24 GB with offloading), A6000, H100",
    notes: "Official Lightricks FP8 distilled. Full checkpoint with embedded VAE and audio VAE.",
    recommended: true,
  },
  {
    file: "ltx-2.3-22b-dev-fp8.safetensors",
    size: "29.1 GB",
    minVram: "24 GB",
    gpus: "RTX 4090, A6000, H100",
    notes: "Official Lightricks FP8 dev. Use for quality/LoRA workflows on 24 GB+.",
    recommended: false,
  },
  {
    file: "ltx-2.3-22b-distilled-1.1.safetensors",
    size: "46.1 GB",
    minVram: "32 GB (offloading)",
    gpus: "A100 40 GB (with offloading), H100, A6000 48 GB",
    notes: "Official BF16 distilled. Requires sequential offloading on 32 GB — file is 46 GB. Best quality at full precision.",
    recommended: false,
  },
  {
    file: "ltx-2.3-22b-dev.safetensors",
    size: "~42 GB",
    minVram: "48 GB (or 32 GB + offloading)",
    gpus: "A100, H100, A6000 48 GB",
    notes: "Full BF16 dev. Use only for LoRA training. Sequential offloading required on 32 GB.",
    recommended: false,
  },
];

const gpuTable = [
  { gpu: "RTX 3060 12 GB", vram: "12 GB", verdict: "Not supported", note: "Insufficient VRAM for any LTX 2.3 checkpoint" },
  { gpu: "RTX 3080 10 GB", vram: "10 GB", verdict: "Not supported", note: "Insufficient VRAM" },
  { gpu: "RTX 3080 Ti / 3090 24 GB", vram: "24 GB", verdict: "Supported (MXFP8 only)", note: "Cannot run FP8 scaled — use mxfp8_block32 variant" },
  { gpu: "RTX 4060 Ti 16 GB", vram: "16 GB", verdict: "Supported", note: "FP8 scaled distilled — recommended starting point" },
  { gpu: "RTX 4070 / 4070 Ti 12 GB", vram: "12 GB", verdict: "Not supported", note: "12 GB variants insufficient; 16 GB SUPER variant works" },
  { gpu: "RTX 4070 SUPER / Ti SUPER 16 GB", vram: "16 GB", verdict: "Supported", note: "FP8 scaled distilled" },
  { gpu: "RTX 4080 16 GB", vram: "16 GB", verdict: "Supported", note: "FP8 scaled distilled or dev" },
  { gpu: "RTX 4090 24 GB", vram: "24 GB", verdict: "Supported", note: "FP8 distilled or dev-fp8 (29 GB needs slight offloading)" },
  { gpu: "RTX 5090 32 GB", vram: "32 GB", verdict: "Fully supported", note: "FP8 distilled resident, BF16 distilled with offloading" },
  { gpu: "A6000 48 GB", vram: "48 GB", verdict: "Fully supported", note: "All checkpoints including BF16 dev" },
  { gpu: "A100 40 GB", vram: "40 GB", verdict: "Supported", note: "BF16 distilled with offloading; FP8 dev resident" },
  { gpu: "H100 80 GB", vram: "80 GB", verdict: "Fully supported", note: "All checkpoints comfortably resident" },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the minimum VRAM to run LTX 2.3?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "16 GB VRAM is the minimum, using the FP8 quantized checkpoint (ltx-2.3-22b-distilled-1.1_transformer_only_fp8_scaled.safetensors, 25 GB file). This requires an RTX 40-series GPU (Ada Lovelace) for native FP8 matmul support. RTX 30xx users should use the MXFP8 block-32 variant instead.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I run LTX 2.3 on an RTX 3090?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, but not with the standard FP8 scaled checkpoint. The RTX 3090 has 24 GB VRAM but does not support FP8 scaled matmul (an RTX 40xx Ada Lovelace feature). Use the MXFP8 block-32 variant: ltx-2.3-22b-distilled-1.1_transformer_only_mxfp8_block32.safetensors.",
      },
    },
    {
      "@type": "Question",
      "name": "Does LTX 2.3 run on 8 GB or 12 GB VRAM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The smallest LTX 2.3 checkpoint is 25 GB and requires at least 16 GB VRAM to load (the remaining data is offloaded by ComfyUI's sequential offloading). 8 GB and 12 GB GPUs cannot run LTX 2.3.",
      },
    },
    {
      "@type": "Question",
      "name": "Do I need 32 GB VRAM for LTX 2.3?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. 16 GB VRAM is sufficient for the FP8 distilled checkpoint. 32 GB is needed only if you want to run the full BF16 checkpoints (46 GB distilled, 42 GB dev) — and even then, sequential offloading is required because the files exceed 32 GB.",
      },
    },
    {
      "@type": "Question",
      "name": "What is taeltx2_3.safetensors and where does it go?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "taeltx2_3.safetensors is the Tiny AutoEncoder VAE (Video AutoEncoder) required by all LTX 2.3 ComfyUI workflows. Without it, ComfyUI cannot decode the latent output to video frames. Place it in ComfyUI/models/vae/. Download from https://huggingface.co/Kijai/LTX2.3_comfy.",
      },
    },
  ],
};

export default function VramRequirementsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav activeHref="/guide" />

      <nav className="text-sm">
        <Link href="/guide" className="text-violet-400 hover:text-violet-300">← Setup Guide</Link>
      </nav>

      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">LTX 2.3 VRAM Requirements</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">16 GB VRAM is the minimum</strong> to run LTX 2.3, using the FP8 quantized distilled checkpoint (~25 GB file, loaded with ComfyUI sequential offloading). Full BF16 precision requires 48 GB+. RTX 40xx or newer is required for standard FP8; RTX 30xx users must use the MXFP8 block-32 variant.
          </p>
          <p className="text-xs text-gray-600">Last updated: {LAST_UPDATED}</p>
        </header>

        {/* Quick answer */}
        <section className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-bold">Quick answer by GPU</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">GPU</th>
                  <th className="py-2 pr-4 font-medium">VRAM</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {gpuTable.map((row) => (
                  <tr key={row.gpu} className="border-b border-gray-800/60">
                    <td className="py-2 pr-4 text-gray-200 font-medium whitespace-nowrap">{row.gpu}</td>
                    <td className="py-2 pr-4 text-gray-400 font-mono whitespace-nowrap">{row.vram}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        row.verdict === "Not supported" ? "bg-red-900/40 text-red-400" :
                        row.verdict === "Supported (MXFP8 only)" ? "bg-amber-900/40 text-amber-400" :
                        row.verdict === "Fully supported" ? "bg-emerald-900/40 text-emerald-400" :
                        "bg-violet-900/40 text-violet-300"
                      }`}>{row.verdict}</span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Checkpoint table */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">VRAM by checkpoint file</h2>
          <p className="text-sm text-gray-400">All LTX 2.3 checkpoint files and their minimum VRAM requirements.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">File</th>
                  <th className="py-2 pr-4 font-medium whitespace-nowrap">File size</th>
                  <th className="py-2 pr-4 font-medium whitespace-nowrap">Min VRAM</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {checkpoints.map((row) => (
                  <tr key={row.file} className="border-b border-gray-800/60">
                    <td className="py-2.5 pr-4">
                      <code className="text-xs text-emerald-300 break-all">{row.file}</code>
                      {row.recommended && (
                        <span className="ml-2 text-xs bg-violet-700 text-violet-100 px-1.5 py-0.5 rounded-full">Recommended</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs whitespace-nowrap">{row.size}</td>
                    <td className="py-2.5 pr-4 text-gray-300 text-xs whitespace-nowrap font-semibold">{row.minVram}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Frequently asked questions</h2>
          <div className="space-y-2">
            {faqSchema.mainEntity.map((item) => (
              <details key={item.name} className="bg-gray-900 rounded-lg p-4 group">
                <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3">▼</span>
                </summary>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{item.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/models" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
            <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Download Models →</p>
            <p className="text-xs text-gray-500 mt-0.5">Direct links for every checkpoint</p>
          </Link>
          <Link href="/guide" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
            <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Setup Guide →</p>
            <p className="text-xs text-gray-500 mt-0.5">Step-by-step ComfyUI installation</p>
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LTX 2.5 VRAM Requirements — Why 16GB Needs the Community GGUF Path",
  description: "LTX 2.5's official files alone need 24GB+ VRAM (INT8/NVFP4 transformer + Gemma 4 encoder). 16GB cards must use community GGUF quants instead. Full quant table across every known LTX 2.5 GGUF repo.",
  alternates: { canonical: "https://ltxworkflow.com/guide/ltx-2-5-vram-requirements" },
  openGraph: {
    title: "LTX 2.5 VRAM Requirements — Why 16GB Needs GGUF",
    description: "Official LTX 2.5 files need 24GB+. Here's every GGUF quant that gets it down to 16GB.",
    url: "https://ltxworkflow.com/guide/ltx-2-5-vram-requirements",
    type: "article",
  },
};

const LAST_UPDATED = "2026-08-26";

const officialCombos = [
  { transformer: "NVFP4 distilled — 18.72 GB", encoder: "INT8 convrot Gemma 4 — 15.37 GB", total: "≈ 34.09 GB", minVram: "24 GB (tight) / 32 GB comfortable" },
  { transformer: "INT8 convrot distilled — 21.50 GB", encoder: "INT8 convrot Gemma 4 — 15.37 GB", total: "≈ 36.87 GB", minVram: "32 GB" },
  { transformer: "BF16 distilled — 42.02 GB", encoder: "BF16 Gemma 4 — 26.26 GB", total: "≈ 68.28 GB", minVram: "48 GB, or 32 GB with heavy offloading" },
];

const gpuTable = [
  { gpu: "16 GB (RTX 4060 Ti, 4070, 4080)", verdict: "GGUF only", note: "No official combination fits — use the community GGUF transformer + GGUF Gemma 4 encoder below" },
  { gpu: "24 GB (RTX 3090, 4090)", verdict: "Official INT8/NVFP4, or GGUF Q6_K/Q8_0", note: "Smallest official combo (NVFP4 + INT8 Gemma 4) is tight at 24GB; GGUF Q6_K/Q8_0 leaves more headroom" },
  { gpu: "32 GB (RTX 5090)", verdict: "Official INT8/NVFP4 comfortably, BF16 with offloading", note: "NVFP4 gets native matmul speedups on Blackwell" },
  { gpu: "48 GB+ (A6000, A100, H100)", verdict: "Official BF16 full precision", note: "Full transformer + full Gemma 4 encoder resident, no offloading needed" },
];

const ggufQuants = [
  { file: "LTX-2.5-Distilled-Q3_K_S.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "12.65 GB", onSite: "ltx25-distilled-gguf-q3ks" },
  { file: "LTX-2.5-Distilled-Q3_K_M.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "12.92 GB", onSite: null },
  { file: "LTX-2.5-Distilled-Q4_K_S.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "15.33 GB", onSite: null },
  { file: "LTX-2.5-Distilled-Q4_K_M.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "15.69 GB", onSite: "ltx25-distilled-gguf-q4km" },
  { file: "LTX-2.5-Distilled-Q5_K_M.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "18.12 GB", onSite: null },
  { file: "LTX-2.5-Distilled-Q6_K.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "18.62 GB", onSite: "ltx25-distilled-gguf-q6k" },
  { file: "LTX-2.5-Distilled-Q8_0.gguf", repo: "Abiray/LTX-2.5-Distilled-GGUF", size: "23.60 GB", onSite: "ltx25-distilled-gguf-q8" },
  { file: "gemma4-12b-with-proj-ltx-2.5-Q5_K_M.gguf", repo: "elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF", size: "9.51 GB", onSite: "ltx25-gemma4-gguf-q5km" },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the minimum VRAM to run LTX 2.5?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "16 GB VRAM, but only via community GGUF quants — the LTX-2.5-Distilled-Q3_K_S/Q4_K_M GGUF transformer plus the gemma4-12b-with-proj-ltx-2.5-Q5_K_M GGUF text encoder (9.51 GB). None of the official Lightricks/LTX-2.5 files fit a 16 GB card once you add the required Gemma 4 encoder.",
      },
    },
    {
      "@type": "Question",
      name: "Why doesn't LTX 2.5 fit on 16GB like LTX 2.3 does?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LTX 2.5's smallest official text encoder (Gemma 4 12B INT8 convrot) is 15.37 GB, versus 9.5 GB for LTX 2.3's Gemma 3 FP4 encoder. Paired with the smallest official transformer (18.72 GB NVFP4 or 21.50 GB INT8 convrot), the combined official minimum is roughly 34 GB — well past 16 GB, and past 24 GB too.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to sign in to HuggingFace to download LTX 2.5?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For the official files, yes. The Lightricks/LTX-2.5 repo is gated: you must be signed in to HuggingFace and click \"Agree and Access\" before any download link works. The community GGUF quants (Abiray, elix3r) are not gated.",
      },
    },
    {
      "@type": "Question",
      name: "What's the recommended LTX 2.5 setup for 24GB VRAM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The official NVFP4 distilled transformer (18.72 GB) plus the official INT8 convrot Gemma 4 encoder (15.37 GB) is the smallest all-official combination, though it's tight at exactly 24 GB. The community GGUF Q6_K (18.62 GB) or Q8_0 (23.60 GB) transformer paired with the GGUF Gemma 4 encoder leaves more headroom.",
      },
    },
  ],
};

export default function LTX25VramRequirementsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Nav activeHref="/guide" />

      <nav className="text-sm">
        <Link href="/guide" className="text-violet-400 hover:text-violet-300">← Setup Guide</Link>
      </nav>

      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">LTX 2.5 VRAM Requirements</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">No official LTX 2.5 checkpoint fits 16 GB.</strong> The smallest official
            transformer plus the smallest official Gemma 4 text encoder already add up to roughly 34 GB. 16 GB cards
            need the community GGUF transformer and GGUF Gemma 4 encoder instead — this page has the full quant
            table.
          </p>
          <p className="text-xs text-gray-600">Last updated: {LAST_UPDATED}</p>
        </header>

        <section className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-bold">Quick answer by VRAM tier</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">VRAM</th>
                  <th className="py-2 pr-4 font-medium">Path</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {gpuTable.map((row) => (
                  <tr key={row.gpu} className="border-b border-gray-800/60">
                    <td className="py-2 pr-4 text-gray-200 font-medium whitespace-nowrap">{row.gpu}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          row.verdict === "GGUF only"
                            ? "bg-amber-900/40 text-amber-400"
                            : row.verdict.startsWith("Official BF16")
                            ? "bg-emerald-900/40 text-emerald-400"
                            : "bg-violet-900/40 text-violet-300"
                        }`}
                      >
                        {row.verdict}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Why official files don&apos;t fit 16 GB (or even 24 GB, comfortably)</h2>
          <p className="text-sm text-gray-400">Every LTX 2.5 workflow needs one transformer plus one Gemma 4 text encoder. Here's what the smallest official combinations actually add up to.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">Transformer</th>
                  <th className="py-2 pr-4 font-medium">Text encoder</th>
                  <th className="py-2 pr-4 font-medium whitespace-nowrap">Combined</th>
                  <th className="py-2 font-medium whitespace-nowrap">Practical min VRAM</th>
                </tr>
              </thead>
              <tbody>
                {officialCombos.map((row) => (
                  <tr key={row.transformer} className="border-b border-gray-800/60">
                    <td className="py-2.5 pr-4 text-gray-300 text-xs">{row.transformer}</td>
                    <td className="py-2.5 pr-4 text-gray-300 text-xs">{row.encoder}</td>
                    <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs whitespace-nowrap">{row.total}</td>
                    <td className="py-2.5 text-gray-200 text-xs font-semibold whitespace-nowrap">{row.minVram}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Figures are the sum of the two required files' on-disk sizes, not a measured runtime footprint — ComfyUI
            offloading changes actual peak usage, but the gap to 16GB (or even 24GB) is large enough that offloading
            alone doesn't close it. This is why the official <code className="text-emerald-300">int8-convrot</code>{" "}
            checkpoints are tagged for 24GB+ on this site rather than 16GB.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">The community GGUF path (16 GB+)</h2>
          <p className="text-sm text-gray-400">
            Not gated, and small enough for 16 GB when paired with the GGUF Gemma 4 encoder. Requires the{" "}
            <a href="https://github.com/city96/ComfyUI-GGUF" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              ComfyUI-GGUF
            </a>{" "}
            custom node to load. Rows with a page on this site link to their download page; the rest link straight to
            HuggingFace.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">File</th>
                  <th className="py-2 pr-4 font-medium whitespace-nowrap">Size</th>
                  <th className="py-2 font-medium whitespace-nowrap">Repo</th>
                </tr>
              </thead>
              <tbody>
                {ggufQuants.map((row) => (
                  <tr key={row.file} className="border-b border-gray-800/60">
                    <td className="py-2.5 pr-4">
                      {row.onSite ? (
                        <Link href={`/models/${row.onSite}`} className="text-emerald-300 hover:text-emerald-200">
                          <code className="text-xs break-all">{row.file}</code>
                        </Link>
                      ) : (
                        <code className="text-xs text-emerald-300 break-all">{row.file}</code>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs whitespace-nowrap">{row.size}</td>
                    <td className="py-2.5 text-xs whitespace-nowrap">
                      <a
                        href={`https://huggingface.co/${row.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        {row.repo}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Two more community repos publish LTX 2.5 GGUF quants we haven&apos;t built individual pages for:{" "}
            <a href="https://huggingface.co/realrebelai/LTX-2.5_GGUFs" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              realrebelai/LTX-2.5_GGUFs
            </a>{" "}
            (includes a Q2_K at 8.83 GB, the smallest known LTX 2.5 quant) and{" "}
            <a href="https://huggingface.co/vantagewithai/LTX-2.5-GGUF" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              vantagewithai/LTX-2.5-GGUF
            </a>{" "}
            (dev and distilled quant sets). Check each repo's file listing directly for the current set of quants.
          </p>
        </section>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/guide/ltx-2-5-comfyui" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
            <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.5 ComfyUI Setup →</p>
            <p className="text-xs text-gray-500 mt-0.5">Gated repo access, full file list, install folders</p>
          </Link>
          <Link href="/models#ltx25-downloads" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
            <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.5 Model Downloads →</p>
            <p className="text-xs text-gray-500 mt-0.5">Every file, grouped by VRAM</p>
          </Link>
          <Link href="/guide/vram-requirements" className="bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors group">
            <p className="text-sm font-medium text-violet-400 group-hover:text-violet-300">LTX 2.3 VRAM Requirements →</p>
            <p className="text-xs text-gray-500 mt-0.5">Fits in 16GB — the older, still-supported model</p>
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}

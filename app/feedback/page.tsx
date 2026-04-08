import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Feedback — ltx workflow",
  description: "Send feedback, report issues, or suggest features for ltx workflow.",
  alternates: { canonical: "https://ltxworkflow.com/feedback" },
};

export default function FeedbackPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Feedback</h1>
        <p className="text-gray-400">Found a bug, have a suggestion, or want to report inaccurate model info? We'd love to hear from you.</p>
      </section>

      <div className="space-y-4">
        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold">GitHub Issues</h2>
          <p className="text-sm text-gray-400">Report bugs or request features on GitHub. This is the fastest way to get a response.</p>
          <a href="https://github.com/sunzhenyu/ltxworkflow/issues/new" target="_blank" rel="noopener noreferrer"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Open an Issue on GitHub →
          </a>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <h2 className="font-bold">Inaccurate Model Info?</h2>
          <p className="text-sm text-gray-400">
            All model data is sourced from official repositories. If you spot an error, please check against:
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Lightricks LTX-2.3 (official)", url: "https://huggingface.co/Lightricks/LTX-2.3" },
              { label: "ComfyUI-LTXVideo (official nodes)", url: "https://github.com/Lightricks/ComfyUI-LTXVideo" },
              { label: "Kijai FP8 models", url: "https://huggingface.co/Kijai/LTX2.3_comfy" },
            ].map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                  {l.label} →
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-2">
          <h2 className="font-bold">Disclaimer</h2>
          <p className="text-sm text-gray-500">ltx workflow is not affiliated with Lightricks. LTX-2.3 is an open-source model by Lightricks released under the LTX Video License.</p>
        </div>
      </div>
    </main>
  );
}

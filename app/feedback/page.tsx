import type { Metadata } from "next";
import Nav from "@/components/Nav";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback — ltx workflow",
  description: "Send feedback or report issues for ltx workflow.",
  alternates: { canonical: "https://ltxworkflow.com/feedback" },
};

export default function FeedbackPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/feedback" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Feedback</h1>
        <p className="text-gray-400">Found a bug or have a suggestion? Submit below or email us directly.</p>
      </section>

      <div className="bg-gray-900 rounded-xl p-5">
        <FeedbackForm />
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-2">
        <h2 className="font-bold">Email Us</h2>
        <p className="text-sm text-gray-400">Prefer email? Reach us at:</p>
        <a href="mailto:kuyadan136@gmail.com" className="text-violet-400 hover:text-violet-300 text-sm">
          kuyadan136@gmail.com
        </a>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-2">
        <h2 className="font-bold">Inaccurate Model Info?</h2>
        <p className="text-sm text-gray-400">All model data is sourced from official repositories:</p>
        <ul className="space-y-1 text-sm">
          {[
            { label: "Lightricks LTX 2.3 (official)", url: "https://huggingface.co/Lightricks/LTX-2.3" },
            { label: "ComfyUI-LTXVideo (official nodes)", url: "https://github.com/Lightricks/ComfyUI-LTXVideo" },
            { label: "Kijai FP8 models", url: "https://huggingface.co/Kijai/LTX2.3_comfy" },
          ].map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">{l.label} →</a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

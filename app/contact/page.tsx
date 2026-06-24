import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact & About — ltx workflow",
  description:
    "About ltxworkflow.com and how to get in touch. Questions, feedback, or support for LTX 2.3 model downloads, ComfyUI workflows, and online image-to-video.",
  alternates: { canonical: "https://ltxworkflow.com/contact" },
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-6">
        <h1 className="text-3xl font-extrabold">Contact &amp; About</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">About ltx workflow</h2>
          <p className="text-gray-400 leading-relaxed">
            ltxworkflow.com is an independent hub for the LTX 2.3 video model. We
            help creators match the right model to their GPU, find the correct
            ComfyUI model files and workflow templates, and run image-to-video
            online without a local GPU. The site is maintained by a small,
            independent team and is not affiliated with Lightricks.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Get in touch</h2>
          <p className="text-gray-400 leading-relaxed">
            Questions, feedback, partnership inquiries, or support requests are
            welcome. We read every message and aim to reply within a couple of
            business days.
          </p>
          <p className="text-gray-300">
            Email:{" "}
            <a
              href="mailto:support@ltxworkflow.com"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              support@ltxworkflow.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

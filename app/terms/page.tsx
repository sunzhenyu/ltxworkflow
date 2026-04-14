import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — ltx workflow",
  description: "Terms of service for ltxworkflow.com. Rules and guidelines for using our service.",
  alternates: { canonical: "https://ltxworkflow.com/terms" },
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: April 14, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-100">Acceptance of Terms</h2>
            <p className="text-gray-400">
              By accessing and using ltxworkflow.com, you accept and agree to be bound by these Terms of Service.
              If you do not agree, do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Service Description</h2>
            <p className="text-gray-400">
              ltxworkflow.com provides tools for generating ComfyUI workflow JSON files for LTX 2.3 video generation models.
              We also provide model download links, setup guides, and AI-powered prompt enhancement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">User Responsibilities</h2>
            <p className="text-gray-400">You agree to:</p>
            <ul className="text-gray-400 space-y-1">
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to disrupt or compromise the service</li>
              <li>Not use automated tools to scrape or abuse the service</li>
              <li>Respect intellectual property rights of content creators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Content and Intellectual Property</h2>
            <p className="text-gray-400">
              Workflows you create using our tools belong to you. We do not claim ownership of your generated content.
              However, we may store your workflows in the cloud if you choose to save them.
            </p>
            <p className="text-gray-400">
              LTX 2.3 models are provided by Lightricks under their respective licenses. We are not affiliated with Lightricks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Disclaimer of Warranties</h2>
            <p className="text-gray-400">
              The service is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="text-gray-400 space-y-1">
              <li>Uninterrupted or error-free operation</li>
              <li>Accuracy of generated workflows or model information</li>
              <li>Compatibility with all ComfyUI versions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Limitation of Liability</h2>
            <p className="text-gray-400">
              We are not liable for any damages arising from your use of the service, including but not limited to:
              data loss, workflow errors, or issues with generated videos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Third-Party Links</h2>
            <p className="text-gray-400">
              Our service contains links to third-party websites (HuggingFace, GitHub, etc.). We are not responsible
              for the content or practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Changes to Terms</h2>
            <p className="text-gray-400">
              We may update these Terms of Service at any time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Contact</h2>
            <p className="text-gray-400">
              For questions about these terms, contact us via the <a href="/feedback" className="text-violet-400 hover:text-violet-300 underline">Feedback</a> page.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — ltx workflow",
  description: "Privacy policy for ltxworkflow.com. How we collect, use, and protect your data.",
  alternates: { canonical: "https://ltxworkflow.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Nav />

      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: April 14, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-100">Information We Collect</h2>
            <p className="text-gray-400">
              When you use ltxworkflow.com, we may collect:
            </p>
            <ul className="text-gray-400 space-y-1">
              <li>Account information (email, name) when you sign in via Google OAuth or email/password</li>
              <li>Workflow data you save to the cloud (stored in Supabase)</li>
              <li>Usage analytics via Google Analytics (page views, session duration)</li>
              <li>Cookies for authentication and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">How We Use Your Information</h2>
            <ul className="text-gray-400 space-y-1">
              <li>To provide and improve our services</li>
              <li>To authenticate your account and save your workflows</li>
              <li>To analyze site usage and optimize user experience</li>
              <li>To display relevant advertisements via Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Third-Party Services</h2>
            <p className="text-gray-400">We use the following third-party services:</p>
            <ul className="text-gray-400 space-y-1">
              <li><strong className="text-gray-300">Google OAuth</strong> — for authentication</li>
              <li><strong className="text-gray-300">Supabase</strong> — for cloud workflow storage</li>
              <li><strong className="text-gray-300">Google Analytics</strong> — for usage analytics</li>
              <li><strong className="text-gray-300">Google AdSense</strong> — for advertisements</li>
              <li><strong className="text-gray-300">yunwu.ai</strong> — for AI prompt enhancement</li>
            </ul>
            <p className="text-gray-400">
              These services have their own privacy policies. We do not control their data practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Data Security</h2>
            <p className="text-gray-400">
              We use industry-standard security measures to protect your data. However, no method of transmission
              over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Your Rights</h2>
            <p className="text-gray-400">You have the right to:</p>
            <ul className="text-gray-400 space-y-1">
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of analytics tracking (via browser settings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-100">Contact</h2>
            <p className="text-gray-400">
              For privacy-related questions, contact us via the <a href="/feedback" className="text-violet-400 hover:text-violet-300 underline">Feedback</a> page.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

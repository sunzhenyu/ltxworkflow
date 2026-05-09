import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { getBalance, WELCOME_CREDITS } from "@/lib/credits";
import Generator from "./Generator";

export const metadata: Metadata = {
  title: "LTX 2.3 Image-to-Video Generator — Free Online, No GPU",
  description: `Animate any image with LTX 2.3 online — no GPU or ComfyUI needed. Official Lightricks weights: Fast, Pro, and 22B models. Get ${WELCOME_CREDITS} free credits at signup.`,
  alternates: { canonical: "https://ltxworkflow.com/generate" },
  openGraph: {
    title: "LTX 2.3 Image-to-Video Generator — Free, No GPU",
    description: `Animate any image with LTX 2.3 online. Official Lightricks weights, Fast/Pro/22B. ${WELCOME_CREDITS} free credits at signup.`,
    url: "https://ltxworkflow.com/generate",
    type: "website",
  },
};

export default async function GeneratePage() {
  const session = await auth();

  if (!session?.user?.email) {
    return <SignedOutPitch />;
  }

  let balance = 0;
  try {
    balance = await getBalance(session.user.email);
  } catch (e) {
    console.error("[/generate] balance load failed:", e);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/generate" />

      <header className="space-y-3 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          LTX 2.3 Image-to-Video Generator —{" "}
          <span className="text-violet-400">no GPU, no ComfyUI install</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg leading-relaxed">
          Animate any photo with the official Lightricks LTX 2.3 weights — powered by Fast,
          Pro, and the new <span className="text-amber-300">22B</span> models. Upload an
          image, describe the motion, get a cinematic 1080p video in ~30 seconds. Free trial
          credits included, no card required.
        </p>
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">✓ No 16GB+ GPU needed</span>
          <span className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">✓ Official LTX 2.3 weights</span>
          <span className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">✓ 4 model variants incl. 22B</span>
          <span className="bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full">✓ {WELCOME_CREDITS} free credits</span>
        </div>
      </header>

      <Generator initialBalance={balance} />

      <Footer />
    </main>
  );
}

function SignedOutPitch() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <Nav activeHref="/generate" />

      <section className="text-center space-y-4 pt-4">
        <span className="inline-block bg-amber-700/30 border border-amber-600/50 text-amber-200 text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wide">
          {WELCOME_CREDITS} free credits at signup
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Run LTX 2.3 in your browser.
          <br />
          <span className="text-violet-400">No GPU. No setup. No ComfyUI.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Upload an image, type a prompt, get a video — using the same LTX 2.3 weights you&apos;d
          download. Sign up and get {WELCOME_CREDITS} free credits — one full LTX 2.3 Fast
          generation, no card required.
        </p>
        <div className="flex gap-3 justify-center pt-4 flex-wrap">
          <Link
            href="/sign-in"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Sign in — claim {WELCOME_CREDITS} free credits
          </Link>
          <Link
            href="/models"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Or download models for ComfyUI
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">How to generate a video in 3 steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard step="1" title="Upload your image" body="Drop any photo, illustration, or AI-generated still. JPG, PNG, WebP all work." />
          <StepCard step="2" title="Describe the motion" body="Type a short prompt — 'camera slowly pushes in, leaves rustle in the wind'. Use our AI suggestions if you're stuck." />
          <StepCard step="3" title="Download your video" body="LTX 2.3 generates a 1080p clip in ~30 seconds. Download it or watch it directly in the browser." />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Why use LTX Workflow online?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueCard
            title="No GPU required"
            body="Skip the 16GB+ VRAM card and the 4-hour ComfyUI setup. Generate a 5-second clip in ~30 seconds from any device."
          />
          <ValueCard
            title="Same weights, presets done"
            body="Powered by the real LTX 2.3 i2v Fast model. We've already tuned the parameters so you don't have to."
          />
          <ValueCard
            title="Image-to-video first"
            body="LTX 2.3 is exceptional at animating still images — product shots, illustrations, AI-generated stills. That's what we ship first."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          <Faq q="What do I get for signing up?">
            {WELCOME_CREDITS} free credits, no card needed. 1 credit = 1 second of 1080p Fast
            video, so {WELCOME_CREDITS} credits cover one full LTX 2.3 Fast generation
            (6 or 8 seconds). After that, top up from $4.99.
          </Faq>
          <Faq q="How much will it cost after the free credits?">
            Pay-as-you-go credit packs starting at $4.99 (60 credits) or monthly subscriptions
            from $9.99/mo (150 credits). Higher resolutions and the slower-but-higher-quality
            standard variant cost more credits per second.
          </Faq>
          <Faq q="Can I still download the .safetensors files for local ComfyUI?">
            Yes. The model download pages and ComfyUI workflows aren&apos;t going anywhere — they&apos;re
            free and stay free. Online generation is the option for people who don&apos;t want to run
            it locally.
          </Faq>
          <Faq q="Which LTX 2.3 variant powers the online generator?">
            LTX 2.3 Fast at 1080p — the best speed/quality tradeoff. Higher resolutions and the
            slower-but-higher-quality standard variant will cost more credits per second.
          </Faq>
          <Faq q="What about text-to-video?">
            Image-to-video ships first because it&apos;s LTX&apos;s strongest mode. Text-to-video follows
            in a future release.
          </Faq>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
      <div className="text-xs text-violet-400 font-bold uppercase tracking-wide">Step {step}</div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-gray-900 rounded-lg p-5 group">
      <summary className="cursor-pointer list-none flex items-center justify-between">
        <h3 className="font-semibold text-white text-base">{q}</h3>
        <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2">▼</span>
      </summary>
      <div className="text-gray-400 text-sm mt-3 leading-relaxed">{children}</div>
    </details>
  );
}

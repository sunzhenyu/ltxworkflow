import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { getProStatus } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "LTX 2.3 Production Workflow Pack — Scene-Specific ComfyUI Workflows",
  description:
    "Production-tested LTX 2.3 ComfyUI workflows for talking head, b-roll, product spin, motion control, cinematic transitions. VRAM-tagged, prompt-templated, with reference videos.",
  alternates: { canonical: "https://ltxworkflow.com/pack" },
};

type PackItem = {
  id: string;
  slug: string;
  name: string;
  scene_category: string;
  description: string;
  min_vram_gb: number;
  recommended_vram_gb: number | null;
  difficulty: string;
  preview_image_url: string | null;
  preview_video_url: string | null;
  is_premium: boolean;
};

async function getPacks(): Promise<PackItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workflow_packs")
    .select(
      "id, slug, name, scene_category, description, min_vram_gb, recommended_vram_gb, difficulty, preview_image_url, preview_video_url, is_premium"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return (data as PackItem[]) || [];
}

export default async function PackPage() {
  const [packs, pro] = await Promise.all([getPacks(), getProStatus()]);

  const free = packs.filter((p) => !p.is_premium);
  const premium = packs.filter((p) => p.is_premium);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <Nav activeHref="/pack" />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-violet-700 text-violet-100 text-xs px-2 py-0.5 rounded-full font-medium">
            Pro Pack
          </span>
          {pro.isPro && (
            <span className="bg-emerald-700/40 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">
              ✓ Pro access active
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold">LTX 2.3 Production Workflow Pack</h1>
        <p className="text-gray-400 max-w-3xl">
          Scene-specific ComfyUI workflows we&apos;ve tested end-to-end. Each one ships with a
          fixed seed, prompt template, parameter notes, and a reference video so you know
          exactly what to expect before you queue a job. VRAM tagged so you only download
          what your GPU can actually run.
        </p>
        {!pro.isPro && (
          <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/50 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm">
              <p className="text-white font-semibold">Get every workflow + new ones each week</p>
              <p className="text-violet-200">Skip the trial-and-error. Pay once, save hours.</p>
            </div>
            <Link
              href="/pricing"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              See pricing →
            </Link>
          </div>
        )}
      </section>

      {free.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Free samples</h2>
            <p className="text-sm text-gray-500">A taste of what&apos;s in the pack.</p>
          </div>
          <PackGrid packs={free} unlocked={true} />
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Pro workflows</h2>
          <p className="text-sm text-gray-500">
            {pro.isPro
              ? "Click any workflow to view details and download."
              : "Preview is open. Downloads unlock with Pro."}
          </p>
        </div>
        {premium.length > 0 ? (
          <PackGrid packs={premium} unlocked={pro.isPro} />
        ) : (
          <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-400">
            <p className="font-medium text-gray-300">First Pro workflows arriving soon.</p>
            <p className="text-sm mt-1">
              We&apos;re calibrating production-grade scenes (talking head, b-roll, product spin,
              motion control). Drop us a line at /feedback if you have a scene request.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function PackGrid({ packs, unlocked }: { packs: PackItem[]; unlocked: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {packs.map((p) => (
        <Link
          key={p.id}
          href={`/pack/${p.slug}`}
          className="bg-gray-900 hover:bg-gray-800 rounded-xl overflow-hidden border border-gray-800 hover:border-violet-700/60 transition-colors group"
        >
          <div className="aspect-video bg-gray-950 relative overflow-hidden">
            {p.preview_video_url ? (
              <video
                src={p.preview_video_url}
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover"
                poster={p.preview_image_url || undefined}
              />
            ) : p.preview_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.preview_image_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                Preview coming soon
              </div>
            )}
            {p.is_premium && !unlocked && (
              <div className="absolute top-2 right-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Pro
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                {p.scene_category}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{p.min_vram_gb}GB+ VRAM</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 capitalize">{p.difficulty}</span>
            </div>
            <h3 className="font-bold text-gray-100 group-hover:text-violet-300 transition-colors">
              {p.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

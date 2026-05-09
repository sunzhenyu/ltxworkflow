import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { getProStatus } from "@/lib/subscription";
import PackDownloadButton from "@/components/PackDownloadButton";

type PackItem = {
  id: string;
  slug: string;
  name: string;
  scene_category: string;
  description: string;
  use_case: string | null;
  workflow_json: unknown;
  prompt_template: string | null;
  negative_prompt: string | null;
  min_vram_gb: number;
  recommended_vram_gb: number | null;
  compatible_models: string[] | null;
  required_files: string[] | null;
  difficulty: string;
  generation_steps: number | null;
  cfg_scale: number | null;
  preview_image_url: string | null;
  preview_video_url: string | null;
  is_premium: boolean;
};

async function getPack(slug: string): Promise<PackItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workflow_packs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return (data as PackItem) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = await getPack(slug);
  if (!pack) return { title: "Workflow Not Found" };
  return {
    title: `${pack.name} — LTX 2.3 ${pack.scene_category} Workflow`,
    description: pack.description,
    alternates: { canonical: `https://ltxworkflow.com/pack/${pack.slug}` },
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pack, pro] = await Promise.all([getPack(slug), getProStatus()]);
  if (!pack) notFound();

  const locked = pack.is_premium && !pro.isPro;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/pack" />

      <article className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/pack" className="text-violet-400 hover:text-violet-300">
              ← Pro Pack
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {pack.scene_category}
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {pack.min_vram_gb}GB+ VRAM
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full capitalize">
              {pack.difficulty}
            </span>
            {pack.is_premium && (
              <span className="bg-violet-700 text-violet-100 text-xs px-2 py-0.5 rounded-full font-medium">
                Pro
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-100">{pack.name}</h1>
          <p className="text-lg text-gray-400">{pack.description}</p>
        </header>

        {(pack.preview_video_url || pack.preview_image_url) && (
          <div className="rounded-xl overflow-hidden bg-gray-950 aspect-video">
            {pack.preview_video_url ? (
              <video
                src={pack.preview_video_url}
                controls
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster={pack.preview_image_url || undefined}
              />
            ) : pack.preview_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pack.preview_image_url}
                alt={pack.name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        )}

        <section className="bg-gray-900 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold">Download</h2>
          {locked ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                This workflow is part of the Pro Pack. Unlock it with a Pro plan or one-time
                purchase.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                See pricing →
              </Link>
            </div>
          ) : (
            <PackDownloadButton
              slug={pack.slug}
              workflowJson={pack.workflow_json}
              filename={`ltx23_${pack.slug.replace(/-/g, "_")}.json`}
            />
          )}
        </section>

        {pack.use_case && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Use case</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{pack.use_case}</p>
          </section>
        )}

        {(pack.prompt_template || pack.negative_prompt) && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Prompt template</h2>
            {pack.prompt_template && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Positive prompt</p>
                <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap font-mono">
                  {pack.prompt_template}
                </pre>
              </div>
            )}
            {pack.negative_prompt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Negative prompt</p>
                <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-400 whitespace-pre-wrap font-mono">
                  {pack.negative_prompt}
                </pre>
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-2 gap-4">
          <Spec label="Min VRAM" value={`${pack.min_vram_gb} GB`} />
          {pack.recommended_vram_gb && (
            <Spec label="Recommended VRAM" value={`${pack.recommended_vram_gb} GB`} />
          )}
          {pack.generation_steps !== null && (
            <Spec label="Steps" value={String(pack.generation_steps)} />
          )}
          {pack.cfg_scale !== null && (
            <Spec label="CFG Scale" value={String(pack.cfg_scale)} />
          )}
        </section>

        {pack.required_files && pack.required_files.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Required files</h2>
            <ul className="space-y-1.5">
              {pack.required_files.map((f) => (
                <li
                  key={f}
                  className="bg-gray-950 rounded-lg px-3 py-2 text-sm font-mono text-gray-300"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pack.compatible_models && pack.compatible_models.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Compatible models</h2>
            <div className="flex flex-wrap gap-2">
              {pack.compatible_models.map((m) => (
                <span
                  key={m}
                  className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded font-mono"
                >
                  {m}
                </span>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-100 mt-1">{value}</p>
    </div>
  );
}

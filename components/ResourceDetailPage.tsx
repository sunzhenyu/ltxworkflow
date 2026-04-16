import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import { getResourceItem, sectionMeta, ResourceSection } from "@/lib/resources";

type Props = {
  section: ResourceSection;
  slug: string;
};

export async function ResourceDetailPage({ section, slug }: Props) {
  const meta = sectionMeta[section];
  const item = await getResourceItem(section, slug);
  if (!item) notFound();

  const date = item.source_published_at
    ? new Date(item.source_published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref={`/resources/${section}`} />

      <article className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className={`${meta.color} px-2 py-0.5 rounded-full font-medium`}>
              {meta.label}
            </span>
            {date && <span className="text-gray-500">{date}</span>}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-100">{item.title}</h1>
          <p className="text-lg text-gray-400">{item.excerpt}</p>
          {item.author_name && (
            <p className="text-sm text-gray-500">By {item.author_name}</p>
          )}
        </header>

        <div className="bg-gray-900 rounded-xl p-6 md:p-8">
          <MarkdownContent content={item.content} />
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}

export async function generateResourceMetadata(
  section: ResourceSection,
  slug: string
): Promise<Metadata> {
  const item = await getResourceItem(section, slug);
  if (!item) return { title: "Not Found" };
  return {
    title: item.seo_title || `${item.title} — ltx workflow`,
    description: item.seo_description || item.excerpt,
    alternates: { canonical: `https://ltxworkflow.com/resources/${section}/${slug}` },
  };
}

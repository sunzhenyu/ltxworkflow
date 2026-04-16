import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getResourceItems, sectionMeta, ResourceSection } from "@/lib/resources";

type Props = {
  section: ResourceSection;
  page: number;
};

export async function ResourceListPage({ section, page }: Props) {
  const meta = sectionMeta[section];
  const { items, total } = await getResourceItems(section, page);
  const totalPages = Math.ceil(total / 12);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref={`/resources/${section}`} />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">{meta.label}</h1>
        <p className="text-gray-400">{meta.description}</p>
      </section>

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const date = item.source_published_at
                ? new Date(item.source_published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;
              return (
                <Link
                  key={item.slug}
                  href={`/resources/${section}/${item.slug}`}
                  className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors group space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`${meta.color} px-2 py-0.5 rounded-full font-medium`}>
                      {meta.label}
                    </span>
                    {date && <span className="text-gray-500">{date}</span>}
                  </div>
                  <h2 className="font-bold text-base text-gray-100 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{item.excerpt}</p>
                  <p className="text-xs text-violet-400 group-hover:text-violet-300">Read more →</p>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/resources/${section}?page=${page - 1}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  ← Prev
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/resources/${section}?page=${page + 1}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-900 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-400">No content yet. Check back soon.</p>
        </div>
      )}

      <Footer />
    </main>
  );
}

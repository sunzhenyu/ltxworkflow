import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  author_name: string;
  author_avatar: string | null;
  read_time_minutes: number;
  published_at: string;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as BlogPost;
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, read_time_minutes, published_at")
    .eq("category", category)
    .eq("is_published", true)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(3);

  return (data as BlogPost[]) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.seo_title || `${post.title} — ltx workflow`,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `https://ltxworkflow.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author_name],
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.category, post.slug);
  const publishedDate = new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/blog" />

      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">
              {post.category}
            </span>
            <span className="text-gray-500">{publishedDate}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-100">{post.title}</h1>
          <p className="text-lg text-gray-400">{post.excerpt}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>By {post.author_name}</span>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full rounded-xl"
          />
        )}

        {/* Content */}
        <div className="bg-gray-900 rounded-xl p-6 md:p-8">
          <MarkdownContent content={post.content} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors group space-y-2"
              >
                <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">
                  {related.category}
                </span>
                <h3 className="font-semibold text-sm text-gray-100 group-hover:text-violet-300">
                  {related.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

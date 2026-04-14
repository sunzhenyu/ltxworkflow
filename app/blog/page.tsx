import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog — LTX 2.3 Guides, Tutorials & Tips",
  description: "LTX 2.3 tutorials, ComfyUI guides, model comparisons, and video generation tips. Learn how to use LTX 2.3 for text-to-video and image-to-video.",
  alternates: { canonical: "https://ltxworkflow.com/blog" },
};

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time_minutes: number;
  published_at: string;
};

async function getPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, read_time_minutes, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (data as BlogPost[]) || [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/blog" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Blog</h1>
        <p className="text-gray-400">
          LTX 2.3 tutorials, ComfyUI guides, model comparisons, and video generation tips.
        </p>
      </section>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const date = new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors group space-y-3"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">
                    {post.category}
                  </span>
                  <span className="text-gray-500">{date}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{post.read_time_minutes} min</span>
                </div>
                <h2 className="font-bold text-base text-gray-100 group-hover:text-violet-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">{post.excerpt}</p>
                <p className="text-xs text-violet-400 group-hover:text-violet-300">Read more →</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-5 text-center space-y-2">
          <p className="text-sm text-gray-400">No articles yet. Check back soon for new content.</p>
        </div>
      )}

      <Footer />
    </main>
  );
}

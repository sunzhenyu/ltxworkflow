import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — LTX 2.3 Guides, Tutorials & Tips",
  description: "LTX 2.3 tutorials, ComfyUI guides, model comparisons, and video generation tips. Learn how to use LTX 2.3 for text-to-video and image-to-video.",
  alternates: { canonical: "https://ltxworkflow.com/blog" },
};

// Placeholder blog posts - will be replaced with real content
const posts = [
  {
    slug: "ltx-2-3-getting-started",
    title: "Getting Started with LTX 2.3: Complete Setup Guide",
    excerpt: "Step-by-step guide to installing LTX 2.3 with ComfyUI. Download models, configure nodes, and generate your first video.",
    date: "2026-04-14",
    category: "Tutorial",
    readTime: "8 min",
  },
  {
    slug: "fp8-vs-full-precision",
    title: "FP8 vs Full Precision: Which LTX 2.3 Model Should You Use?",
    excerpt: "Compare FP8 quantized models (16GB VRAM) with official full-precision checkpoints. Quality tests, speed benchmarks, and recommendations.",
    date: "2026-04-14",
    category: "Comparison",
    readTime: "6 min",
  },
  {
    slug: "prompt-engineering-ltx",
    title: "Prompt Engineering for LTX 2.3: Tips & Examples",
    excerpt: "Learn how to write effective prompts for LTX 2.3. Camera movements, lighting, composition, and cinematic techniques.",
    date: "2026-04-14",
    category: "Guide",
    readTime: "10 min",
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Nav activeHref="/blog" />

      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold">Blog</h1>
        <p className="text-gray-400">
          LTX 2.3 tutorials, ComfyUI guides, model comparisons, and video generation tips.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors group space-y-3"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full font-medium">
                {post.category}
              </span>
              <span className="text-gray-500">{post.date}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{post.readTime}</span>
            </div>
            <h2 className="font-bold text-base text-gray-100 group-hover:text-violet-300 transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">{post.excerpt}</p>
            <p className="text-xs text-violet-400 group-hover:text-violet-300">Read more →</p>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 text-center space-y-2">
        <p className="text-sm text-gray-400">More articles coming soon. Check back regularly for new content.</p>
      </div>

      <Footer />
    </main>
  );
}

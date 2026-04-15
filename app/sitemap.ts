import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: "https://ltxworkflow.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ltxworkflow.com/guide", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://ltxworkflow.com/models", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ltxworkflow.com/workflows", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ltxworkflow.com/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://ltxworkflow.com/changelog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: "https://ltxworkflow.com/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://ltxworkflow.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://ltxworkflow.com/feedback", lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: "https://ltxworkflow.com/sign-in", lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `https://ltxworkflow.com/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}

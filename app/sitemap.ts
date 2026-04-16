import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const RESOURCE_SECTIONS = ["tutorials", "community", "showcase", "research", "tools"] as const;

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
    ...RESOURCE_SECTIONS.map((s) => ({
      url: `https://ltxworkflow.com/resources/${s}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  try {
    const supabase = await createClient();

    const [blogResult, ...resourceResults] = await Promise.all([
      supabase.from("blog_posts").select("slug, published_at, updated_at").eq("is_published", true).order("published_at", { ascending: false }),
      ...RESOURCE_SECTIONS.map((s) =>
        supabase.from(s).select("slug, source_published_at, updated_at").eq("is_published", true).order("source_published_at", { ascending: false })
      ),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = (blogResult.data || []).map((post) => ({
      url: `https://ltxworkflow.com/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const resourceRoutes: MetadataRoute.Sitemap = resourceResults.flatMap((result, i) =>
      (result.data || []).map((item: any) => ({
        url: `https://ltxworkflow.com/resources/${RESOURCE_SECTIONS[i]}/${item.slug}`,
        lastModified: new Date(item.updated_at || item.source_published_at || new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );

    return [...staticRoutes, ...blogRoutes, ...resourceRoutes];
  } catch {
    return staticRoutes;
  }
}

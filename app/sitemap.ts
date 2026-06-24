import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { MODELS } from "@/lib/models";

const RESOURCE_SECTIONS = ["tutorials", "community", "showcase", "research", "tools"] as const;
const SIX_MONTHS_AGO = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    // Core product pages — highest crawl priority
    { url: "https://ltxworkflow.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ltxworkflow.com/generate", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ltxworkflow.com/guide", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://ltxworkflow.com/guide/vram-requirements", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://ltxworkflow.com/pack", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://ltxworkflow.com/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://ltxworkflow.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: "https://ltxworkflow.com/models", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: "https://ltxworkflow.com/workflows", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ltxworkflow.com/changelog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: "https://ltxworkflow.com/contact", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    // Legal — crawled but low priority
    { url: "https://ltxworkflow.com/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://ltxworkflow.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...RESOURCE_SECTIONS.map((s) => ({
      url: `https://ltxworkflow.com/resources/${s}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...MODELS.map((m) => ({
      url: `https://ltxworkflow.com/models/${m.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];

  try {
    const supabase = await createClient();

    const [blogResult, packResult, ...resourceResults] = await Promise.all([
      supabase.from("blog_posts").select("slug, published_at, updated_at").eq("is_published", true).order("published_at", { ascending: false }),
      supabase.from("workflow_packs").select("slug, updated_at, created_at").eq("is_published", true).order("created_at", { ascending: false }),
      ...RESOURCE_SECTIONS.map((s) =>
        supabase.from(s).select("slug, created_at, updated_at").eq("is_published", true).order("created_at", { ascending: false })
      ),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = (blogResult.data || []).map((post) => {
      const lastMod = new Date(post.updated_at || post.published_at);
      return {
        url: `https://ltxworkflow.com/blog/${post.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: lastMod > SIX_MONTHS_AGO ? 0.75 : 0.6,
      };
    });

    const packRoutes: MetadataRoute.Sitemap = (packResult?.data || []).map((p: any) => ({
      url: `https://ltxworkflow.com/pack/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

    const resourceRoutes: MetadataRoute.Sitemap = resourceResults.flatMap((result, i) =>
      (result.data || []).map((item: any) => ({
        url: `https://ltxworkflow.com/resources/${RESOURCE_SECTIONS[i]}/${item.slug}`,
        lastModified: new Date(item.updated_at || item.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.65,
      }))
    );

    return [...staticRoutes, ...blogRoutes, ...packRoutes, ...resourceRoutes];
  } catch {
    return staticRoutes;
  }
}

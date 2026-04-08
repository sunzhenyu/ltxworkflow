import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ltxworkflow.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ltxworkflow.com/guide", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://ltxworkflow.com/models", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ltxworkflow.com/workflows", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ltxworkflow.com/changelog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://ltxworkflow.com/feedback", lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: "https://ltxworkflow.com/sign-in", lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ltxworkflow.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ltxworkflow.com/sign-in", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}

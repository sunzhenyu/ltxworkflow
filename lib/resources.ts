import { createClient } from "@/lib/supabase/server";

export type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  author_name: string;
  source_url: string | null;
  source_title: string | null;
  source_published_at: string | null;
  created_at: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

export type ResourceSection = "tutorials" | "community" | "showcase" | "research" | "tools";

const PAGE_SIZE = 12;

export async function getResourceItems(
  section: ResourceSection,
  page: number = 1
): Promise<{ items: ResourceItem[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from(section)
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { items: (data as ResourceItem[]) || [], total: count || 0 };
}

export async function getResourceItem(
  section: ResourceSection,
  slug: string
): Promise<ResourceItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(section)
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as ResourceItem;
}

export const sectionMeta: Record<ResourceSection, { label: string; description: string; color: string }> = {
  tutorials: {
    label: "Tutorials",
    description: "Step-by-step guides for LTX 2.3 and ComfyUI video generation.",
    color: "bg-blue-700 text-blue-100",
  },
  community: {
    label: "Community",
    description: "Hot discussions from Reddit, Discord, and the LTX community.",
    color: "bg-green-700 text-green-100",
  },
  showcase: {
    label: "Showcase",
    description: "Outstanding video generations and creative examples from the community.",
    color: "bg-orange-700 text-orange-100",
  },
  research: {
    label: "Research",
    description: "Academic papers and technical research on LTX and video generation.",
    color: "bg-red-700 text-red-100",
  },
  tools: {
    label: "Tools",
    description: "ComfyUI nodes, extensions, and related tools for LTX 2.3.",
    color: "bg-violet-700 text-violet-100",
  },
};

export const PAGE_SIZE_EXPORT = PAGE_SIZE;

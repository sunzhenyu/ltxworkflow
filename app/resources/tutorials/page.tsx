import type { Metadata } from "next";
import { ResourceListPage } from "@/components/ResourceListPage";

export const metadata: Metadata = {
  title: "Tutorials — LTX 2.3 Step-by-Step Guides",
  description: "Step-by-step tutorials for LTX 2.3 and ComfyUI video generation.",
  alternates: { canonical: "https://ltxworkflow.com/resources/tutorials" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <ResourceListPage section="tutorials" page={parseInt(page || "1")} />;
}

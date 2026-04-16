import type { Metadata } from "next";
import { ResourceListPage } from "@/components/ResourceListPage";

export const metadata: Metadata = {
  title: "Showcase — LTX 2.3 Video Examples",
  description: "Outstanding video generations and creative examples from the LTX 2.3 community.",
  alternates: { canonical: "https://ltxworkflow.com/resources/showcase" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <ResourceListPage section="showcase" page={parseInt(page || "1")} />;
}

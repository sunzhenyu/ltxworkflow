import type { Metadata } from "next";
import { ResourceListPage } from "@/components/ResourceListPage";

export const metadata: Metadata = {
  title: "Research — LTX 2.3 Papers & Technical Analysis",
  description: "Academic papers and technical research on LTX and AI video generation.",
  alternates: { canonical: "https://ltxworkflow.com/resources/research" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <ResourceListPage section="research" page={parseInt(page || "1")} />;
}

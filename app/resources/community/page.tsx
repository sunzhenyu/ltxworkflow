import type { Metadata } from "next";
import { ResourceListPage } from "@/components/ResourceListPage";

export const metadata: Metadata = {
  title: "Community — LTX 2.3 Discussions & Posts",
  description: "Hot discussions from Reddit, Discord, and the LTX 2.3 community.",
  alternates: { canonical: "https://ltxworkflow.com/resources/community" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <ResourceListPage section="community" page={parseInt(page || "1")} />;
}

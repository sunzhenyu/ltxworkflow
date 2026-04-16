import type { Metadata } from "next";
import { ResourceListPage } from "@/components/ResourceListPage";

export const metadata: Metadata = {
  title: "Tools — ComfyUI Nodes & Extensions for LTX 2.3",
  description: "ComfyUI nodes, extensions, and related tools for LTX 2.3 video generation.",
  alternates: { canonical: "https://ltxworkflow.com/resources/tools" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <ResourceListPage section="tools" page={parseInt(page || "1")} />;
}

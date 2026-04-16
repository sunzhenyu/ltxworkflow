import { generateResourceMetadata, ResourceDetailPage } from "@/components/ResourceDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateResourceMetadata("tools", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage section="tools" slug={slug} />;
}

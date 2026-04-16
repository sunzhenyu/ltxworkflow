import { generateResourceMetadata, ResourceDetailPage } from "@/components/ResourceDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateResourceMetadata("research", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceDetailPage section="research" slug={slug} />;
}

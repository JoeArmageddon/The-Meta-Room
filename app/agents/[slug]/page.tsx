import { EntryPageContent } from "@/components/entry-page-content";

export default function AgentPage({ params }: { params: { slug: string } }) {
  return <EntryPageContent type="agent" slug={params.slug} />;
}

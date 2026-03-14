import { EntryPageContent } from "@/components/entry-page-content";

export default function WorkflowPage({ params }: { params: { slug: string } }) {
  return <EntryPageContent type="workflow" slug={params.slug} />;
}

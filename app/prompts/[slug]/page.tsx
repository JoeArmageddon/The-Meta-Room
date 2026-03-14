import { EntryPageContent } from "@/components/entry-page-content";

export default function PromptPage({ params }: { params: { slug: string } }) {
  return <EntryPageContent type="prompt" slug={params.slug} />;
}

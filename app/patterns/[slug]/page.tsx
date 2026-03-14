import { EntryPageContent } from "@/components/entry-page-content";

export default function PatternPage({ params }: { params: { slug: string } }) {
  return <EntryPageContent type="pattern" slug={params.slug} />;
}

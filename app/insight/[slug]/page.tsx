import { notFound } from "next/navigation";
import Link from "next/link";
import { allInsights, getInsightBySlug, getRelatedInsights } from "@/lib/content";
import { TAG_META } from "@/lib/types";
import TagPill from "@/components/TagPill";
import InsightCard from "@/components/InsightCard";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { Metadata } from "next";

export function generateStaticParams() {
  return allInsights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) return {};
  return {
    title: insight.title,
    description: insight.oneLiner,
    openGraph: {
      title: insight.title,
      description: insight.oneLiner,
      images: [{ url: `/og/insight-${slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/og/insight-${slug}.png`],
    },
  };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) notFound();

  const related = getRelatedInsights(slug, insight.tag, 3);
  const meta = TAG_META[insight.tag];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Tag pill */}
      <div className="mb-4">
        <TagPill tag={insight.tag} size="md" />
      </div>

      {/* Title */}
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight">
        {insight.title}
      </h1>

      {/* One-liner as pull quote */}
      <blockquote
        className="text-lg md:text-xl text-stone-500 italic mb-8 pl-4 border-l-3"
        style={{ borderLeftColor: meta?.bgColor || "#d6d3d1" }}
      >
        {insight.oneLiner}
      </blockquote>

      {/* Body content */}
      <div className="prose-insight text-stone-700 text-base leading-relaxed mb-10">
        {insight.body.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Attribution */}
      <div className="border-t border-stone-200 pt-6 mb-10 space-y-2">
        {insight.episodeData && (
          <p className="text-sm text-stone-500">
            From{" "}
            <Link
              href={`/episode/${insight.episode}`}
              className="link-underline text-stone-700 font-medium"
            >
              Episode {insight.episodeData.episodeNumber}: {insight.episodeData.title}
            </Link>
          </p>
        )}
        {insight.authorData && (
          <p className="text-sm text-stone-500">
            Shared by{" "}
            <Link
              href={`/author/${insight.source}`}
              className="link-underline text-stone-700 font-medium"
            >
              {insight.authorData.name}
            </Link>
          </p>
        )}
      </div>

      {/* Share */}
      <div className="mb-12">
        <CopyLinkButton />
      </div>

      {/* Related Signals */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
            Related Signals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r, i) => (
              <InsightCard
                key={r.slug}
                slug={r.slug}
                title={r.title}
                tag={r.tag}
                oneLiner={r.oneLiner}
                episodeNumber={r.episodeData?.episodeNumber}
                authorName={r.authorData?.name}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

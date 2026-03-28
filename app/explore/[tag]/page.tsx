import { notFound } from "next/navigation";
import { allInsights, siteStats } from "@/lib/content";
import { TAG_META, type TagSlug } from "@/lib/types";
import InsightCard from "@/components/InsightCard";
import type { Metadata } from "next";

const VALID_TAGS = Object.keys(TAG_META) as TagSlug[];

export function generateStaticParams() {
  return VALID_TAGS.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const meta = TAG_META[tag as TagSlug];
  if (!meta) return {};
  return {
    title: `${meta.label} — Founder Playbooks`,
    description: meta.description,
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const meta = TAG_META[tag as TagSlug];
  if (!meta) notFound();

  const insights = allInsights
    .filter((i) => i.tag === tag)
    .sort((a, b) => {
      const dateA = a.episodeData?.date || "";
      const dateB = b.episodeData?.date || "";
      return dateB.localeCompare(dateA);
    });

  const count = siteStats.tagCounts[tag as TagSlug] || 0;

  return (
    <div>
      {/* Colored header */}
      <div
        className="py-12 mb-8"
        style={{ backgroundColor: `${meta.bgColor}40` }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
          >
            {meta.label}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
            {meta.label}
          </h1>
          <p className="text-lg text-stone-600 mb-2">{meta.description}</p>
          <p className="font-mono text-sm text-stone-400">
            {count} insight{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Card grid */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, i) => (
            <div key={insight.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <InsightCard
                slug={insight.slug}
                title={insight.title}
                tag={insight.tag}
                oneLiner={insight.oneLiner}
                episodeNumber={insight.episodeData?.episodeNumber}
                episodeTitle={insight.episodeData?.title}
                authorName={insight.authorData?.name}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

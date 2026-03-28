import { allInsights, siteStats } from "@/lib/content";
import InsightCard from "@/components/InsightCard";
import TagPill from "@/components/TagPill";
import { TAG_META, type TagSlug } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Insights — Founder Playbooks",
  description: "Browse all insights extracted from podcast episodes.",
};

export default function InsightsPage() {
  const sorted = [...allInsights].sort((a, b) => {
    const dateA = a.episodeData?.date || "";
    const dateB = b.episodeData?.date || "";
    return dateB.localeCompare(dateA);
  });

  const tagEntries = Object.entries(TAG_META) as [TagSlug, (typeof TAG_META)[TagSlug]][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
        All Insights
      </h1>
      <p className="text-stone-500 text-lg mb-6">
        {siteStats.totalInsights} insights from {siteStats.totalEpisodes} episodes.
      </p>

      {/* Tag filter links */}
      <div className="flex flex-wrap gap-2 mb-10">
        {tagEntries.map(([slug]) => (
          <TagPill
            key={slug}
            tag={slug}
            count={siteStats.tagCounts[slug] || 0}
            size="md"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((insight, i) => (
          <div
            key={insight.slug}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
          >
            <InsightCard
              slug={insight.slug}
              title={insight.title}
              tag={insight.tag}
              oneLiner={insight.oneLiner}
              episodeNumber={insight.episodeData?.episodeNumber}
              authorName={insight.authorData?.name}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

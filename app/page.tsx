import Link from "next/link";
import { allInsights, allEpisodes, siteStats, getLatestEpisode } from "@/lib/content";
import { TAG_META, type TagSlug } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import SurpriseMe from "@/components/SurpriseMe";
import TagBreakdownPills from "@/components/TagBreakdownPills";

export default function HomePage() {
  const latestEpisode = getLatestEpisode();

  const searchItems = [
    ...allInsights.map((i) => ({
      type: "insight" as const,
      title: i.title,
      slug: i.slug,
      tag: i.tag,
      oneLiner: i.oneLiner,
    })),
    ...allEpisodes.map((e) => ({
      type: "episode" as const,
      title: e.title,
      slug: e.slug,
      subtitle: `Episode ${e.episodeNumber}`,
    })),
  ];

  const tagEntries = Object.entries(TAG_META) as [TagSlug, (typeof TAG_META)[TagSlug]][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-stone-800 mb-6 leading-tight">
          500 episodes. Zero fluff.
        </h1>

        <SearchBar items={searchItems} className="max-w-xl mx-auto mb-4" />

        <p className="text-stone-500 text-lg mb-6">
          The most structured founder knowledge database on the internet.
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="font-mono text-sm text-stone-400">
            {siteStats.totalInsights} insights from {siteStats.totalEpisodes} episodes
          </span>
        </div>

        <SurpriseMe slugs={allInsights.map((i) => i.slug)} />
      </section>

      {/* Latest Episode */}
      {latestEpisode && (
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-stone-700 mb-6">
            Latest Episode
          </h2>
          <Link
            href={`/episode/${latestEpisode.slug}`}
            className="block rounded-xl bg-white/80 border border-stone-200/60 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                #{latestEpisode.episodeNumber}
              </span>
              <span className="font-mono text-xs text-stone-400">
                {latestEpisode.date}
              </span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-stone-800 mb-2">
              {latestEpisode.title}
            </h3>
            <p className="text-stone-500 mb-4 leading-relaxed">
              {latestEpisode.description}
            </p>
            <div className="flex items-center gap-3">
              <TagBreakdownPills breakdown={latestEpisode.tagBreakdown} linked={false} />
              <span className="font-mono text-xs text-stone-400">
                {latestEpisode.insights.length} insights
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* 8 Category Cards */}
      <section>
        <h2 className="font-display text-3xl font-bold text-stone-700 mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tagEntries.map(([slug, meta]) => {
            const count = siteStats.tagCounts[slug] || 0;
            return (
              <Link
                key={slug}
                href={`/explore/${slug}`}
                className="group block rounded-xl bg-white/80 border border-stone-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3"
                  style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
                >
                  {slug === "framework" && "🧠"}
                  {slug === "tactic" && "🎯"}
                  {slug === "wild-story" && "🔥"}
                  {slug === "founder-psychology" && "🪞"}
                  {slug === "big-mistake" && "💥"}
                  {slug === "business-idea" && "💡"}
                  {slug === "growth-distribution" && "📈"}
                  {slug === "money-advice" && "💰"}
                </div>
                <h3 className="font-serif font-semibold text-stone-800 mb-1 group-hover:text-stone-950">
                  {meta.label}
                </h3>
                <p className="text-sm text-stone-500 mb-2 leading-relaxed">
                  {meta.description}
                </p>
                <span className="font-mono text-xs text-stone-400">
                  {count} {meta.label.toLowerCase()}{count !== 1 ? "s" : ""}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

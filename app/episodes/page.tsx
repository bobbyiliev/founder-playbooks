import { allEpisodes } from "@/lib/content";
import EpisodeCard from "@/components/EpisodeCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Episodes — Founder Playbooks",
  description: "Browse all podcast episodes with extracted insights.",
};

export default function EpisodesPage() {
  const sorted = [...allEpisodes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
        Episodes
      </h1>
      <p className="text-stone-500 text-lg mb-10">
        {allEpisodes.length} episodes with extracted insights.
      </p>

      <div className="space-y-4">
        {sorted.map((ep, i) => {
          const guestName = ep.guest
            ? undefined // EpisodeCard doesn't resolve guest name, we pass it if available
            : undefined;
          return (
            <div
              key={ep.slug}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <EpisodeCard
                slug={ep.slug}
                title={ep.title}
                episodeNumber={ep.episodeNumber}
                date={ep.date}
                duration={ep.duration}
                description={ep.description}
                insightCount={ep.insights.length}
                tagBreakdown={ep.tagBreakdown}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

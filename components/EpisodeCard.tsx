import Link from "next/link";
import TagPill from "./TagPill";
import type { TagSlug } from "@/lib/types";

interface EpisodeCardProps {
  slug: string;
  title: string;
  episodeNumber: number;
  date: string;
  duration: string;
  description: string;
  insightCount: number;
  tagBreakdown: Partial<Record<TagSlug, number>>;
  guestName?: string;
}

export default function EpisodeCard({
  slug,
  title,
  episodeNumber,
  date,
  duration,
  description,
  insightCount,
  tagBreakdown,
  guestName,
}: EpisodeCardProps) {
  return (
    <Link href={`/episode/${slug}`} className="group block">
      <div className="rounded-lg bg-white/80 p-6 shadow-sm border border-stone-200/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
            #{episodeNumber}
          </span>
          <span className="text-xs text-stone-400 font-mono">{date}</span>
          <span className="text-xs text-stone-400 font-mono">&middot; {duration}</span>
        </div>

        <h3 className="font-serif text-lg font-semibold text-stone-800 leading-snug mb-2 group-hover:text-stone-950">
          {title}
        </h3>

        {guestName && (
          <p className="text-sm text-stone-500 mb-2">with {guestName}</p>
        )}

        <p className="text-sm text-stone-500 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(tagBreakdown).map(([tag, count]) => (
            <TagPill
              key={tag}
              tag={tag as TagSlug}
              count={count}
              linked={false}
              size="sm"
            />
          ))}
          <span className="text-xs text-stone-400 ml-1">
            {insightCount} insights
          </span>
        </div>
      </div>
    </Link>
  );
}

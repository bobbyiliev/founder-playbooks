import Link from "next/link";
import { TAG_META, type TagSlug } from "@/lib/types";
import TagPill from "./TagPill";

interface InsightCardProps {
  slug: string;
  title: string;
  tag: TagSlug;
  oneLiner: string;
  episodeNumber?: number;
  episodeTitle?: string;
  authorName?: string;
  index?: number;
}

export default function InsightCard({
  slug,
  title,
  tag,
  oneLiner,
  episodeNumber,
  episodeTitle,
  authorName,
  index = 0,
}: InsightCardProps) {
  const meta = TAG_META[tag];

  return (
    <Link
      href={`/insight/${slug}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative h-full rounded-lg bg-white/80 p-5 shadow-sm border border-stone-200/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md overflow-hidden"
        style={{ borderLeftWidth: "3px", borderLeftColor: meta?.bgColor }}
      >
        <div className="mb-3">
          <TagPill tag={tag} linked={false} />
        </div>

        <h3 className="font-serif text-base font-semibold text-stone-800 leading-snug mb-2 line-clamp-2 group-hover:text-stone-950">
          {title}
        </h3>

        <p className="text-sm text-stone-500 italic leading-relaxed mb-3 line-clamp-2">
          {oneLiner}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
          {episodeNumber && <span>Ep {episodeNumber}</span>}
          {episodeNumber && authorName && <span>&middot;</span>}
          {authorName && <span>{authorName}</span>}
        </div>
      </div>
    </Link>
  );
}

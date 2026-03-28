import TagPill from "./TagPill";
import type { TagSlug } from "@/lib/types";

interface TagBreakdownPillsProps {
  breakdown: Partial<Record<TagSlug, number>>;
  linked?: boolean;
}

export default function TagBreakdownPills({
  breakdown,
  linked = true,
}: TagBreakdownPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(breakdown).map(([tag, count]) => (
        <TagPill
          key={tag}
          tag={tag as TagSlug}
          count={count}
          linked={linked}
          size="sm"
        />
      ))}
    </div>
  );
}

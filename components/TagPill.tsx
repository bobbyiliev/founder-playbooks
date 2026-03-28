import Link from "next/link";
import { TAG_META, type TagSlug } from "@/lib/types";

interface TagPillProps {
  tag: TagSlug;
  count?: number;
  linked?: boolean;
  size?: "sm" | "md";
}

export default function TagPill({
  tag,
  count,
  linked = true,
  size = "sm",
}: TagPillProps) {
  const meta = TAG_META[tag];
  if (!meta) return null;

  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  const pill = (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-transform hover:scale-105 ${sizeClasses}`}
      style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
    >
      {meta.label}
      {count !== undefined && (
        <span className="opacity-70">({count})</span>
      )}
    </span>
  );

  if (linked) {
    return <Link href={`/explore/${tag}`}>{pill}</Link>;
  }

  return pill;
}

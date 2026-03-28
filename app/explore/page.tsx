import Link from "next/link";
import { siteStats } from "@/lib/content";
import { TAG_META, type TagSlug } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore — Founder Playbooks",
  description: "Browse insights by category: frameworks, tactics, wild stories, and more.",
};

export default function ExplorePage() {
  const tagEntries = Object.entries(TAG_META) as [TagSlug, (typeof TAG_META)[TagSlug]][];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
        Explore
      </h1>
      <p className="text-stone-500 text-lg mb-10">
        Browse {siteStats.totalInsights} insights across 8 categories.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tagEntries.map(([slug, meta]) => {
          const count = siteStats.tagCounts[slug] || 0;
          return (
            <Link
              key={slug}
              href={`/explore/${slug}`}
              className="group block rounded-xl bg-white/80 border border-stone-200/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-3"
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
              <h2 className="font-serif text-lg font-semibold text-stone-800 mb-1 group-hover:text-stone-950">
                {meta.label}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed mb-2">
                {meta.description}
              </p>
              <span className="font-mono text-xs text-stone-400">
                {count} insight{count !== 1 ? "s" : ""}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

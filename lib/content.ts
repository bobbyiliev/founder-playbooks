import type {
  Insight,
  EpisodeWithInsights,
  AuthorWithRelations,
  BookMeta,
  SiteStats,
  TagSlug,
} from "./types";

import allInsightsJson from "@/content/.generated/all-insights.json";
import allEpisodesJson from "@/content/.generated/all-episodes.json";
import allAuthorsJson from "@/content/.generated/all-authors.json";
import allBooksJson from "@/content/.generated/all-books.json";
import statsJson from "@/content/.generated/stats.json";

export const allInsights = allInsightsJson as Insight[];
export const allEpisodes = allEpisodesJson as EpisodeWithInsights[];
export const allAuthors = allAuthorsJson as AuthorWithRelations[];
export const allBooks = allBooksJson as BookMeta[];
export const siteStats = statsJson as SiteStats;

export function getInsightBySlug(slug: string): Insight | undefined {
  return allInsights.find((i) => i.slug === slug);
}

export function getInsightsByTag(tag: TagSlug): Insight[] {
  return allInsights
    .filter((i) => i.tag === tag)
    .sort((a, b) => {
      const dateA = a.episodeData?.date || "";
      const dateB = b.episodeData?.date || "";
      return dateB.localeCompare(dateA);
    });
}

export function getEpisodeBySlug(slug: string): EpisodeWithInsights | undefined {
  return allEpisodes.find((e) => e.slug === slug);
}

export function getAuthorBySlug(slug: string): AuthorWithRelations | undefined {
  return allAuthors.find((a) => a.slug === slug);
}

export function getLatestEpisode(): EpisodeWithInsights | undefined {
  return [...allEpisodes].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getRelatedInsights(
  currentSlug: string,
  tag: TagSlug,
  count = 3
): Insight[] {
  return allInsights
    .filter((i) => i.tag === tag && i.slug !== currentSlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

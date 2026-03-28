import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Insight,
  EpisodeMeta,
  EpisodeWithInsights,
  AuthorMeta,
  AuthorWithRelations,
  BookMeta,
  BookMention,
  TagSlug,
  SiteStats,
} from "../lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const GENERATED_DIR = path.join(CONTENT_DIR, ".generated");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readMdxFiles<T>(subdir: string): { data: T; body: string }[] {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    return { data: data as T, body: content.trim() };
  });
}

function main() {
  ensureDir(GENERATED_DIR);

  // 1. Read all content
  const rawEpisodes = readMdxFiles<EpisodeMeta>("episodes");
  const rawInsights = readMdxFiles<Insight & { body?: string }>("insights");
  const rawAuthors = readMdxFiles<AuthorMeta>("authors");
  const rawBooks = readMdxFiles<BookMeta>("books");

  // 2. Build lookup maps
  const episodes: EpisodeMeta[] = rawEpisodes.map((e) => e.data);
  const episodeMap = new Map<string, EpisodeMeta>();
  episodes.forEach((ep) => episodeMap.set(ep.slug, ep));

  const authors: AuthorMeta[] = rawAuthors.map((a) => a.data);
  const authorMap = new Map<string, AuthorMeta>();
  authors.forEach((a) => authorMap.set(a.slug, a));

  // 3. Build insights with resolved relations
  const insights: Insight[] = rawInsights.map(({ data, body }) => ({
    title: data.title,
    slug: data.slug,
    tag: data.tag as TagSlug,
    episode: data.episode,
    source: data.source,
    oneLiner: data.oneLiner,
    body,
    episodeData: episodeMap.get(data.episode),
    authorData: authorMap.get(data.source),
  }));

  // 4. Build books with resolved mentions
  const books: BookMeta[] = rawBooks.map(({ data }) => {
    const mentions: BookMention[] = (data.mentions || []).map(
      (m: BookMention) => ({
        episode: m.episode,
        recommendedBy: m.recommendedBy,
        episodeTitle: episodeMap.get(m.episode)?.title || m.episode,
        recommenderName: authorMap.get(m.recommendedBy)?.name || m.recommendedBy,
      })
    );
    return {
      title: data.title,
      slug: data.slug,
      bookAuthor: data.bookAuthor,
      coverImage: data.coverImage || "",
      description: data.description || "",
      amazonUrl: data.amazonUrl || "",
      mentions,
      timesRecommended: mentions.length,
    };
  });

  // 5. Build episode-level aggregations
  const episodesWithInsights: EpisodeWithInsights[] = episodes.map((ep) => {
    const epInsights = insights.filter((i) => i.episode === ep.slug);
    const tagBreakdown: Partial<Record<TagSlug, number>> = {};
    epInsights.forEach((i) => {
      tagBreakdown[i.tag] = (tagBreakdown[i.tag] || 0) + 1;
    });
    const epBooks = books.filter((b) =>
      b.mentions.some((m) => m.episode === ep.slug)
    );
    return { ...ep, insights: epInsights, tagBreakdown, books: epBooks };
  });

  // 6. Build author-level aggregations
  const authorsWithRelations: AuthorWithRelations[] = authors.map((author) => {
    const authorInsights = insights.filter((i) => i.source === author.slug);
    const authorEpisodeSlugs = new Set<string>();

    // Episodes where author is a guest
    episodes.forEach((ep) => {
      if (ep.guest === author.slug) authorEpisodeSlugs.add(ep.slug);
    });
    // Episodes where author is a host
    episodes.forEach((ep) => {
      if (ep.hosts?.includes(author.slug)) authorEpisodeSlugs.add(ep.slug);
    });
    // Episodes where author sourced an insight
    authorInsights.forEach((i) => authorEpisodeSlugs.add(i.episode));

    const authorEpisodes = episodes.filter((ep) =>
      authorEpisodeSlugs.has(ep.slug)
    );

    const tagBreakdown: Partial<Record<TagSlug, number>> = {};
    authorInsights.forEach((i) => {
      tagBreakdown[i.tag] = (tagBreakdown[i.tag] || 0) + 1;
    });

    const booksRecommended = books.filter((b) =>
      b.mentions.some((m) => m.recommendedBy === author.slug)
    );

    return {
      ...author,
      episodes: authorEpisodes,
      insights: authorInsights,
      tagBreakdown,
      booksRecommended,
    };
  });

  // 7. Compute global stats
  const tagCounts = {} as Record<TagSlug, number>;
  insights.forEach((i) => {
    tagCounts[i.tag] = (tagCounts[i.tag] || 0) + 1;
  });

  const stats: SiteStats = {
    totalInsights: insights.length,
    totalEpisodes: episodes.length,
    tagCounts,
  };

  // 8. Write all JSON files
  const write = (filename: string, data: unknown) => {
    fs.writeFileSync(
      path.join(GENERATED_DIR, filename),
      JSON.stringify(data, null, 2)
    );
    console.log(`  ✓ ${filename}`);
  };

  console.log("Building content cache...");
  write("all-insights.json", insights);
  write("all-episodes.json", episodesWithInsights);
  write("all-authors.json", authorsWithRelations);
  write("all-books.json", books);
  write("tag-counts.json", tagCounts);
  write("stats.json", stats);
  console.log("Done! Generated", Object.keys(stats.tagCounts).length, "tag categories,", stats.totalInsights, "insights from", stats.totalEpisodes, "episodes.");
}

main();

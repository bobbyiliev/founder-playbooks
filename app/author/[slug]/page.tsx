import { notFound } from "next/navigation";
import Link from "next/link";
import { allAuthors, getAuthorBySlug } from "@/lib/content";
import TagBreakdownPills from "@/components/TagBreakdownPills";
import InsightCard from "@/components/InsightCard";
import EpisodeCard from "@/components/EpisodeCard";
import type { Metadata } from "next";

export function generateStaticParams() {
  return allAuthors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  // Group episodes by year for hosts
  const episodesByYear: Record<string, typeof author.episodes> = {};
  author.episodes.forEach((ep) => {
    const year = ep.date.split("-")[0];
    if (!episodesByYear[year]) episodesByYear[year] = [];
    episodesByYear[year].push(ep);
  });
  const years = Object.keys(episodesByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Author header */}
      <div className="mb-10">
        <div className="flex items-start gap-6">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center text-2xl font-display text-stone-400 shrink-0">
            {author.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-stone-800 mb-1">
              {author.name}
            </h1>
            <p className="text-sm text-stone-500 font-mono mb-2">{author.role}</p>
            <p className="text-stone-600 leading-relaxed max-w-2xl mb-3">
              {author.bio}
            </p>
            <div className="flex gap-3">
              {author.twitter && (
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Twitter &rarr;
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Website &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
          <p className="font-mono text-2xl font-semibold text-stone-800">
            {author.insights.length}
          </p>
          <p className="text-xs text-stone-400">Insights</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
          <p className="font-mono text-2xl font-semibold text-stone-800">
            {author.episodes.length}
          </p>
          <p className="text-xs text-stone-400">Episodes</p>
        </div>
        {author.booksRecommended.length > 0 && (
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-stone-800">
              {author.booksRecommended.length}
            </p>
            <p className="text-xs text-stone-400">Books Recommended</p>
          </div>
        )}
      </div>

      {/* Tag breakdown */}
      {Object.keys(author.tagBreakdown).length > 0 && (
        <div className="mb-10">
          <TagBreakdownPills breakdown={author.tagBreakdown} />
        </div>
      )}

      <hr className="pencil-divider mb-10" />

      {/* Insights */}
      {author.insights.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
            Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {author.insights.slice(0, author.isHost ? 12 : undefined).map((insight, i) => (
              <div key={insight.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
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
        </section>
      )}

      {/* Episodes - grouped by year for hosts */}
      {author.episodes.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
            Episodes
          </h2>
          {author.isHost ? (
            <div className="space-y-8">
              {years.map((year) => (
                <div key={year}>
                  <h3 className="font-mono text-sm text-stone-400 mb-3">{year}</h3>
                  <div className="space-y-3">
                    {episodesByYear[year].map((ep) => (
                      <Link
                        key={ep.slug}
                        href={`/episode/${ep.slug}`}
                        className="block rounded-lg border border-stone-200 bg-white px-4 py-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-stone-400">
                            #{ep.episodeNumber}
                          </span>
                          <span className="font-serif font-medium text-stone-800 text-sm">
                            {ep.title}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {author.episodes.map((ep) => (
                <EpisodeCard
                  key={ep.slug}
                  slug={ep.slug}
                  title={ep.title}
                  episodeNumber={ep.episodeNumber}
                  date={ep.date}
                  duration={ep.duration}
                  description={ep.description}
                  insightCount={0}
                  tagBreakdown={{}}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { allEpisodes, getEpisodeBySlug, allAuthors } from "@/lib/content";
import TagBreakdownPills from "@/components/TagBreakdownPills";
import InsightCard from "@/components/InsightCard";
import type { Metadata } from "next";

export function generateStaticParams() {
  return allEpisodes.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return {};
  return {
    title: `Ep ${episode.episodeNumber}: ${episode.title}`,
    description: episode.description,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) notFound();

  const guestAuthor = episode.guest
    ? allAuthors.find((a) => a.slug === episode.guest)
    : null;
  const hostAuthors = allAuthors.filter((a) =>
    episode.hosts?.includes(a.slug)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-sm text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
            #{episode.episodeNumber}
          </span>
          <span className="font-mono text-sm text-stone-400">{episode.date}</span>
          <span className="font-mono text-sm text-stone-400">
            &middot; {episode.duration}
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight">
          {episode.title}
        </h1>

        {/* Guest + Hosts */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-stone-500">
          {guestAuthor && (
            <>
              <span>with</span>
              <Link
                href={`/author/${guestAuthor.slug}`}
                className="link-underline font-medium text-stone-700"
              >
                {guestAuthor.name}
              </Link>
              <span>&middot;</span>
            </>
          )}
          <span>Hosted by</span>
          {hostAuthors.map((host, i) => (
            <span key={host.slug}>
              <Link
                href={`/author/${host.slug}`}
                className="link-underline font-medium text-stone-700"
              >
                {host.name}
              </Link>
              {i < hostAuthors.length - 1 && <span> & </span>}
            </span>
          ))}
        </div>

        <p className="text-stone-600 leading-relaxed mb-6 max-w-3xl">
          {episode.description}
        </p>

        {/* Listen links */}
        <div className="flex flex-wrap gap-3 mb-6">
          {episode.youtubeId && (
            <a
              href={`https://youtube.com/watch?v=${episode.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              ▶ YouTube
            </a>
          )}
          {episode.spotifyUrl && (
            <a
              href={episode.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              🎵 Spotify
            </a>
          )}
          {episode.appleUrl && (
            <a
              href={episode.appleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              🎧 Apple Podcasts
            </a>
          )}
        </div>

        {/* Tag breakdown */}
        <TagBreakdownPills breakdown={episode.tagBreakdown} />
      </div>

      <hr className="pencil-divider mb-8" />

      {/* YouTube embed */}
      {episode.youtubeId && (
        <div className="mb-10 rounded-xl overflow-hidden shadow-md aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${episode.youtubeId}`}
            title={episode.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Books mentioned */}
      {episode.books && episode.books.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
            Books Mentioned
          </h2>
          <div className="flex flex-wrap gap-3">
            {episode.books.map((book) => (
              <Link
                key={book.slug}
                href="/books"
                className="rounded-lg border border-stone-200 bg-white px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <p className="font-serif font-semibold text-stone-800 text-sm">
                  {book.title}
                </p>
                <p className="text-xs text-stone-400">{book.bookAuthor}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Insights */}
      <section>
        <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
          Insights from this Episode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {episode.insights.map((insight, i) => (
            <div key={insight.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <InsightCard
                slug={insight.slug}
                title={insight.title}
                tag={insight.tag}
                oneLiner={insight.oneLiner}
                episodeNumber={episode.episodeNumber}
                authorName={insight.authorData?.name}
                index={i}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

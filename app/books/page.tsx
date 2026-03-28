import Link from "next/link";
import { allBooks, allEpisodes } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books — Founder Playbooks",
  description:
    "The best books recommended across hundreds of podcast episodes. Curated from My First Million.",
};

export default function BooksPage() {
  const sortedBooks = [...allBooks].sort(
    (a, b) => b.timesRecommended - a.timesRecommended
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
          The Bookshelf
        </h1>
        <p className="text-stone-500 text-lg">
          Books recommended across {allEpisodes.length} episodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedBooks.map((book) => (
          <div
            key={book.slug}
            className="rounded-xl bg-white/80 border border-stone-200/60 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              {/* Book cover placeholder */}
              <div className="w-16 h-24 rounded bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-stone-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-lg font-semibold text-stone-800 mb-0.5">
                  {book.title}
                </h2>
                <p className="text-sm text-stone-500 mb-2">
                  by {book.bookAuthor}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {book.description}
                </p>

                {/* Recommendations */}
                <div className="space-y-1.5 mb-3">
                  {book.mentions.map((mention, i) => (
                    <p key={i} className="text-xs text-stone-400">
                      Recommended by{" "}
                      <Link
                        href={`/author/${mention.recommendedBy}`}
                        className="text-stone-600 hover:text-stone-800"
                      >
                        {mention.recommenderName}
                      </Link>{" "}
                      in{" "}
                      <Link
                        href={`/episode/${mention.episode}`}
                        className="text-stone-600 hover:text-stone-800"
                      >
                        {mention.episodeTitle}
                      </Link>
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-stone-400">
                    {book.timesRecommended}x recommended
                  </span>
                  {book.amazonUrl && (
                    <a
                      href={book.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
                    >
                      Amazon &rarr;
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

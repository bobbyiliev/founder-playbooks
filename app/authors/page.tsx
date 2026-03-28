import Link from "next/link";
import { allAuthors } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authors — Founder Playbooks",
  description: "All guests and hosts featured on Founder Playbooks.",
};

export default function AuthorsPage() {
  const hosts = allAuthors.filter((a) => a.isHost);
  const guests = allAuthors.filter((a) => !a.isHost);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
        Authors
      </h1>
      <p className="text-stone-500 text-lg mb-10">
        {allAuthors.length} hosts and guests featured across all episodes.
      </p>

      {/* Hosts */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
          Hosts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hosts.map((author) => (
            <Link
              key={author.slug}
              href={`/author/${author.slug}`}
              className="group flex items-start gap-4 rounded-xl bg-white/80 border border-stone-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-xl font-display text-stone-400 shrink-0">
                {author.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-serif font-semibold text-stone-800 group-hover:text-stone-950">
                  {author.name}
                </h3>
                <p className="text-xs text-stone-400 font-mono mb-1">{author.role}</p>
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
                  {author.bio}
                </p>
                <div className="flex gap-3 mt-2 font-mono text-xs text-stone-400">
                  <span>{author.insights.length} insights</span>
                  <span>&middot;</span>
                  <span>{author.episodes.length} episodes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Guests */}
      <section>
        <h2 className="font-display text-2xl font-bold text-stone-700 mb-4">
          Guests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guests.map((author) => (
            <Link
              key={author.slug}
              href={`/author/${author.slug}`}
              className="group flex items-start gap-4 rounded-xl bg-white/80 border border-stone-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-xl font-display text-stone-400 shrink-0">
                {author.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-serif font-semibold text-stone-800 group-hover:text-stone-950">
                  {author.name}
                </h3>
                <p className="text-xs text-stone-400 font-mono mb-1">{author.role}</p>
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
                  {author.bio}
                </p>
                <div className="flex gap-3 mt-2 font-mono text-xs text-stone-400">
                  <span>{author.insights.length} insights</span>
                  <span>&middot;</span>
                  <span>{author.episodes.length} episodes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

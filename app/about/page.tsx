import type { Metadata } from "next";
import { siteStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "About — Founder Playbooks",
  description:
    "What Founder Playbooks is, why it exists, and how we extract insights from podcast episodes.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-8 leading-tight">
        About Founder Playbooks
      </h1>

      <div className="prose-insight text-stone-700 space-y-6">
        <p className="text-lg leading-relaxed">
          Founder Playbooks is <strong>Blinkist for business podcasts</strong>.
          We extract the best insights from podcast episodes and present them as
          browsable, searchable, shareable cards organized by type.
        </p>

        <p>
          We started with <strong>My First Million</strong> — one of the most
          popular business podcasts in the world. Hundreds of episodes, thousands
          of insights, zero way to find any of them later. Until now.
        </p>

        <hr className="pencil-divider my-8" />

        <h2 className="font-display text-2xl font-bold text-stone-800">
          The Problem
        </h2>

        <p>
          Podcasts are amazing for ideas but terrible for retrieval. You hear
          something brilliant on a Tuesday commute and by Friday it&apos;s gone. The
          best frameworks, tactics, and stories are trapped inside hours of
          audio, unsearchable and unorganized.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-800">
          Our Approach
        </h2>

        <p>We watch every episode and extract insights into 8 categories:</p>

        <ul className="space-y-1">
          <li>
            <strong>Frameworks</strong> — Mental models and decision tools
          </li>
          <li>
            <strong>Tactics</strong> — Specific moves you can steal today
          </li>
          <li>
            <strong>Wild Stories</strong> — Crazy outcomes and plot twists
          </li>
          <li>
            <strong>Founder Psychology</strong> — Mindset, habits, motivation
          </li>
          <li>
            <strong>Big Mistakes</strong> — Failures and &ldquo;don&apos;t do this&rdquo;
            lessons
          </li>
          <li>
            <strong>Business Ideas</strong> — Untapped markets and opportunities
          </li>
          <li>
            <strong>Growth &amp; Distribution</strong> — Marketing and channels
          </li>
          <li>
            <strong>Money Advice</strong> — Pricing, fundraising, wealth
          </li>
        </ul>

        <p>
          Each insight is a standalone, shareable piece of knowledge. We only
          extract what was actually said — no invented content, no filler, no
          fluff.
        </p>

        <hr className="pencil-divider my-8" />

        <div className="rounded-xl bg-white/80 border border-stone-200/60 p-6 text-center">
          <p className="font-display text-3xl font-bold text-stone-800 mb-2">
            {siteStats.totalInsights} insights
          </p>
          <p className="text-stone-500">
            from {siteStats.totalEpisodes} episodes and counting.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page just redirects to a random insight
// We import the slugs at build time via a client component trick
const INSIGHT_SLUGS = [
  "asymmetric-bets",
  "power-law-thinking",
  "twitter-mutual-move",
  "ai-licensing-hack",
  "building-your-own-yacht",
  "breaking-bad-house",
  "take-the-simple-idea-all-the-way",
  "kodak-buried-digital-camera",
  "excite-said-no-to-google",
  "ron-wayne-sold-apple-stake",
  "softbank-sold-nvidia-for-wework",
  "barrys-bootcamp-for-55-plus",
  "ai-generated-music-artist",
  "a16z-content-gun-to-knife-fight",
  "dont-invest-ai-infra-at-these-valuations",
  "think-and-grow-rich-con-man",
  "vibe-coded-openai-acquisition",
  "pottery-experiment-quantity-beats-quality",
  "two-tests-legitimate-self-help-guru",
  "quantity-is-the-path-to-quality",
  "mel-robbins-5-second-rule",
  "passion-hook-social-situations",
  "guru-role-selection-problem",
  "napoleon-hill-greatest-irony",
  "epstein-files-ai-podcast-model",
  "stuck-at-8k-driving-west-coast",
  "systems-dont-create-growth",
  "ego-business-vs-actual-business",
  "2010s-biggest-opportunity-reopened",
  "make-the-video-first",
  "write-a-treatment-before-filming",
];

export default function SurprisePage() {
  const router = useRouter();

  useEffect(() => {
    const slug = INSIGHT_SLUGS[Math.floor(Math.random() * INSIGHT_SLUGS.length)];
    router.replace(`/insight/${slug}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-stone-400 font-display text-2xl animate-pulse">
        Finding something good...
      </p>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

interface SurpriseMeProps {
  slugs: string[];
  className?: string;
}

export default function SurpriseMe({ slugs, className = "" }: SurpriseMeProps) {
  const router = useRouter();

  const handleClick = () => {
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    router.push(`/insight/${randomSlug}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full bg-stone-800 text-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-stone-700 hover:scale-105 active:scale-95 animate-subtle-bounce ${className}`}
    >
      <span className="text-lg">🎲</span>
      Surprise Me
    </button>
  );
}

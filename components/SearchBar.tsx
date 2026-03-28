"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import TagPill from "./TagPill";
import type { TagSlug } from "@/lib/types";

interface SearchItem {
  type: "insight" | "episode" | "author";
  title: string;
  slug: string;
  tag?: TagSlug;
  oneLiner?: string;
  subtitle?: string;
}

interface SearchBarProps {
  items: SearchItem[];
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  items,
  placeholder = "Search frameworks, tactics, stories...",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fuse = useRef(
    new Fuse(items, {
      keys: ["title", "oneLiner", "subtitle"],
      threshold: 0.4,
      includeScore: true,
    })
  );

  useEffect(() => {
    fuse.current = new Fuse(items, {
      keys: ["title", "oneLiner", "subtitle"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [items]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const found = fuse.current.search(query).slice(0, 8);
    setResults(found.map((r) => r.item));
    setIsOpen(true);
    setSelectedIndex(-1);
  }, [query]);

  const navigateTo = useCallback(
    (item: SearchItem) => {
      const path =
        item.type === "insight"
          ? `/insight/${item.slug}`
          : item.type === "episode"
            ? `/episode/${item.slug}`
            : `/author/${item.slug}`;
      router.push(path);
      setQuery("");
      setIsOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      navigateTo(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-stone-200 bg-white/90 py-3 pl-10 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-shadow"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden z-50">
          {results.map((item, i) => (
            <button
              key={`${item.type}-${item.slug}`}
              onClick={() => navigateTo(item)}
              className={`w-full text-left px-4 py-3 border-b border-stone-100 last:border-0 transition-colors ${
                i === selectedIndex ? "bg-stone-50" : "hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.tag && <TagPill tag={item.tag} linked={false} size="sm" />}
                {item.type === "episode" && (
                  <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                    Episode
                  </span>
                )}
                {item.type === "author" && (
                  <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                    Author
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-stone-700 mt-1 line-clamp-1">
                {item.title}
              </p>
              {item.oneLiner && (
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                  {item.oneLiner}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

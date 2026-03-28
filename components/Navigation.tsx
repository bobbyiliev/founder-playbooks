"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/insights", label: "Insights" },
  { href: "/episodes", label: "Episodes" },
  { href: "/authors", label: "Authors" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-[#FAF8F5]/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="font-display text-xl font-bold text-stone-800 hover:text-stone-600 transition-colors"
          >
            Founder Playbooks
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(
                link.href.split("/").slice(0, 2).join("/")
              );
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-stone-800 ${
                    isActive ? "text-stone-800" : "text-stone-500"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/surprise"
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-800 text-white px-4 py-1.5 text-sm font-medium transition-all hover:bg-stone-700 hover:scale-105 active:scale-95"
              id="nav-surprise"
            >
              <span>🎲</span> Surprise Me
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-stone-600"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200/60 bg-[#FAF8F5] px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-stone-600 hover:text-stone-800"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/surprise"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-stone-600 hover:text-stone-800"
            >
              🎲 Surprise Me
            </Link>
          </div>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-stone-200 bg-[#FAF8F5]/95 backdrop-blur-sm">
        <div className="flex justify-around py-2">
          {[
            { href: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/explore", label: "Explore", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { href: "/episodes", label: "Episodes", icon: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.06 1.06M3.858 17.364a9 9 0 001.06 1.06" },
            { href: "/books", label: "Books", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                pathname === item.href ? "text-stone-800" : "text-stone-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

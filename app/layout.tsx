import type { Metadata } from "next";
import { Caveat, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Founder Playbooks — 500 episodes. Zero fluff.",
    template: "%s | Founder Playbooks",
  },
  description:
    "The most structured founder knowledge database on the internet. Insights from 500+ podcast episodes, organized by type.",
  openGraph: {
    title: "Founder Playbooks — 500 episodes. Zero fluff.",
    description:
      "The most structured founder knowledge database on the internet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 font-serif">
        {/* Paper texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-multiply bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIxIi8+PC9zdmc+')]" />

        <Navigation />

        <main className="relative z-10 flex-1 pb-20 md:pb-0">
          {children}
        </main>

        <footer className="relative z-10 border-t border-stone-200/60 bg-[#FAF8F5] py-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-400">
            <p className="font-display text-lg text-stone-500 mb-1">
              Founder Playbooks
            </p>
            <p>
              The most structured founder knowledge database on the internet.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

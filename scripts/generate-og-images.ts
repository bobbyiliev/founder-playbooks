/**
 * OG Image Generator for Founder Playbooks
 *
 * Generates 1200x630 PNG images for social sharing.
 * Builds SVG templates with content data, converts to PNG via sharp.
 * Skips images that already exist (unless --force flag is passed).
 *
 * Usage:
 *   npx tsx scripts/generate-og-images.ts [--force]
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const GENERATED_DIR = path.join(process.cwd(), "content", ".generated");
const OUTPUT_DIR = path.join(process.cwd(), "public", "og");
const WIDTH = 1200;
const HEIGHT = 630;

const force = process.argv.includes("--force");

interface Insight {
  title: string;
  slug: string;
  tag: string;
  oneLiner: string;
  episodeData?: { episodeNumber: number; title: string };
  authorData?: { name: string };
}

interface Episode {
  title: string;
  slug: string;
  episodeNumber: number;
  date: string;
  description: string;
  insights: Insight[];
  tagBreakdown: Record<string, number>;
}

interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  insights: Insight[];
  episodes: Episode[];
}

interface Stats {
  totalInsights: number;
  totalEpisodes: number;
  tagCounts: Record<string, number>;
}

const TAG_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  framework: { bg: "#E8D5B7", text: "#8B6914", label: "Framework" },
  tactic: { bg: "#D4E8D0", text: "#2D6A4F", label: "Tactic" },
  "wild-story": { bg: "#F5D5D5", text: "#9B2C2C", label: "Wild Story" },
  "founder-psychology": { bg: "#D5DCE8", text: "#2C5282", label: "Founder Psychology" },
  "big-mistake": { bg: "#F5E0D0", text: "#C44D34", label: "Big Mistake" },
  "business-idea": { bg: "#E8E5D0", text: "#7B6B1A", label: "Business Idea" },
  "growth-distribution": { bg: "#D0E8E5", text: "#1B6B5A", label: "Growth & Distribution" },
  "money-advice": { bg: "#E0D5E8", text: "#5B3A8A", label: "Money Advice" },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "\u2026";
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (lines.length >= maxLines) break;
    if (current.length + word.length + 1 > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current.trim());
  }
  // Add ellipsis to last line if we truncated
  if (lines.length === maxLines && words.length > lines.join(" ").split(" ").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = truncate(last, last.length);
  }
  return lines;
}

// --- SVG Templates ---

function homeSvg(stats: Stats): string {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FAF8F5"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="#2D2A26"/>

  <!-- Ruled lines -->
  ${Array.from({ length: 18 }, (_, i) => `<line x1="60" y1="${80 + i * 32}" x2="${WIDTH - 60}" y2="${80 + i * 32}" stroke="#E7E5E4" stroke-width="0.5"/>`).join("\n  ")}

  <!-- Title -->
  <text x="80" y="200" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#2D2A26">
    500 episodes.
  </text>
  <text x="80" y="290" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#2D2A26">
    Zero fluff.
  </text>

  <!-- Subtitle -->
  <text x="80" y="360" font-family="Georgia, serif" font-size="24" fill="#78716C">
    The most structured founder knowledge database on the internet.
  </text>

  <!-- Stats -->
  <text x="80" y="430" font-family="monospace" font-size="20" fill="#A8A29E">
    ${stats.totalInsights} insights from ${stats.totalEpisodes} episodes
  </text>

  <!-- Branding -->
  <text x="80" y="560" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#2D2A26">
    Founder Playbooks
  </text>
  <text x="${WIDTH - 80}" y="560" font-family="monospace" font-size="18" fill="#A8A29E" text-anchor="end">
    founderplaybooks.com
  </text>
</svg>`;
}

function insightSvg(insight: Insight): string {
  const tag = TAG_COLORS[insight.tag] || TAG_COLORS.framework;
  const titleLines = wrapText(escapeXml(insight.title), 38, 3);
  const oneLinerLines = wrapText(escapeXml(insight.oneLiner), 55, 2);

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FAF8F5"/>
  <rect x="0" y="0" width="8" height="${HEIGHT}" fill="${tag.bg}"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${tag.bg}"/>

  <!-- Ruled lines -->
  ${Array.from({ length: 18 }, (_, i) => `<line x1="40" y1="${80 + i * 32}" x2="${WIDTH - 40}" y2="${80 + i * 32}" stroke="#E7E5E4" stroke-width="0.5"/>`).join("\n  ")}

  <!-- Tag pill -->
  <rect x="80" y="60" width="${tag.label.length * 14 + 32}" height="36" rx="18" fill="${tag.bg}"/>
  <text x="96" y="84" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${tag.text}">
    ${escapeXml(tag.label)}
  </text>

  <!-- Title -->
  ${titleLines.map((line, i) => `<text x="80" y="${160 + i * 64}" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#2D2A26">${line}</text>`).join("\n  ")}

  <!-- One-liner -->
  ${oneLinerLines.map((line, i) => `<text x="80" y="${160 + titleLines.length * 64 + 40 + i * 30}" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#78716C">${line}</text>`).join("\n  ")}

  <!-- Attribution -->
  <text x="80" y="540" font-family="monospace" font-size="16" fill="#A8A29E">
    ${insight.episodeData ? `Ep ${insight.episodeData.episodeNumber}` : ""}${insight.episodeData && insight.authorData ? " \u00B7 " : ""}${insight.authorData ? escapeXml(insight.authorData.name) : ""}
  </text>

  <!-- Branding -->
  <text x="80" y="590" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2D2A26">
    Founder Playbooks
  </text>
</svg>`;
}

function episodeSvg(episode: Episode): string {
  const titleLines = wrapText(escapeXml(episode.title), 40, 3);
  const tagSummary = Object.entries(episode.tagBreakdown)
    .map(([tag, count]) => `${count} ${TAG_COLORS[tag]?.label || tag}${count !== 1 ? "s" : ""}`)
    .join(" \u00B7 ");

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FAF8F5"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="#2D2A26"/>

  <!-- Ruled lines -->
  ${Array.from({ length: 18 }, (_, i) => `<line x1="40" y1="${80 + i * 32}" x2="${WIDTH - 40}" y2="${80 + i * 32}" stroke="#E7E5E4" stroke-width="0.5"/>`).join("\n  ")}

  <!-- Episode badge -->
  <rect x="80" y="60" width="${String(episode.episodeNumber).length * 14 + 50}" height="36" rx="6" fill="#F5F5F4"/>
  <text x="96" y="84" font-family="monospace" font-size="16" fill="#78716C">
    #${episode.episodeNumber}
  </text>
  <text x="${String(episode.episodeNumber).length * 14 + 140}" y="84" font-family="monospace" font-size="16" fill="#A8A29E">
    ${escapeXml(episode.date)} \u00B7 ${episode.insights.length} insights
  </text>

  <!-- Title -->
  ${titleLines.map((line, i) => `<text x="80" y="${160 + i * 60}" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#2D2A26">${line}</text>`).join("\n  ")}

  <!-- Tag breakdown -->
  <text x="80" y="${160 + titleLines.length * 60 + 40}" font-family="system-ui, sans-serif" font-size="18" fill="#78716C">
    ${escapeXml(truncate(tagSummary, 80))}
  </text>

  <!-- Branding -->
  <text x="80" y="570" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2D2A26">
    Founder Playbooks
  </text>
</svg>`;
}

function authorSvg(author: Author): string {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FAF8F5"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="#2D2A26"/>

  <!-- Ruled lines -->
  ${Array.from({ length: 18 }, (_, i) => `<line x1="40" y1="${80 + i * 32}" x2="${WIDTH - 40}" y2="${80 + i * 32}" stroke="#E7E5E4" stroke-width="0.5"/>`).join("\n  ")}

  <!-- Avatar circle -->
  <circle cx="140" cy="220" r="60" fill="#E7E5E4"/>
  <text x="140" y="240" font-family="Georgia, serif" font-size="48" fill="#A8A29E" text-anchor="middle">
    ${escapeXml(author.name.charAt(0))}
  </text>

  <!-- Name -->
  <text x="230" y="200" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#2D2A26">
    ${escapeXml(truncate(author.name, 30))}
  </text>

  <!-- Role -->
  <text x="230" y="240" font-family="monospace" font-size="20" fill="#78716C">
    ${escapeXml(author.role)}
  </text>

  <!-- Bio -->
  ${wrapText(escapeXml(author.bio), 60, 2).map((line, i) => `<text x="80" y="${340 + i * 30}" font-family="Georgia, serif" font-size="22" fill="#57534E">${line}</text>`).join("\n  ")}

  <!-- Stats -->
  <text x="80" y="460" font-family="monospace" font-size="18" fill="#A8A29E">
    ${author.insights.length} insights \u00B7 ${author.episodes.length} episodes
  </text>

  <!-- Branding -->
  <text x="80" y="570" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2D2A26">
    Founder Playbooks
  </text>
</svg>`;
}

function tagSvg(tagSlug: string, count: number): string {
  const tag = TAG_COLORS[tagSlug] || TAG_COLORS.framework;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FAF8F5"/>
  <rect x="0" y="0" width="${WIDTH}" height="120" fill="${tag.bg}" opacity="0.4"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${tag.bg}"/>

  <!-- Ruled lines -->
  ${Array.from({ length: 14 }, (_, i) => `<line x1="40" y1="${180 + i * 32}" x2="${WIDTH - 40}" y2="${180 + i * 32}" stroke="#E7E5E4" stroke-width="0.5"/>`).join("\n  ")}

  <!-- Tag pill -->
  <rect x="80" y="50" width="${tag.label.length * 16 + 40}" height="44" rx="22" fill="${tag.bg}"/>
  <text x="100" y="79" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="${tag.text}">
    ${escapeXml(tag.label)}
  </text>

  <!-- Title -->
  <text x="80" y="230" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#2D2A26">
    ${escapeXml(tag.label)}
  </text>

  <!-- Description -->
  <text x="80" y="290" font-family="Georgia, serif" font-size="24" fill="#78716C">
    ${escapeXml(TAG_COLORS[tagSlug]?.label ? `Browse ${count} ${tag.label.toLowerCase()} insights` : "")}
  </text>

  <!-- Stats -->
  <text x="80" y="370" font-family="monospace" font-size="20" fill="#A8A29E">
    ${count} insight${count !== 1 ? "s" : ""}
  </text>

  <!-- Branding -->
  <text x="80" y="570" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2D2A26">
    Founder Playbooks
  </text>
</svg>`;
}

// --- PNG Generation ---

async function svgToPng(svg: string, outputPath: string): Promise<void> {
  const png = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  fs.writeFileSync(outputPath, png);
}

function shouldGenerate(outputPath: string): boolean {
  if (force) return true;
  return !fs.existsSync(outputPath);
}

// --- Main ---

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load generated data
  const insights: Insight[] = JSON.parse(
    fs.readFileSync(path.join(GENERATED_DIR, "all-insights.json"), "utf-8")
  );
  const episodes: Episode[] = JSON.parse(
    fs.readFileSync(path.join(GENERATED_DIR, "all-episodes.json"), "utf-8")
  );
  const authors: Author[] = JSON.parse(
    fs.readFileSync(path.join(GENERATED_DIR, "all-authors.json"), "utf-8")
  );
  const stats: Stats = JSON.parse(
    fs.readFileSync(path.join(GENERATED_DIR, "stats.json"), "utf-8")
  );

  let generated = 0;
  let skipped = 0;

  // Home page
  const homePath = path.join(OUTPUT_DIR, "home.png");
  if (shouldGenerate(homePath)) {
    await svgToPng(homeSvg(stats), homePath);
    generated++;
    console.log("  \u2713 home.png");
  } else {
    skipped++;
  }

  // Insight pages
  for (const insight of insights) {
    const outPath = path.join(OUTPUT_DIR, `insight-${insight.slug}.png`);
    if (shouldGenerate(outPath)) {
      await svgToPng(insightSvg(insight), outPath);
      generated++;
      console.log(`  \u2713 insight-${insight.slug}.png`);
    } else {
      skipped++;
    }
  }

  // Episode pages
  for (const episode of episodes) {
    const outPath = path.join(OUTPUT_DIR, `episode-${episode.slug}.png`);
    if (shouldGenerate(outPath)) {
      await svgToPng(episodeSvg(episode), outPath);
      generated++;
      console.log(`  \u2713 episode-${episode.slug}.png`);
    } else {
      skipped++;
    }
  }

  // Author pages
  for (const author of authors) {
    const outPath = path.join(OUTPUT_DIR, `author-${author.slug}.png`);
    if (shouldGenerate(outPath)) {
      await svgToPng(authorSvg(author), outPath);
      generated++;
      console.log(`  \u2713 author-${author.slug}.png`);
    } else {
      skipped++;
    }
  }

  // Tag/explore pages
  for (const [tagSlug, meta] of Object.entries(TAG_COLORS)) {
    const count = stats.tagCounts[tagSlug] || 0;
    const outPath = path.join(OUTPUT_DIR, `explore-${tagSlug}.png`);
    if (shouldGenerate(outPath)) {
      await svgToPng(tagSvg(tagSlug, count), outPath);
      generated++;
      console.log(`  \u2713 explore-${tagSlug}.png`);
    } else {
      skipped++;
    }
  }

  console.log(
    `\nOG images: ${generated} generated, ${skipped} skipped (already exist)`
  );
  if (skipped > 0 && !force) {
    console.log("  Run with --force to regenerate all images");
  }
}

console.log("Generating OG images...");
main().catch(console.error);

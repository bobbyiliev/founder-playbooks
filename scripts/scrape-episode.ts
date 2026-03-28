/**
 * Episode Scraper for My First Million
 *
 * Usage:
 *   npx tsx scripts/scrape-episode.ts <episode-url-or-slug>
 *
 * Example:
 *   npx tsx scripts/scrape-episode.ts https://www.mfmpod.com/dhh-100m-advice-thatll-piss-off-every-business-guru/
 *   npx tsx scripts/scrape-episode.ts dhh-100m-advice-thatll-piss-off-every-business-guru
 *
 * What it does:
 *   1. Scrapes episode metadata from mfmpod.com (title, date, show notes, duration, ep number)
 *   2. Searches YouTube for the matching video and downloads auto-captions
 *   3. Cleans the VTT transcript into plain text
 *   4. Writes everything to scripts/.cache/<slug>/ for downstream processing
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "scripts", ".cache");
const YT_CHANNEL = "@MyFirstMillionPod";

interface EpisodeData {
  title: string;
  slug: string;
  episodeNumber: number | null;
  date: string;
  duration: string;
  description: string;
  showNotes: string;
  youtubeId: string;
  transcript: string;
  url: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugFromUrl(input: string): string {
  // Accept full URL or bare slug
  const match = input.match(
    /mfmpod\.com\/(?:my-first-million\/)?([^/?]+)\/?/
  );
  if (match) return match[1];
  // Strip trailing slash
  return input.replace(/\/$/, "").split("/").pop()!;
}

function fetchPage(url: string): string {
  return execSync(
    `curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`,
    { maxBuffer: 10 * 1024 * 1024 }
  ).toString();
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    // Find PodcastEpisode in @graph
    if (data["@graph"]) {
      return (
        data["@graph"].find(
          (item: Record<string, unknown>) =>
            item["@type"] === "PodcastEpisode"
        ) || null
      );
    }
    return data;
  } catch {
    return null;
  }
}

function extractShowNotes(html: string): string {
  // Get the show-notes tab content
  const match = html.match(
    /id="show-notes"[\s\S]*?<div class="post-content-body">([\s\S]*?)<\/div>/
  );
  if (!match) return "";

  // Strip HTML tags but keep text and newlines
  return match[1]
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractEpisodeNumber(text: string): number | null {
  // Try "Episode 809:" or "#809" pattern
  const match = text.match(/Episode\s+(\d+)|#(\d+)\s*[-:–]/);
  if (match) return parseInt(match[1] || match[2]);
  return null;
}

function parseDuration(isoDuration: string): string {
  // PT1H7M30S → "1h 7m"
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = match[1] ? `${match[1]}h ` : "";
  const minutes = match[2] ? `${match[2]}m` : "0m";
  return `${hours}${minutes}`.trim();
}

function searchYouTubeVideo(title: string): string | null {
  console.log("  Searching YouTube for matching video...");

  // Strategy 1: Fetch recent videos from the channel and fuzzy-match
  try {
    const result = execSync(
      `yt-dlp --flat-playlist --print "%(id)s\t%(title)s" "https://www.youtube.com/${YT_CHANNEL}/videos" --playlist-items 1-50 2>/dev/null`,
      { timeout: 60000 }
    ).toString();

    const lines = result.trim().split("\n");
    const titleLower = title.toLowerCase();
    // Extract key words from the episode title (skip short words)
    const keywords = titleLower
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    let bestMatch: { id: string; title: string; score: number } | null = null;

    for (const line of lines) {
      const tabIdx = line.indexOf("\t");
      if (tabIdx === -1) continue;
      const id = line.slice(0, tabIdx);
      const videoTitle = line.slice(tabIdx + 1);
      const videoLower = videoTitle.toLowerCase();

      // Score: count keyword matches
      const score = keywords.filter((kw) => videoLower.includes(kw)).length;
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id, title: videoTitle, score };
      }
    }

    if (bestMatch && bestMatch.score >= 2) {
      console.log(
        `  Found: "${bestMatch.title}" (${bestMatch.id}) [score: ${bestMatch.score}/${keywords.length}]`
      );
      return bestMatch.id;
    }
  } catch (e) {
    console.log("  Channel listing failed, trying search...");
  }

  // Strategy 2: YouTube search
  try {
    const result = execSync(
      `yt-dlp --flat-playlist --print "%(id)s\t%(title)s" "ytsearch3:My First Million ${title}" 2>/dev/null`,
      { timeout: 30000 }
    ).toString();

    const lines = result.trim().split("\n");
    for (const line of lines) {
      const [id, videoTitle] = line.split("\t");
      if (id && videoTitle) {
        console.log(`  Found via search: "${videoTitle}" (${id})`);
        return id;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function downloadTranscript(youtubeId: string, outputDir: string): string {
  console.log("  Downloading transcript...");
  const outPath = path.join(outputDir, "transcript");

  try {
    execSync(
      `yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "${outPath}" "https://www.youtube.com/watch?v=${youtubeId}" 2>/dev/null`,
      { timeout: 60000 }
    );

    const vttPath = `${outPath}.en.vtt`;
    if (fs.existsSync(vttPath)) {
      const vtt = fs.readFileSync(vttPath, "utf-8");
      return cleanVtt(vtt);
    }
  } catch {
    console.log("  Transcript download failed");
  }

  return "";
}

function cleanVtt(vtt: string): string {
  const lines = vtt.split("\n");
  const textLines: string[] = [];
  let lastLine = "";

  for (const line of lines) {
    // Skip WEBVTT header, timestamps, empty lines
    if (
      line.startsWith("WEBVTT") ||
      line.startsWith("Kind:") ||
      line.startsWith("Language:") ||
      line.match(/^\d{2}:\d{2}/) ||
      line.match(/^align:/) ||
      line.trim() === ""
    ) {
      continue;
    }

    // Strip VTT formatting tags
    let clean = line
      .replace(/<[^>]+>/g, "")
      .replace(/&gt;&gt;/g, ">>")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    // Skip duplicate lines (VTT repeats lines across cue boundaries)
    if (clean && clean !== lastLine) {
      textLines.push(clean);
      lastLine = clean;
    }
  }

  // Join and clean up
  return textLines
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .replace(/>> /g, "\n\n")
    .trim();
}

async function scrapeEpisode(input: string): Promise<EpisodeData> {
  const slug = slugFromUrl(input);
  const url = `https://www.mfmpod.com/${slug}/`;
  const episodeDir = path.join(CACHE_DIR, slug);
  ensureDir(episodeDir);

  console.log(`\nScraping: ${url}`);

  // 1. Fetch and parse episode page
  console.log("  Fetching episode page...");
  const html = fetchPage(url);
  fs.writeFileSync(path.join(episodeDir, "page.html"), html);

  // Extract JSON-LD structured data
  const jsonLd = extractJsonLd(html);
  const title = (jsonLd?.name as string) || slug;
  const datePublished = (jsonLd?.datePublished as string) || "";
  const date = datePublished ? datePublished.split("T")[0] : "";
  const isoDuration =
    (jsonLd?.timeRequired as string) || "";
  const duration = parseDuration(isoDuration);

  // Extract show notes
  const showNotes = extractShowNotes(html);

  // Extract episode number from show notes or title
  const episodeNumber =
    extractEpisodeNumber(showNotes) || extractEpisodeNumber(title);

  // Build description from first meaningful paragraph of show notes
  const descLines = showNotes.split("\n").filter((l) => l.length > 30);
  const description = descLines[0] || "";

  console.log(`  Title: ${title}`);
  console.log(`  Episode: #${episodeNumber || "?"}`);
  console.log(`  Date: ${date}`);
  console.log(`  Duration: ${duration}`);

  // 2. Find YouTube video
  const youtubeId = searchYouTubeVideo(title) || "";

  // 3. Download transcript
  let transcript = "";
  if (youtubeId) {
    transcript = downloadTranscript(youtubeId, episodeDir);
    console.log(
      `  Transcript: ${transcript.length} chars (${Math.round(transcript.length / 4)} tokens approx)`
    );
  } else {
    console.log("  No YouTube video found, skipping transcript");
  }

  const episodeData: EpisodeData = {
    title,
    slug,
    episodeNumber,
    date,
    duration,
    description,
    showNotes,
    youtubeId,
    transcript,
    url,
  };

  // Save to cache
  fs.writeFileSync(
    path.join(episodeDir, "episode.json"),
    JSON.stringify(episodeData, null, 2)
  );
  if (transcript) {
    fs.writeFileSync(path.join(episodeDir, "transcript.txt"), transcript);
  }
  fs.writeFileSync(path.join(episodeDir, "show-notes.txt"), showNotes);

  console.log(`  Cached to: scripts/.cache/${slug}/`);
  return episodeData;
}

// --- Main ---
const input = process.argv[2];
if (!input) {
  console.log("Usage: npx tsx scripts/scrape-episode.ts <episode-url-or-slug>");
  console.log(
    "Example: npx tsx scripts/scrape-episode.ts dhh-100m-advice-thatll-piss-off-every-business-guru"
  );
  process.exit(1);
}

scrapeEpisode(input).then((data) => {
  console.log("\n✓ Done! Episode data cached.");
  console.log(
    `  Next step: run 'npx tsx scripts/generate-insights.ts ${data.slug}' to generate insight MDX files`
  );
});

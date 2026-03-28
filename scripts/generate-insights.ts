/**
 * Insight Generator for Founder Playbooks
 *
 * Usage:
 *   npx tsx scripts/generate-insights.ts <episode-slug>
 *
 * This script:
 *   1. Reads the cached episode data from scripts/.cache/<slug>/
 *   2. Builds a prompt with the transcript and show notes
 *   3. Writes the prompt to scripts/.cache/<slug>/prompt.txt
 *   4. Also writes it to stdout so you can pipe it to Claude
 *
 * The idea: you run this, then paste the prompt into Claude Code (or pipe it)
 * and Claude generates the MDX files directly.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CACHE_DIR = path.join(process.cwd(), "scripts", ".cache");
const BOOKS_DIR = path.join(process.cwd(), "content", "books");

function getExistingBooks(): { slug: string; title: string; bookAuthor: string }[] {
  if (!fs.existsSync(BOOKS_DIR)) return [];
  return fs.readdirSync(BOOKS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BOOKS_DIR, f), "utf-8");
      const { data } = matter(raw);
      return {
        slug: data.slug as string,
        title: data.title as string,
        bookAuthor: data.bookAuthor as string,
      };
    });
}

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

function buildPrompt(episode: EpisodeData): string {
  // Truncate transcript if very long (keep first ~80k chars, roughly 20k tokens)
  const maxTranscriptChars = 80000;
  let transcript = episode.transcript;
  if (transcript.length > maxTranscriptChars) {
    transcript =
      transcript.slice(0, maxTranscriptChars) +
      "\n\n[... transcript truncated for length ...]";
  }

  return `You are an expert content analyst for Founder Playbooks — a site that extracts the best insights from podcast episodes and presents them as standalone insight cards.

I need you to analyze the following podcast episode and generate:

1. **An episode MDX file** with proper frontmatter
2. **Insight MDX files** — one per insight you extract (aim for 5-15 per episode)
3. **Author MDX files** for any guests mentioned (hosts Sam Parr and Shaan Puri already exist)

## Episode Metadata
- Title: ${episode.title}
- Slug: ${episode.slug}
- Episode Number: ${episode.episodeNumber || "UNKNOWN — please infer from show notes or title"}
- Date: ${episode.date}
- Duration: ${episode.duration}
- YouTube ID: ${episode.youtubeId}

## Show Notes
${episode.showNotes}

## Full Transcript
${transcript}

---

## Your Task

### Step 1: Identify the guest(s)
- From the show notes and transcript, identify who the guest is (if any).
- The hosts are always: shaan-puri (Shaan Puri) and sam-parr (Sam Parr)
- If there's a guest, create an author MDX file for them.

### Step 2: Create the episode MDX file
Write the file to: content/episodes/${episode.slug}.mdx

Frontmatter format:
\`\`\`yaml
---
title: "Episode title"
slug: ${episode.slug}
episodeNumber: NUMBER
date: "${episode.date}"
guest: guest-slug-here          # empty string if hosts-only
hosts: [shaan-puri, sam-parr]
description: "3-4 sentence summary of the episode."
duration: "${episode.duration}"
youtubeId: "${episode.youtubeId}"
spotifyUrl: ""
appleUrl: ""
coverImage: ""
---
\`\`\`

### Step 3: Extract insights
For each insight, identify:
- Which of the 8 categories it fits:
  - framework (mental models, repeatable systems, decision tools)
  - tactic (specific actionable moves you can steal today)
  - wild-story (crazy stories, unexpected outcomes, plot twists)
  - founder-psychology (mindset, habits, identity, fear, motivation)
  - big-mistake (failures, regrets, "don't do this" insights)
  - business-idea (untapped markets, emerging ideas, opportunities)
  - growth-distribution (growth tactics, virality, channels)
  - money-advice (pricing, fundraising, personal wealth)
- A compelling title (not generic — specific and intriguing)
- A one-liner (punchy, quotable, captures the essence)
- Who said it (source — the author slug)
- A slug for the insight

### Step 4: Write insight MDX files
Each insight file goes to: content/insights/{tag}--{slug}.mdx

Frontmatter format:
\`\`\`yaml
---
title: "Compelling Specific Title"
slug: insight-slug-here
tag: tag-name
episode: ${episode.slug}
source: author-slug
oneLiner: "Punchy one-liner."
---
\`\`\`

Body: 2-4 paragraphs that capture the insight in full. Write in the appropriate style for the tag type:
- **Wild Story**: Hook → Story → Twist → Lesson. Narrative prose, cinematic.
- **Framework**: Name → Problem → Model → Application. Structured, elegant.
- **Tactic**: What → How → Why → Example. Short, sharp, actionable.
- **Founder Psychology**: Belief → Pattern → Why → Shift. Reflective.
- **Big Mistake**: What happened → Why it seemed smart → What went wrong → Lesson.
- **Business Idea**: Opportunity → Why it works → Why others ignore it → How to start.
- **Growth & Distribution**: Channel → Mechanism → Execution → Risk.
- **Money Advice**: Principle → Why it compounds → Example → Application.

**Cardinal rule:** Only extract what was actually said. Never invent content. If a structural slot doesn't apply, skip it.

### Step 5: Author MDX files (for guests only)
Write to: content/authors/{slug}.mdx

\`\`\`yaml
---
name: "Full Name"
slug: slug
role: "Their main role/title"
bio: "1-2 sentences about who they are."
avatar: ""
twitter: ""
website: ""
isHost: false
---
\`\`\`

### Step 6: Extract book mentions
Scan the transcript and show notes for any books that are explicitly mentioned, recommended, or discussed. For each book, create a book MDX file.

**Only include books that are clearly named in the episode.** Do not infer or guess. Look for patterns like:
- "There's this book called..."
- "I read [title] by [author]..."
- "Have you read...?"
- Book titles mentioned in show notes links
- Direct recommendations ("you should read...", "one of my favorite books...")

Write to: content/books/{slug}.mdx

\`\`\`yaml
---
title: "Book Title"
slug: book-slug
bookAuthor: "Book Author Name"
coverImage: ""
description: "1-2 sentence description of the book and why it was mentioned."
amazonUrl: ""
mentions:
  - episode: ${episode.slug}
    recommendedBy: author-slug-who-mentioned-it
---
\`\`\`

**Important:** If a book already exists in the project (check the list below), do NOT create a new file for it. Instead, note that a new mention should be added to the existing file's \`mentions\` array.

Existing books (do not recreate — add new mentions to these instead):
${getExistingBooks().map((b) => `- ${b.slug} (${b.title} by ${b.bookAuthor})`).join("\n") || "- (none yet)"}

If no books are mentioned in this episode, that's fine — skip this step entirely.

---

## Output Format

Please output each file with a clear header showing the file path, then the complete file content. Format like:

### FILE: content/episodes/example.mdx
\`\`\`
(full file content)
\`\`\`

### FILE: content/insights/framework--example.mdx
\`\`\`
(full file content)
\`\`\`

### FILE: content/books/example.mdx
\`\`\`
(full file content)
\`\`\`

Generate ALL the files now.`;
}

// --- Main ---
const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npx tsx scripts/generate-insights.ts <episode-slug>");
  process.exit(1);
}

const episodeDir = path.join(CACHE_DIR, slug);
const episodePath = path.join(episodeDir, "episode.json");

if (!fs.existsSync(episodePath)) {
  console.error(
    `No cached data for "${slug}". Run scrape-episode.ts first.`
  );
  process.exit(1);
}

const episode: EpisodeData = JSON.parse(fs.readFileSync(episodePath, "utf-8"));
const prompt = buildPrompt(episode);

// Write prompt to cache
fs.writeFileSync(path.join(episodeDir, "prompt.txt"), prompt);

// Write prompt to stdout
console.log(prompt);

// Also log stats to stderr so they don't get mixed with the prompt
console.error(`\n--- Prompt Stats ---`);
console.error(`Episode: ${episode.title}`);
console.error(`Transcript length: ${episode.transcript.length} chars`);
console.error(`Prompt length: ${prompt.length} chars (~${Math.round(prompt.length / 4)} tokens)`);
console.error(`Prompt saved to: scripts/.cache/${slug}/prompt.txt`);
console.error(
  `\nNext: copy the prompt and paste it into Claude Code to generate the MDX files.`
);

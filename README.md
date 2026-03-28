# Founder Playbooks

**500 episodes. Zero fluff.**

The most structured founder knowledge database on the internet. We extract the best insights from podcast episodes (starting with My First Million) and present them as browsable, searchable, shareable cards organized by type.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with static export (`output: 'export'`)
- **Styling:** Tailwind CSS v4
- **Content:** MDX files with frontmatter, processed at build time
- **Search:** Client-side fuzzy search with fuse.js
- **Deployment:** Cloudflare Pages (fully static, no server)

## Project Structure

```
/
├── content/
│   ├── episodes/           # One .mdx per episode
│   ├── insights/           # One .mdx per insight card ({tag}--{slug}.mdx)
│   ├── authors/            # One .mdx per person
│   ├── books/              # One .mdx per book
│   └── .generated/         # Auto-generated JSON caches (committed to git)
├── scripts/
│   ├── build-content.ts    # Reads MDX, resolves relations, writes JSON
│   ├── scrape-episode.ts   # Scrapes episode data + YouTube transcript
│   └── generate-insights.ts # Builds a prompt for Claude to extract insights
├── app/                    # Next.js pages (App Router)
├── components/             # React components
└── lib/
    ├── content.ts          # Helpers to read generated JSON
    └── types.ts            # TypeScript types + tag metadata
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (auto-generates content JSON)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## How It Works

### Content Pipeline

All data lives in flat MDX files under `content/`. At build time, a script reads every file, resolves all relationships, and writes JSON caches that Next.js pages import.

```
MDX files  -->  build-content.ts  -->  .generated/*.json  -->  Next.js static pages
```

The build command (`npm run build`) runs this automatically:
1. `tsx scripts/build-content.ts` parses all MDX, resolves relations, writes JSON
2. `next build` generates static HTML from the JSON data

### The 8 Insight Categories

| Tag | Label | Description |
|-----|-------|-------------|
| `framework` | Framework | Mental models, repeatable systems, decision tools |
| `tactic` | Tactic | Specific actionable moves you can steal today |
| `wild-story` | Wild Story | Crazy stories, unexpected outcomes, plot twists |
| `founder-psychology` | Founder Psychology | Mindset, habits, identity, fear, motivation |
| `big-mistake` | Big Mistake | Failures, regrets, "don't do this" insights |
| `business-idea` | Business Idea | Untapped markets, emerging ideas, opportunities |
| `growth-distribution` | Growth & Distribution | Growth tactics, virality, channels |
| `money-advice` | Money Advice | Pricing, fundraising, personal wealth |

### Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with search, categories, latest episode |
| `/explore` | Browse by category |
| `/explore/[tag]` | All insights for a specific tag |
| `/insights` | All insights in one grid |
| `/insight/[slug]` | Individual insight card (full view) |
| `/episodes` | All episodes |
| `/episode/[slug]` | Episode page with all its insights |
| `/authors` | All hosts and guests |
| `/author/[slug]` | Author page with their insights and episodes |
| `/books` | Books recommended across episodes |
| `/about` | About the project |
| `/surprise` | Random insight redirect |

## Adding New Episodes

There's a two-step automation pipeline to add new episodes:

### Step 1: Scrape episode data

```bash
npx tsx scripts/scrape-episode.ts <episode-url-or-slug>
```

This scrapes the episode page from mfmpod.com and downloads the YouTube auto-captions:

```bash
# Using a full URL
npx tsx scripts/scrape-episode.ts https://www.mfmpod.com/dhh-100m-advice-thatll-piss-off-every-business-guru/

# Or just the slug
npx tsx scripts/scrape-episode.ts dhh-100m-advice-thatll-piss-off-every-business-guru
```

What it does:
1. Fetches the episode page and extracts metadata (title, date, duration, show notes) from HTML and JSON-LD
2. Searches the MFM YouTube channel for the matching video
3. Downloads auto-generated captions via `yt-dlp` and cleans them into plain text
4. Caches everything to `scripts/.cache/<slug>/`

**Requirements:** `yt-dlp` must be installed (`brew install yt-dlp`).

### Step 2: Generate insights with Claude

```bash
npx tsx scripts/generate-insights.ts <episode-slug>
```

This reads the cached episode data and builds a detailed prompt that you paste into Claude Code. The prompt includes:
- Full transcript
- Show notes
- Episode metadata
- Instructions for extracting insights into the correct MDX format

Claude then generates all the MDX files (episode, author, insights) which you write directly to the `content/` directory.

### Step 3: Rebuild

```bash
npm run build
```

This regenerates the JSON caches from all MDX files and builds the static site.

## Adding Content Manually

### New Insight

Create `content/insights/{tag}--{slug}.mdx`:

```yaml
---
title: "Your Insight Title"
slug: your-insight-slug
tag: framework
episode: episode-slug-here
source: author-slug-here
oneLiner: "A punchy one-liner."
---

Body content goes here. 2-4 paragraphs capturing the insight.
```

### New Episode

Create `content/episodes/{slug}.mdx`:

```yaml
---
title: "Episode Title"
slug: episode-slug
episodeNumber: 123
date: "2025-01-15"
guest: guest-author-slug
hosts: [shaan-puri, sam-parr]
description: "3-4 sentence summary."
duration: "1h 12m"
youtubeId: ""
spotifyUrl: ""
appleUrl: ""
coverImage: ""
---
```

### New Author

Create `content/authors/{slug}.mdx`:

```yaml
---
name: "Full Name"
slug: author-slug
role: "Their Role"
bio: "1-2 sentence bio."
avatar: ""
twitter: ""
website: ""
isHost: false
---
```

## Deployment (Cloudflare Pages)

Configure in Cloudflare Pages dashboard:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `out` |
| Node.js version | 22 |

The site is fully static — pure HTML/CSS/JS with no server-side code.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (generates content JSON first) |
| `npm run build` | Generate content JSON + build static site to `out/` |
| `npm run build-content` | Only regenerate the JSON caches |
| `npx tsx scripts/scrape-episode.ts <slug>` | Scrape an episode + download transcript |
| `npx tsx scripts/generate-insights.ts <slug>` | Generate a Claude prompt for insight extraction |

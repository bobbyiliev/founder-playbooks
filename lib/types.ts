export type TagSlug =
  | "framework"
  | "tactic"
  | "wild-story"
  | "founder-psychology"
  | "big-mistake"
  | "business-idea"
  | "growth-distribution"
  | "money-advice";

export interface TagMeta {
  slug: TagSlug;
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
}

export const TAG_META: Record<TagSlug, TagMeta> = {
  framework: {
    slug: "framework",
    label: "Framework",
    description: "Mental models, repeatable systems, decision tools",
    bgColor: "#E8D5B7",
    textColor: "#8B6914",
  },
  tactic: {
    slug: "tactic",
    label: "Tactic",
    description: "Specific actionable moves you can steal today",
    bgColor: "#D4E8D0",
    textColor: "#2D6A4F",
  },
  "wild-story": {
    slug: "wild-story",
    label: "Wild Story",
    description: "Crazy stories, unexpected outcomes, plot twists",
    bgColor: "#F5D5D5",
    textColor: "#9B2C2C",
  },
  "founder-psychology": {
    slug: "founder-psychology",
    label: "Founder Psychology",
    description: "Mindset, habits, identity, fear, motivation",
    bgColor: "#D5DCE8",
    textColor: "#2C5282",
  },
  "big-mistake": {
    slug: "big-mistake",
    label: "Big Mistake",
    description: "Failures, regrets, \"don't do this\" insights",
    bgColor: "#F5E0D0",
    textColor: "#C44D34",
  },
  "business-idea": {
    slug: "business-idea",
    label: "Business Idea",
    description: "Untapped markets, emerging ideas, undervalued opportunities",
    bgColor: "#E8E5D0",
    textColor: "#7B6B1A",
  },
  "growth-distribution": {
    slug: "growth-distribution",
    label: "Growth & Distribution",
    description: "Growth tactics, virality, guerrilla marketing, channels",
    bgColor: "#D0E8E5",
    textColor: "#1B6B5A",
  },
  "money-advice": {
    slug: "money-advice",
    label: "Money Advice",
    description: "Pricing, fundraising, personal wealth, financial independence",
    bgColor: "#E0D5E8",
    textColor: "#5B3A8A",
  },
};

export interface Insight {
  title: string;
  slug: string;
  tag: TagSlug;
  episode: string; // episode slug
  source: string; // author slug
  oneLiner: string;
  body: string;
  // Resolved at build time
  episodeData?: EpisodeMeta;
  authorData?: AuthorMeta;
}

export interface EpisodeMeta {
  title: string;
  slug: string;
  episodeNumber: number;
  date: string;
  guest: string;
  hosts: string[];
  description: string;
  duration: string;
  youtubeId: string;
  spotifyUrl: string;
  appleUrl: string;
  coverImage: string;
}

export interface EpisodeWithInsights extends EpisodeMeta {
  insights: Insight[];
  tagBreakdown: Partial<Record<TagSlug, number>>;
  books: BookMeta[];
}

export interface AuthorMeta {
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: string;
  twitter: string;
  website: string;
  isHost: boolean;
}

export interface AuthorWithRelations extends AuthorMeta {
  episodes: EpisodeMeta[];
  insights: Insight[];
  tagBreakdown: Partial<Record<TagSlug, number>>;
  booksRecommended: BookMeta[];
}

export interface BookMention {
  episode: string;
  recommendedBy: string;
  // Resolved
  episodeTitle?: string;
  recommenderName?: string;
}

export interface BookMeta {
  title: string;
  slug: string;
  bookAuthor: string;
  coverImage: string;
  description: string;
  amazonUrl: string;
  mentions: BookMention[];
  timesRecommended: number;
}

export interface SiteStats {
  totalInsights: number;
  totalEpisodes: number;
  tagCounts: Record<TagSlug, number>;
}

import { group, type SettingsMap } from "./cms-types";

export interface BlogSettings {
  listTitle: string;
  listIntro: string;
  postsPerPage: number;
  showBreadcrumbs: boolean;
  showCategories: boolean;
  showTags: boolean;
  showReadingTime: boolean;
  showAuthorBox: boolean;
  showToc: boolean;
  tocTitle: string;
  showRelated: boolean;
  relatedTitle: string;
  relatedCount: number;
  showFaq: boolean;
  faqTitle: string;
  showShare: boolean;
  categoryIntro: string;
  tagIntro: string;
  authorIntro: string;
  emptyText: string;
}

export const blogDefaults: BlogSettings = {
  listTitle: "The Journal",
  listIntro: "",
  postsPerPage: 9,
  showBreadcrumbs: true,
  showCategories: true,
  showTags: true,
  showReadingTime: true,
  showAuthorBox: true,
  showToc: true,
  tocTitle: "On this page",
  showRelated: true,
  relatedTitle: "Keep reading",
  relatedCount: 3,
  showFaq: true,
  faqTitle: "Frequently asked questions",
  showShare: true,
  categoryIntro: "All articles filed under {name}.",
  tagIntro: "Articles tagged {name}.",
  authorIntro: "Articles written by {name}.",
  emptyText: "No articles published yet.",
};

export function blogSettings(settings: SettingsMap) {
  return group(settings, "blog", blogDefaults);
}

export function slugifyTerm(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface BlogPostLike {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  cover_alt: string | null;
  category: string | null;
  subcategory?: string | null;
  author: string | null;
  author_slug?: string | null;
  tags: string[] | null;
  published_at: string | null;
  reading_time?: number | null;
}

export function authorSlug(post: { author_slug?: string | null; author?: string | null }) {
  return post.author_slug || (post.author ? slugifyTerm(post.author) : "");
}

/** Word-count fallback when an editor has not set a reading time. */
export function readingTime(post: { reading_time?: number | null; content?: string | null }) {
  if (post.reading_time && post.reading_time > 0) return post.reading_time;
  const words = String(post.content ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * Adds ids to h2/h3 headings in admin-authored HTML and returns the table of
 * contents. Plain-text content simply yields an empty TOC.
 */
export function withToc(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugifyTerm(text) || `section-${toc.length + 1}`;
    while (used.has(id)) id = `${id}-${toc.length + 1}`;
    used.add(id);
    toc.push({ id, text, level: Number(lvl) });
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}

export function isHtml(content: string) {
  return /<\/?(p|h[1-6]|ul|ol|li|div|blockquote|img|a|strong|em|table)\b/i.test(content);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Tag as TagIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CmsIcon } from "./Icon";
import { authorSlug, formatDate, readingTime, slugifyTerm, type BlogSettings } from "@/lib/blog";
import type { ButtonSettings } from "@/lib/buttons";

export interface BlogCardPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  cover_alt: string | null;
  category: string | null;
  author: string | null;
  author_slug?: string | null;
  tags: string[] | null;
  published_at: string | null;
  reading_time?: number | null;
}

export function BlogCard({
  post,
  blog,
  buttons,
}: {
  post: BlogCardPost;
  blog: BlogSettings;
  buttons: ButtonSettings;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.cover_alt ?? post.title}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="aspect-[16/10] w-full bg-muted" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {blog.showCategories && post.category ? (
            <Link to="/blog/category/$slug" params={{ slug: slugifyTerm(post.category) }}>
              <Badge variant="secondary" className="rounded-full">
                {post.category}
              </Badge>
            </Link>
          ) : null}
          {post.published_at ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDate(post.published_at)}
            </span>
          ) : null}
          {blog.showReadingTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {readingTime(post)} min read
            </span>
          ) : null}
        </div>
        <h3 className="font-heading text-lg leading-snug">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          {blog.showAuthorBox && post.author ? (
            <Link
              to="/blog/author/$slug"
              params={{ slug: authorSlug(post) }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <User className="size-3.5" aria-hidden />
              {post.author}
            </Link>
          ) : (
            <span />
          )}
          <Button asChild variant="ghost" size="sm" className="gap-1.5 px-2">
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              {buttons.readMoreLabel}
              {buttons.showIcons ? <CmsIcon name={buttons.readMoreIcon} className="size-4" /> : null}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function BlogTaxonomyBar({
  categories,
  tags,
  showTags,
}: {
  categories: string[];
  tags: string[];
  showTags: boolean;
}) {
  if (categories.length === 0 && tags.length === 0) return null;
  return (
    <div className="space-y-4 rounded-2xl border bg-muted/40 p-5">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</span>
          {categories.map((c) => (
            <Link key={c} to="/blog/category/$slug" params={{ slug: slugifyTerm(c) }}>
              <Badge variant="outline" className="rounded-full hover:bg-background">
                {c}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      {showTags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</span>
          {tags.map((t) => (
            <Link key={t} to="/blog/tag/$slug" params={{ slug: slugifyTerm(t) }}>
              <Badge variant="secondary" className="rounded-full gap-1">
                <TagIcon className="size-3" aria-hidden />
                {t}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Breadcrumbs({ trail }: { trail: Array<{ label: string; to?: string; params?: Record<string, string> }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.to ? (
              <Link
                to={item.to as never}
                {...(item.params ? { params: item.params as never } : {})}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {i < trail.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ExternalLink, Link2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, BlogCard } from "@/components/site/BlogList";
import { CtaSection } from "@/components/site/CtaSection";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { getBlogPost, getBlogPosts, getSettings } from "@/lib/cms.functions";
import { applyTemplate, buildMeta, jsonLd, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { authorSlug, blogSettings, formatDate, isHtml, readingTime, slugifyTerm, withToc } from "@/lib/blog";
import { buttonSettings } from "@/lib/buttons";
import { siteRouteApi } from "@/routes/_site";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ params }) => {
    const [settings, post, all] = await Promise.all([
      getSettings(),
      getBlogPost({ data: { slug: params.slug } }),
      getBlogPosts(),
    ]);
    if (!post) throw notFound();
    return { settings, post, all };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Article unavailable" }, { name: "robots", content: "noindex" }] };
    const seo = group(loaderData.settings, "seo", seoDefaults);
    const custom = (loaderData.post.seo ?? {}) as Record<string, string>;
    const title =
      custom["metaTitle"] ||
      applyTemplate(seo.titleTemplateBlog, { post_title: loaderData.post.title, site_name: seo.siteTitle });
    const description = custom["metaDescription"] || loaderData.post.excerpt || seo.defaultDescription;
    const base = buildMeta(loaderData.settings, {
      title,
      description,
      path: `/blog/${params.slug}`,
      image: loaderData.post.cover_image ?? undefined,
      type: "article",
      robots: custom["robots"],
    });
    const faqs = (loaderData.post.faqs ?? []) as Array<{ question: string; answer: string }>;
    const schemas: unknown[] = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: loaderData.post.title,
        description,
        image: loaderData.post.cover_image ?? undefined,
        datePublished: loaderData.post.published_at,
        author: loaderData.post.author ? { "@type": "Person", name: loaderData.post.author } : undefined,
      },
    ];
    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    if (custom["schema"]) {
      try {
        schemas.push(JSON.parse(custom["schema"]));
      } catch {
        /* admin-authored JSON may be mid-edit; ignore invalid values */
      }
    }
    return { ...base, scripts: schemas.map((s) => jsonLd(s as Record<string, unknown>)) };
  },
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block underline">
        Back to journal
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">This article could not be loaded</h1>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { settings, post, all } = Route.useLoaderData();
  const config = siteRouteApi.useLoaderData();
  const blog = blogSettings(settings);
  const buttons = buttonSettings(settings);

  const raw = String(post.content ?? "");
  const html = isHtml(raw) ? raw : "";
  const { html: bodyHtml, toc } = withToc(html);
  const showToc = blog.showToc && post.show_toc !== false && toc.length > 1;

  const faqs = (post.faqs ?? []) as Array<{ question: string; answer: string }>;
  const links = (post.links ?? []) as Array<{ label: string; url: string; external?: boolean }>;
  const relatedSlugs = (post.related_slugs ?? []) as string[];
  const related = (
    relatedSlugs.length > 0
      ? all.filter((p) => relatedSlugs.includes(p.slug) && p.slug !== post.slug)
      : all.filter((p) => p.slug !== post.slug && p.category === post.category)
  ).slice(0, Math.max(1, Number(blog.relatedCount) || 3));

  return (
    <>
      <article className="container-site py-12">
        {blog.showBreadcrumbs && post.show_breadcrumbs !== false ? (
          <Breadcrumbs
            trail={[
              { label: "Home", to: "/" },
              { label: blog.listTitle, to: "/blog" },
              ...(post.category
                ? [{ label: post.category, to: "/blog/category/$slug", params: { slug: slugifyTerm(post.category) } }]
                : []),
              { label: post.title },
            ]}
          />
        ) : null}

        <header className="mx-auto max-w-3xl space-y-4 text-center">
          {post.category ? (
            <Link to="/blog/category/$slug" params={{ slug: slugifyTerm(post.category) }}>
              <Badge className="rounded-full">{post.category}</Badge>
            </Link>
          ) : null}
          <h1 className="font-heading text-3xl leading-tight md:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="text-lg text-muted-foreground">{post.excerpt}</p> : null}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {post.author ? (
              <Link
                to="/blog/author/$slug"
                params={{ slug: authorSlug(post) }}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <User className="size-4" aria-hidden />
                {post.author}
              </Link>
            ) : null}
            {post.published_at ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {formatDate(post.published_at)}
              </span>
            ) : null}
            {blog.showReadingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {readingTime(post)} min read
              </span>
            ) : null}
          </div>
        </header>

        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.cover_alt ?? post.title}
            className="mx-auto mt-10 aspect-[16/8] w-full max-w-5xl rounded-3xl object-cover shadow-sm"
          />
        ) : null}

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr]">
          {showToc ? (
            <aside className="order-2 lg:order-1">
              <nav aria-label={blog.tocTitle} className="sticky top-28 rounded-2xl border bg-card/60 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {blog.tocTitle}
                </p>
                <ul className="space-y-2 text-sm">
                  {toc.map((t) => (
                    <li key={t.id} className={t.level === 3 ? "pl-3" : ""}>
                      <a href={`#${t.id}`} className="text-muted-foreground hover:text-foreground">
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          ) : null}

          <div className={showToc ? "order-1 min-w-0 lg:order-2" : "order-1 mx-auto min-w-0 max-w-3xl"}>
            {bodyHtml ? (
              <div
                className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <div className="whitespace-pre-line leading-relaxed">{raw}</div>
            )}

            {links.length > 0 && (
              <div className="mt-10 rounded-2xl border bg-muted/40 p-6">
                <h2 className="font-heading text-lg">Related links</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {links.map((l) => (
                    <li key={l.url}>
                      {l.external ? (
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                          {l.label}
                        </a>
                      ) : (
                        <a href={l.url} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          <Link2 className="size-4" aria-hidden />
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {blog.showTags && (post.tags ?? []).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {(post.tags as string[]).map((t) => (
                  <Link key={t} to="/blog/tag/$slug" params={{ slug: slugifyTerm(t) }}>
                    <Badge variant="secondary" className="rounded-full">
                      #{t}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {blog.showAuthorBox && post.author ? (
              <div className="mt-10 flex items-start gap-4 rounded-2xl border bg-card p-6">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author} className="size-14 rounded-full object-cover" />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-muted">
                    <User className="size-6 text-muted-foreground" aria-hidden />
                  </span>
                )}
                <div>
                  <p className="font-heading text-base">{post.author}</p>
                  {post.author_bio ? <p className="mt-1 text-sm text-muted-foreground">{post.author_bio}</p> : null}
                  <Link
                    to="/blog/author/$slug"
                    params={{ slug: authorSlug(post) }}
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    All posts by {post.author}
                  </Link>
                </div>
              </div>
            ) : null}

            {blog.showFaq && faqs.length > 0 ? (
              <section className="mt-12 space-y-4">
                <h2 className="font-heading text-2xl">{blog.faqTitle}</h2>
                <FaqAccordion items={faqs.map((f, i) => ({ id: `post-faq-${i}`, ...f }))} />
              </section>
            ) : null}
          </div>
        </div>

        {blog.showRelated && related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-6xl space-y-6">
            <h2 className="font-heading text-2xl">{blog.relatedTitle}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} blog={blog} buttons={buttons} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
      <CtaSection config={config} location="blog_post" />
    </>
  );
}

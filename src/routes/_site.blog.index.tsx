import { createFileRoute } from "@tanstack/react-router";
import { BlogCard, BlogTaxonomyBar, Breadcrumbs } from "@/components/site/BlogList";
import { CtaSection } from "@/components/site/CtaSection";
import { getBlogPosts, getSettings } from "@/lib/cms.functions";
import { buildMeta, jsonLd } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { blogSettings } from "@/lib/blog";
import { buttonSettings } from "@/lib/buttons";
import { siteRouteApi } from "@/routes/_site";

export const Route = createFileRoute("/_site/blog/")({
  loader: async () => {
    const [settings, posts] = await Promise.all([getSettings(), getBlogPosts()]);
    return { settings, posts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const blog = blogSettings(loaderData.settings);
    const base = buildMeta(loaderData.settings, {
      title: `${blog.listTitle} | ${store.name}`,
      description: blog.listIntro || `Stories, guides and product news from ${store.name}.`,
      path: "/blog",
      image: loaderData.posts[0]?.cover_image ?? undefined,
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: blog.listTitle,
          description: blog.listIntro,
          blogPost: loaderData.posts.slice(0, 10).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.published_at,
            author: p.author ? { "@type": "Person", name: p.author } : undefined,
          })),
        }),
      ],
    };
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { settings, posts } = Route.useLoaderData();
  const config = siteRouteApi.useLoaderData();
  const blog = blogSettings(settings);
  const buttons = buttonSettings(settings);
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]));
  const tags = Array.from(new Set(posts.flatMap((p) => (p.tags ?? []) as string[])));
  const list = posts.slice(0, Math.max(1, Number(blog.postsPerPage) || 9));

  return (
    <>
      <div className="container-site py-12 space-y-8">
        {blog.showBreadcrumbs ? <Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: blog.listTitle }]} /> : null}
        <header className="max-w-2xl">
          <h1 className="font-heading text-4xl">{blog.listTitle}</h1>
          {blog.listIntro ? <p className="mt-3 text-muted-foreground">{blog.listIntro}</p> : null}
        </header>
        <BlogTaxonomyBar categories={blog.showCategories ? categories : []} tags={tags} showTags={blog.showTags} />
        {list.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{blog.emptyText}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <BlogCard key={post.id} post={post} blog={blog} buttons={buttons} />
            ))}
          </div>
        )}
      </div>
      <CtaSection config={config} location="blog" />
    </>
  );
}

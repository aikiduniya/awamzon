import { createFileRoute, notFound } from "@tanstack/react-router";
import { CmsLink } from "@/components/site/CmsLink";
import { getBlogPost, getSettings } from "@/lib/cms.functions";
import { applyTemplate, buildMeta, jsonLd, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ params }) => {
    const [settings, post] = await Promise.all([getSettings(), getBlogPost({ data: { slug: params.slug } })]);
    if (!post) throw notFound();
    return { settings, post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Article unavailable" }, { name: "robots", content: "noindex" }] };
    const seo = group(loaderData.settings, "seo", seoDefaults);
    const custom = (loaderData.post.seo ?? {}) as Record<string, string>;
    const title = custom['metaTitle'] || applyTemplate(seo.titleTemplateBlog, {
      post_title: loaderData.post.title,
      site_name: seo.siteTitle,
    });
    const description = custom['metaDescription'] || loaderData.post.excerpt || seo.defaultDescription;
    const base = buildMeta(loaderData.settings, {
      title,
      description,
      path: `/blog/${params.slug}`,
      image: loaderData.post.cover_image ?? undefined,
      type: "article",
      robots: custom['robots'],
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData.post.title,
          description,
          datePublished: loaderData.post.published_at,
          author: loaderData.post.author ? { "@type": "Person", name: loaderData.post.author } : undefined,
        }),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">Article not found</h1>
      <CmsLink to="/blog" className="mt-4 inline-block underline">
        Back to journal
      </CmsLink>
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
  const { post } = Route.useLoaderData();
  return (
    <article className="container-site max-w-3xl py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <CmsLink to="/">Home</CmsLink> / <CmsLink to="/blog">Journal</CmsLink> / <span>{post.title}</span>
      </nav>
      <h1 className="text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {post.author ? `${post.author} · ` : ""}
        {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
      </p>
      {post.cover_image && (
        <img src={post.cover_image} alt={post.cover_alt ?? ""} className="mt-8 w-full rounded-xl object-cover" />
      )}
      <div className="mt-8 whitespace-pre-line leading-relaxed">{post.content}</div>
    </article>
  );
}

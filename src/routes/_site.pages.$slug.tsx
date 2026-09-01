import { createFileRoute, notFound } from "@tanstack/react-router";
import { CmsLink } from "@/components/site/CmsLink";
import { getPageBySlug, getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/_site/pages/$slug")({
  loader: async ({ params }) => {
    const [settings, page] = await Promise.all([getSettings(), getPageBySlug({ data: { slug: params.slug } })]);
    if (!page) throw notFound();
    return { settings, page };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Page unavailable" }, { name: "robots", content: "noindex" }] };
    const seo = (loaderData.page.seo ?? {}) as Record<string, string>;
    return buildMeta(loaderData.settings, {
      title: seo.metaTitle || loaderData.page.title,
      description: seo.metaDescription || loaderData.page.excerpt || "",
      path: `/pages/${params.slug}`,
      image: seo.ogImage,
      robots: seo.robots,
    });
  },
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">Page not found</h1>
      <CmsLink to="/" className="mt-4 inline-block underline">
        Go home
      </CmsLink>
    </div>
  ),
  errorComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">This page could not be loaded</h1>
    </div>
  ),
  component: CmsPage,
});

function CmsPage() {
  const { page } = Route.useLoaderData();
  return (
    <article className="container-site max-w-3xl py-12">
      <h1 className="text-4xl">{page.title}</h1>
      <div className="mt-8 whitespace-pre-line leading-relaxed">{page.content}</div>
    </article>
  );
}

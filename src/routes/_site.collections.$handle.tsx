import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { CmsLink } from "@/components/site/CmsLink";
import { getSettings } from "@/lib/cms.functions";
import { fetchCollection } from "@/lib/shopify";
import { applyTemplate, buildMeta, jsonLd, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { CtaSection } from "@/components/site/CtaSection";
import { siteRouteApi } from "@/routes/_site";

export const Route = createFileRoute("/_site/collections/$handle")({
  loader: async ({ params }) => {
    const [settings, collection] = await Promise.all([getSettings(), fetchCollection(params.handle)]);
    if (!collection) throw notFound();
    return { settings, collection };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Collection" }, { name: "robots", content: "noindex" }] };
    const seo = group(loaderData.settings, "seo", seoDefaults);
    const title = applyTemplate(seo.titleTemplateCollection, {
      collection_title: loaderData.collection.title,
      site_name: seo.siteTitle,
    });
    const description = (loaderData.collection.description || seo.defaultDescription).slice(0, 155);
    const base = buildMeta(loaderData.settings, {
      title,
      description,
      path: `/collections/${params.handle}`,
      image: loaderData.collection.image?.url,
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Shop", item: "/shop" },
            { "@type": "ListItem", position: 3, name: loaderData.collection.title },
          ],
        }),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">Collection not found</h1>
      <CmsLink to="/shop" className="mt-4 inline-block underline">
        Back to shop
      </CmsLink>
    </div>
  ),
  errorComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">This collection could not be loaded</h1>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const siteConfig = siteRouteApi.useLoaderData();
  const { settings, collection } = Route.useLoaderData();
  const messages = group(settings, "messages", { noProducts: "No products found" });

  return (
    <div className="container-site py-12 space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <CmsLink to="/">Home</CmsLink> / <CmsLink to="/shop">Shop</CmsLink> / <span>{collection.title}</span>
      </nav>
      <header className="space-y-2">
        <h1 className="text-4xl">{collection.title}</h1>
        {collection.description && <p className="max-w-2xl text-muted-foreground">{collection.description}</p>}
        <p className="text-sm text-muted-foreground">{collection.products.length} products</p>
      </header>
      {collection.products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{String(messages.noProducts)}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {collection.products.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
      <CtaSection config={siteConfig} location="collection" />

    </div>
  );
}

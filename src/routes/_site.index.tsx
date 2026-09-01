import { createFileRoute } from "@tanstack/react-router";
import { Sections } from "@/components/site/Sections";
import { getBlogPosts, getSiteConfig } from "@/lib/cms.functions";
import { fetchCollections, fetchProducts } from "@/lib/shopify";
import { buildMeta, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const config = await getSiteConfig();
    const shop = group(config.settings, "shop", { collectionQuery: "" });
    const [products, posts, collections] = await Promise.all([
      fetchProducts({ first: 50, query: String(shop.collectionQuery ?? "") }).catch(() => []),
      getBlogPosts().catch(() => []),
      fetchCollections(12).catch(() => []),
    ]);
    return { config, products, posts, collections };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Home" }] };
    const seo = group(loaderData.config.settings, "seo", seoDefaults);
    // Organization + WebSite JSON-LD is emitted once by the /_site layout.
    return buildMeta(loaderData.config.settings, {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      path: "/",
    });
  },
  component: Home,
});

function Home() {
  const { config, products, posts, collections } = Route.useLoaderData();
  const messages = group(config.settings, "messages", { noProducts: "No products found" });

  return (
    <Sections
      sections={config.sections}
      config={config}
      products={products}
      posts={posts}
      collections={collections}
      noProductsMessage={String(messages.noProducts)}
    />
  );
}

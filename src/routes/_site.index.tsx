import { createFileRoute } from "@tanstack/react-router";
import { Sections } from "@/components/site/Sections";
import { getBlogPosts, getSiteConfig } from "@/lib/cms.functions";
import { fetchProducts } from "@/lib/shopify";
import { buildMeta, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const config = await getSiteConfig();
    const shop = group(config.settings, "shop", { collectionQuery: "" });
    const [products, posts] = await Promise.all([
      fetchProducts({ first: 12, query: String(shop.collectionQuery ?? "") }).catch(() => []),
      getBlogPosts().catch(() => []),
    ]);
    return { config, products, posts };
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
  const { config, products, posts } = Route.useLoaderData();
  const messages = group(config.settings, "messages", { noProducts: "No products found" });

  return (
    <Sections
      sections={config.sections}
      config={config}
      products={products}
      posts={posts}
      noProductsMessage={String(messages.noProducts)}
    />
  );
}

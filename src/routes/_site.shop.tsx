import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSettings } from "@/lib/cms.functions";
import { fetchCollections, fetchProducts } from "@/lib/shopify";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { CmsLink } from "@/components/site/CmsLink";

export const Route = createFileRoute("/_site/shop")({
  loader: async () => {
    const settings = await getSettings();
    const shop = group(settings, "shop", { productsPerPage: 24, collectionQuery: "", defaultSort: "BEST_SELLING" });
    const [products, collections] = await Promise.all([
      fetchProducts({
        first: Number(shop.productsPerPage) || 24,
        query: String(shop.collectionQuery ?? ""),
        sortKey: String(shop.defaultSort ?? "BEST_SELLING"),
      }).catch(() => []),
      fetchCollections(12).catch(() => []),
    ]);
    return { settings, products, collections };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Shop" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    return buildMeta(loaderData.settings, {
      title: `Shop all | ${store.name}`,
      description: `Browse the full ${store.name} catalogue — new arrivals, bestsellers and everyday essentials.`,
      path: "/shop",
    });
  },
  component: Shop,
});

function Shop() {
  const { settings, products, collections } = Route.useLoaderData();
  const messages = group(settings, "messages", { noProducts: "No products found" });
  const [sort, setSort] = useState("featured");

  const sorted = [...products].sort((a, b) => {
    const pa = parseFloat(a.node.priceRange.minVariantPrice.amount);
    const pb = parseFloat(b.node.priceRange.minVariantPrice.amount);
    if (sort === "price-asc") return pa - pb;
    if (sort === "price-desc") return pb - pa;
    if (sort === "title") return a.node.title.localeCompare(b.node.title);
    return 0;
  });

  return (
    <div className="container-site py-12 space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <CmsLink to="/">Home</CmsLink> <span aria-hidden="true">/</span> <span>Shop</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Shop all</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <div className="w-48">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="title">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <CmsLink
              key={c.id}
              to={`/collections/${c.handle}`}
              className="rounded-full border px-4 py-1.5 text-sm hover:bg-muted"
            >
              {c.title}
            </CmsLink>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{String(messages.noProducts)}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

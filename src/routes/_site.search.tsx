import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { getSettings } from "@/lib/cms.functions";
import { fetchProducts } from "@/lib/shopify";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search.q ?? "") }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const settings = await getSettings();
    const term = deps.q.trim().slice(0, 100);
    const products = term
      ? await fetchProducts({ first: 48, query: `title:*${term}* OR tag:${term} OR product_type:${term}` }).catch(() => [])
      : [];
    return { settings, products, term };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Search" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    return buildMeta(loaderData.settings, {
      title: loaderData.term ? `Search: ${loaderData.term} | ${store.name}` : `Search | ${store.name}`,
      description: `Search the ${store.name} catalogue.`,
      path: "/search",
      robots: "noindex, follow",
    });
  },
  component: SearchPage,
});

function SearchPage() {
  const { settings, products, term } = Route.useLoaderData();
  const messages = group(settings, "messages", { noSearchResults: "No results matched your search" });

  return (
    <div className="container-site py-12 space-y-8">
      <h1 className="text-3xl">{term ? `Results for “${term}”` : "Search"}</h1>
      {term && <p className="text-sm text-muted-foreground">{products.length} products found</p>}
      {products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          {term ? String(messages.noSearchResults) : "Type a search term in the header to get started."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

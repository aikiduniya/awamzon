import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CmsLink } from "@/components/site/CmsLink";
import { ProductCard } from "@/components/site/ProductCard";
import { getSettings } from "@/lib/cms.functions";
import { fetchProductByHandle, fetchProducts, formatMoney } from "@/lib/shopify";
import { applyTemplate, buildMeta, jsonLd, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/_site/product/$handle")({
  loader: async ({ params }) => {
    const [settings, product] = await Promise.all([getSettings(), fetchProductByHandle(params.handle)]);
    if (!product) throw notFound();
    const related = await fetchProducts({ first: 4 }).catch(() => []);
    return { settings, product, related: related.filter((r) => r.node.handle !== params.handle).slice(0, 4) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Product unavailable" }, { name: "robots", content: "noindex" }] };
    const seo = group(loaderData.settings, "seo", seoDefaults);
    const node = loaderData.product.node;
    const title = applyTemplate(seo.titleTemplateProduct, {
      product_title: node.title,
      site_name: seo.siteTitle,
    });
    const description = node.description.slice(0, 155);
    const image = node.images.edges[0]?.node.url;
    const base = buildMeta(loaderData.settings, {
      title,
      description,
      path: `/product/${params.handle}`,
      image,
      type: "product",
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: node.title,
          description,
          image: image ? [image] : undefined,
          brand: node.vendor ? { "@type": "Brand", name: node.vendor } : undefined,
          offers: {
            "@type": "Offer",
            price: node.priceRange.minVariantPrice.amount,
            priceCurrency: node.priceRange.minVariantPrice.currencyCode,
            availability: node.variants.edges.some((v) => v.node.availableForSale)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }),
      ],
    };
  },
  errorComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">This product could not be loaded</h1>
      <p className="mt-2 text-muted-foreground">Please try again in a moment.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <h1 className="text-2xl">Product unavailable</h1>
      <CmsLink to="/shop" className="mt-4 inline-block underline">
        Back to shop
      </CmsLink>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { settings, product, related } = Route.useLoaderData();
  const node = product.node;
  const variants = node.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState(variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id);
  const [activeImage, setActiveImage] = useState(0);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const setOpen = useCartStore((s) => s.setOpen);
  const messages = group(settings, "messages", {});

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    toast.success("Added to cart", { position: "top-center" });
    setOpen(true);
  };

  return (
    <div className="container-site py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <CmsLink to="/">Home</CmsLink> / <CmsLink to="/shop">Shop</CmsLink> / <span>{node.title}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {node.images.edges[activeImage] ? (
              <img
                src={node.images.edges[activeImage].node.url}
                alt={node.images.edges[activeImage].node.altText ?? node.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {node.images.edges.length > 1 && (
            <div className="flex gap-2">
              {node.images.edges.map((img, i) => (
                <button
                  key={img.node.url}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded border ${i === activeImage ? "ring-2 ring-primary" : ""}`}
                >
                  <img src={img.node.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl">{node.title}</h1>
            {node.vendor && <p className="mt-1 text-sm text-muted-foreground">{node.vendor}</p>}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold">
              {variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : "—"}
            </span>
            {variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount) && (
              <span className="text-muted-foreground line-through">
                {formatMoney(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}
              </span>
            )}
          </div>

          {variants.length > 1 && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Options</legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.availableForSale}
                    className={`rounded-md border px-3 py-2 text-sm disabled:opacity-40 ${
                      v.id === variantId ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p className="text-sm text-muted-foreground">
            {variant?.availableForSale ? "In stock — ready to ship" : "Currently out of stock"}
          </p>

          <Button size="lg" className="w-full" onClick={handleAdd} disabled={isLoading || !variant?.availableForSale}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to cart"}
          </Button>

          <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground">{node.description}</div>
          {variant?.sku && <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>}
          {String(messages.shippingNote ?? "") && <p className="text-xs">{String(messages.shippingNote)}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 space-y-6">
          <h2 className="text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

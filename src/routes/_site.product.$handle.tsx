import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CmsLink } from "@/components/site/CmsLink";
import { CmsIcon } from "@/components/site/Icon";
import { CtaSection } from "@/components/site/CtaSection";
import { useSiteButtons } from "@/hooks/useSiteButtons";
import { siteRouteApi } from "@/routes/_site";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { getSettings } from "@/lib/cms.functions";
import { fetchProductByHandle, fetchProducts, formatMoney } from "@/lib/shopify";
import { applyTemplate, buildMeta, jsonLd, seoDefaults } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export const Route = createFileRoute("/_site/product/$handle")({
  loader: async ({ params }) => {
    const [settings, product] = await Promise.all([getSettings(), fetchProductByHandle(params.handle)]);
    if (!product) throw notFound();
    const related = await fetchProducts({ first: 12 }).catch(() => []);
    return { settings, product, related: related.filter((r) => r.node.handle !== params.handle).slice(0, 8) };
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
  const images = node.images.edges.map((e) => e.node);
  const variants = node.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState(variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const buttons = useSiteButtons();
  const siteConfig = siteRouteApi.useLoaderData();
  const [zoomOpen, setZoomOpen] = useState(false);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const setOpen = useCartStore((s) => s.setOpen);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.handles).includes(node.handle);
  const messages = group(settings, "messages", { shippingNote: "" });
  const flags = group(settings, "features", { wishlist: true, reviews: true });
  const video = group(settings, "shop", { productVideo: "" });

  const compareAt = variant?.compareAtPrice;
  const discount =
    compareAt && variant && parseFloat(compareAt.amount) > parseFloat(variant.price.amount)
      ? Math.round((1 - parseFloat(variant.price.amount) / parseFloat(compareAt.amount)) * 100)
      : 0;
  const stock = variant?.quantityAvailable ?? null;

  const addToCart = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: qty,
      selectedOptions: variant.selectedOptions ?? [],
    });
  };

  const handleAdd = async () => {
    await addToCart();
    toast.success("Added to cart", { position: "top-center" });
    setOpen(true);
  };

  const handleBuyNow = async () => {
    await addToCart();
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
    else toast.error("Checkout is unavailable right now", { position: "top-center" });
  };

  return (
    <div className="container-site py-10">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CmsLink to="/" className="hover:text-foreground">
          Home
        </CmsLink>
        <ChevronRight className="size-3.5" aria-hidden />
        <CmsLink to="/shop" className="hover:text-foreground">
          Shop
        </CmsLink>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{node.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Zoom image"
            className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-muted"
          >
            {images[activeImage] ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].altText ?? node.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                fetchPriority="high"
              />
            ) : null}
            {discount > 0 ? (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                −{discount}%
              </span>
            ) : null}
            <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-background/90 shadow-md">
              <ZoomIn className="size-4" aria-hidden />
            </span>
          </button>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`aspect-square overflow-hidden rounded-lg border transition ${
                    i === activeImage ? "ring-2 ring-primary" : "hover:border-foreground/30"
                  }`}
                >
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {String(video.productVideo ?? "") ? (
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe
                src={String(video.productVideo)}
                title={`${node.title} video`}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div>
            {node.vendor && (
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{node.vendor}</p>
            )}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{node.title}</h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold">
              {variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : "—"}
            </span>
            {discount > 0 && compareAt ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatMoney(compareAt.amount, compareAt.currencyCode)}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Save {discount}%
                </span>
              </>
            ) : null}
          </div>

          {variants.length > 1 && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                {node.options[0]?.name ?? "Options"}
                {variant ? <span className="ml-1 text-muted-foreground">· {variant.title}</span> : null}
              </legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.availableForSale}
                    className={`rounded-lg border px-4 py-2 text-sm transition disabled:line-through disabled:opacity-40 ${
                      v.id === variantId ? "border-primary bg-primary/5 font-medium" : "hover:border-foreground/40"
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p className="flex items-center gap-2 text-sm">
            {variant?.availableForSale ? (
              <>
                <Check className="size-4 text-primary" aria-hidden />
                <span className="text-muted-foreground">
                  In stock{typeof stock === "number" && stock > 0 && stock < 10 ? ` — only ${stock} left` : " — ready to ship"}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Currently out of stock</span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button className="px-3 py-2.5" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
              <button className="px-3 py-2.5" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 gap-1.5"
              onClick={handleAdd}
              disabled={isLoading || !variant?.availableForSale}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : buttons.showIcons ? (
                <CmsIcon name={buttons.addToCartIcon} className="size-4" />
              ) : null}
              {buttons.addToCartLabel}
            </Button>
            {flags.wishlist !== false ? (
              <Button
                size="lg"
                variant="outline"
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => {
                  const added = toggleWish(node.handle);
                  toast.success(added ? "Saved to wishlist" : "Removed from wishlist", { position: "top-center" });
                }}
              >
                <Heart className={wished ? "size-4 fill-primary text-primary" : "size-4"} aria-hidden />
              </Button>
            ) : null}
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="w-full gap-1.5"
            onClick={handleBuyNow}
            disabled={isLoading || !variant?.availableForSale}
          >
            {buttons.showIcons ? <CmsIcon name={buttons.buyNowIcon} className="size-4" /> : null}
            {buttons.buyNowLabel}
          </Button>

          <ul className="grid gap-3 rounded-2xl border bg-muted/40 p-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-primary" aria-hidden /> Fast delivery
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw className="size-4 text-primary" aria-hidden /> Easy returns
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden /> Secure checkout
            </li>
          </ul>

          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: node.descriptionHtml || node.description }}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger>Product details</AccordionTrigger>
              <AccordionContent className="space-y-1 text-sm text-muted-foreground">
                {variant?.sku ? <p>SKU: {variant.sku}</p> : null}
                {node.vendor ? <p>Brand: {node.vendor}</p> : null}
                {node.tags && node.tags.length > 0 ? <p>Tags: {node.tags.join(", ")}</p> : null}
                {String(messages.shippingNote ?? "") ? <p>{String(messages.shippingNote)}</p> : null}
              </AccordionContent>
            </AccordionItem>
            {flags.reviews !== false ? (
              <AccordionItem value="reviews">
                <AccordionTrigger>Reviews</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center gap-3 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                    <Star className="size-5" aria-hidden />
                    No reviews yet. Verified customer reviews will appear here once collected.
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : null}
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <ProductCarousel
            products={related}
            eyebrow="Recommended"
            heading="You may also like"
            linkTo="/shop"
            linkLabel={buttons.viewAllLabel}
          />
        </section>
      )}

      <CtaSection config={siteConfig} location="product" className="mt-16" />

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{node.title}</DialogTitle>
          {images[activeImage] ? (
            <img
              src={images[activeImage].url}
              alt={images[activeImage].altText ?? node.title}
              className="max-h-[85vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}


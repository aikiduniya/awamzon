import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuickViewDialog } from "./QuickViewDialog";
import { CmsIcon } from "./Icon";
import { useSiteButtons } from "@/hooks/useSiteButtons";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";

export interface ProductCardFeatures {
  wishlist?: boolean;
  quickView?: boolean;
}

export function ProductCard({
  product,
  features,
  priority = false,
}: {
  product: ShopifyProduct;
  features?: ProductCardFeatures | undefined;
  priority?: boolean | undefined;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const pending = useCartStore((s) => s.pending);
  const setOpen = useCartStore((s) => s.setOpen);

  const toggleWish = useWishlistStore((s) => s.toggle);
  const wishHandles = useWishlistStore((s) => s.handles);
  const [quickOpen, setQuickOpen] = useState(false);
  const buttons = useSiteButtons();

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node;
  const variant = node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const compareAt = variant?.compareAtPrice;
  const tags = node.tags ?? [];
  const wished = wishHandles.includes(node.handle);
  const soldOut = Boolean(variant) && !variant?.availableForSale;

  const discount =
    compareAt && variant && parseFloat(compareAt.amount) > parseFloat(variant.price.amount)
      ? Math.round((1 - parseFloat(variant.price.amount) / parseFloat(compareAt.amount)) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
    setOpen(true);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
        aria-label={node.title}
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "h-full w-full object-cover transition-all duration-700",
              hoverImage ? "group-hover:scale-105 group-hover:opacity-0" : "group-hover:scale-105",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}
        {hoverImage ? (
          <img
            src={hoverImage.url}
            alt=""
            loading="lazy"
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
              −{discount}%
            </span>
          ) : null}
          {tags.includes("new-arrival") ? (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-sm">
              New
            </span>
          ) : null}
          {tags.includes("bestseller") ? (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold shadow-sm">
              Best seller
            </span>
          ) : null}
        </div>

        {soldOut ? (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-2 text-center text-xs font-semibold uppercase tracking-wide text-background">
            Sold out
          </span>
        ) : null}
      </Link>

      <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
        {features?.wishlist !== false ? (
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wished}
            onClick={() => {
              const added = toggleWish(node.handle);
              toast.success(added ? "Saved to wishlist" : "Removed from wishlist", { position: "top-center" });
            }}
            className="pointer-events-auto grid size-9 place-items-center rounded-full bg-background/95 shadow-md transition-colors hover:bg-background"
          >
            <Heart className={cn("size-4", wished && "fill-primary text-primary")} aria-hidden />
          </button>
        ) : null}
        {features?.quickView !== false ? (
          <button
            type="button"
            aria-label={`${buttons.quickViewLabel} ${node.title}`}
            onClick={() => setQuickOpen(true)}
            className="pointer-events-auto grid size-9 place-items-center rounded-full bg-background/95 shadow-md transition-colors hover:bg-background"
          >
            <CmsIcon name={buttons.quickViewIcon || "Eye"} className="size-4" />
          </button>
        ) : null}

      </div>

      <div className="flex flex-1 flex-col p-4">
        {node.vendor ? (
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{node.vendor}</p>
        ) : null}
        <Link
          to="/product/$handle"
          params={{ handle: node.handle }}
          className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-primary"
        >
          {node.title}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold">
            {formatMoney(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
          </span>
          {discount > 0 && compareAt ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(compareAt.amount, compareAt.currencyCode)}
            </span>
          ) : null}
        </div>
        {node.options.length > 0 && node.options[0] && node.options[0].values.length > 1 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {node.options[0].values.length} {node.options[0].name.toLowerCase()} options
          </p>
        ) : null}
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || !variant || soldOut}
          variant="secondary"
          className="mt-4 w-full gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : soldOut ? (
            "Out of stock"
          ) : (
            <>
              {buttons.showIcons ? <CmsIcon name={buttons.addToCartIcon} className="size-4" /> : null}
              {buttons.addToCartLabel}
            </>
          )}
        </Button>

      </div>

      {features?.quickView !== false ? (
        <QuickViewDialog product={product} open={quickOpen} onOpenChange={setQuickOpen} />
      ) : null}
    </article>
  );
}

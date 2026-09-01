import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const setOpen = useCartStore((s) => s.setOpen);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const variant = node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const compareAt = variant?.compareAtPrice;

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

  const onSale =
    compareAt && variant && parseFloat(compareAt.amount) > parseFloat(variant.price.amount)
      ? Math.round((1 - parseFloat(variant.price.amount) / parseFloat(compareAt.amount)) * 100)
      : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}
        {onSale > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
            −{onSale}%
          </span>
        ) : null}
        {variant && !variant.availableForSale ? (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link
          to="/product/$handle"
          params={{ handle: node.handle }}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {node.title}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold">
            {formatMoney(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
          </span>
          {onSale > 0 && compareAt ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(compareAt.amount, compareAt.currencyCode)}
            </span>
          ) : null}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || !variant || !variant.availableForSale}
          variant="secondary"
          className="mt-3 w-full gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : variant?.availableForSale ? (
            <>
              <ShoppingBag className="size-4" aria-hidden /> Add to cart
            </>
          ) : (
            "Out of stock"
          )}
        </Button>
      </div>
    </article>
  );
}


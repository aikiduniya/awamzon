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

  return (
    <article className="group flex flex-col">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="block overflow-hidden rounded-lg bg-muted aspect-[4/5]"
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
      </Link>
      <div className="mt-3 flex flex-col gap-1">
        <Link to="/product/$handle" params={{ handle: node.handle }} className="font-medium leading-snug hover:underline">
          {node.title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">
            {formatMoney(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
          </span>
          {compareAt && parseFloat(compareAt.amount) > parseFloat(variant!.price.amount) && (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(compareAt.amount, compareAt.currencyCode)}
            </span>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || !variant || !variant.availableForSale}
          variant="secondary"
          className="mt-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : variant?.availableForSale ? (
            "Add to cart"
          ) : (
            "Out of stock"
          )}
        </Button>
      </div>
    </article>
  );
}

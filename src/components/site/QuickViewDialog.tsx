import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { CmsIcon } from "./Icon";
import { useSiteButtons } from "@/hooks/useSiteButtons";
import { useCartStore } from "@/stores/cartStore";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: ShopifyProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const node = product.node;
  const variants = node.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState(variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id);
  const [qty, setQty] = useState(1);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const image = node.images.edges[0]?.node;

  const add = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: qty,
      selectedOptions: variant.selectedOptions ?? [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
    onOpenChange(false);
    setCartOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="aspect-square bg-muted">
            {image ? (
              <img src={image.url} alt={image.altText ?? node.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-4 p-6">
            <div>
              {node.vendor ? <p className="text-xs uppercase tracking-wide text-muted-foreground">{node.vendor}</p> : null}
              <DialogTitle className="text-xl leading-tight">{node.title}</DialogTitle>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">
                {variant ? formatMoney(variant.price.amount, variant.price.currencyCode) : "—"}
              </span>
              {variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount) ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoney(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}
                </span>
              ) : null}
            </div>
            <DialogDescription className="line-clamp-4">{node.description}</DialogDescription>

            {variants.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.availableForSale}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors disabled:opacity-40 ${
                      v.id === variantId ? "border-primary bg-primary/5 font-medium" : "hover:border-foreground/30"
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border">
                <button className="px-2 py-2" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
                <button className="px-2 py-2" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                  <Plus className="size-3.5" />
                </button>
              </div>
              <Button onClick={add} disabled={isLoading || !variant?.availableForSale} className="flex-1 gap-1.5">
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : buttons.showIcons ? (
                  <CmsIcon name={buttons.addToCartIcon} className="size-4" />
                ) : null}
                {variant?.availableForSale ? buttons.addToCartLabel : "Out of stock"}
              </Button>
            </div>

            <Button asChild variant="ghost" size="sm" className="gap-1 px-0">
              <Link to="/product/$handle" params={{ handle: node.handle }} onClick={() => onOpenChange(false)}>
                View full details <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

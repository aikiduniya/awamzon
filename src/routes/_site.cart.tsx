import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsLink } from "@/components/site/CmsLink";
import { CmsIcon } from "@/components/site/Icon";
import { CtaSection } from "@/components/site/CtaSection";
import { useSiteButtons } from "@/hooks/useSiteButtons";
import { siteRouteApi } from "@/routes/_site";
import { getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { formatMoney } from "@/lib/shopify";
import { useMoney } from "@/lib/currency";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/_site/cart")({
  loader: () => getSettings(),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Cart" }] };
    const store = group(loaderData, "store", { name: "Store" });
    return buildMeta(loaderData, {
      title: `Your cart | ${store.name}`,
      description: "Review the items in your cart before checking out securely with Shopify.",
      path: "/cart",
      robots: "noindex, follow",
    });
  },
  component: CartPage,
});

function CartPage() {
  const settings = Route.useLoaderData();
  const messages = group(settings, "messages", { emptyCart: "Your cart is empty" });
  const money = useMoney();
  const { items, isLoading, updateQuantity, removeItem, getCheckoutUrl } = useCartStore();
  const buttons = useSiteButtons();
  const config = siteRouteApi.useLoaderData();
  const total = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="container-site py-12">
      <h1 className="mb-8 text-3xl">Your cart</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{String(messages.emptyCart)}</p>
          <Button asChild className="mt-6 gap-2" size="lg">
            <CmsLink to="/shop">
              {buttons.showIcons ? <CmsIcon name={buttons.continueShoppingIcon} className="size-4" /> : null}
              {buttons.continueShoppingLabel}
            </CmsLink>
          </Button>
          <CtaSection config={config} location="cart_empty" className="mt-14 text-left" />
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          <ul className="lg:col-span-2 divide-y">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 py-5">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                  {item.product.node.images.edges[0] && (
                    <img
                      src={item.product.node.images.edges[0].node.url}
                      alt={item.product.node.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-medium">{item.product.node.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.selectedOptions.map((o) => o.value).join(" • ")}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.variantId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="font-semibold">{money(parseFloat(item.price.amount) * item.quantity, currency)}</div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border p-6">
            <h2 className="text-lg font-medium">Order summary</h2>
            <div className="mt-4 flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{money(total, currency)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Taxes, shipping and discounts are applied at checkout.</p>
            <Button className="mt-5 w-full" size="lg" onClick={checkout} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {buttons.showIcons ? <CmsIcon name={buttons.checkoutIcon} className="mr-2 size-4" /> : null}
                  {buttons.checkoutLabel}
                </>
              )}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}

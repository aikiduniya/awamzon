import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CmsLink } from "./CmsLink";
import { CmsIcon } from "./Icon";
import { ArrowRight, ChevronDown, Heart, Menu, Search, Truck, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./CartDrawer";
import { useWishlistStore } from "@/stores/wishlistStore";
import { group, type SiteConfig, type StoreSettings } from "@/lib/cms-types";



const storeDefaults: StoreSettings = {
  name: "Store",
  tagline: "",
  logoUrl: "",
  logoText: "STORE",
  faviconUrl: "",
  email: "",
  phone: "",
  address: "",
  currencyNote: "",
};

export function SiteHeader({ config }: { config: SiteConfig }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const wishlistCount = useWishlistStore((s) => s.handles.length);

  const store = group(config.settings, "store", storeDefaults);
  const header = group(config.settings, "header", {
    sticky: true,
    showSearch: true,
    showAccount: true,
    showCart: true,
    showWishlist: true,
    showIcons: true,
    megaMenu: true,
    activeUnderline: true,
    topBarEnabled: false,
    topBarText: "",
    logoHeight: "32px",
  });

  const announcement = group(config.settings, "announcement", {
    enabled: false,
    text: "",
    link: "",
    background: "var(--foreground)",
    color: "var(--background)",
    dismissible: true,
  });
  const messages = group(config.settings, "messages", {
    emptyCart: "Your cart is empty",
    searchPlaceholder: "Search products...",
  });
  const features = group(config.settings, "features", { search: true });
  const shop = group(config.settings, "shop", { freeShippingThreshold: 0, showFreeShippingBar: false });

  const headerItems = config.menus.filter((m) => m.location === "header");
  const nav = headerItems.filter((m) => !m.column_group);
  const megaGroups = headerItems
    .filter((m) => Boolean(m.column_group))
    .reduce<Record<string, typeof headerItems>>((acc, item) => {
      const key = item.column_group as string;
      (acc[key] ||= []).push(item);
      return acc;
    }, {});

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate({ to: "/search", search: { q } });
    setMobileOpen(false);
  };

  return (
    <>
      {announcement.enabled && announcement.text && !dismissed && (
        <div
          className="text-center text-sm py-2 px-4 relative"
          style={{ background: announcement.background, color: announcement.color }}
        >
          {announcement.link ? (
            <CmsLink to={announcement.link as string} className="underline-offset-4 hover:underline">
              {announcement.text as string}
            </CmsLink>
          ) : (
            announcement.text
          )}
          {announcement.dismissible && (
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <header className={`${header.sticky ? "sticky top-0 z-40" : ""} border-b bg-background/90 backdrop-blur-md`}>
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} style={{ height: header.logoHeight as string }} />
              ) : (
                <span className="font-heading text-xl font-semibold tracking-tight">{store.logoText || store.name}</span>
              )}
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {nav.map((item) => {
              const children = megaGroups[item.label] ?? [];
              return (
                <div key={item.id} className="group/nav relative">
                  <CmsLink
                    to={item.url}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                    {children.length > 0 ? (
                      <ChevronDown className="size-3.5 transition-transform group-hover/nav:rotate-180" aria-hidden />
                    ) : null}
                  </CmsLink>
                  {children.length > 0 ? (
                    <div className="invisible absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100">
                      <div className="rounded-2xl border bg-popover p-6 shadow-2xl">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                          {children.map((child) => (
                            <CmsLink
                              key={child.id}
                              to={child.url}
                              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                            >
                              {child.label}
                              <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover/nav:opacity-40" aria-hidden />
                            </CmsLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            {header.showSearch && features.search && (
              <form onSubmit={submitSearch} className="hidden items-center lg:flex">
                <label htmlFor="header-search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="header-search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder={messages.searchPlaceholder as string}
                    className="h-9 w-52 rounded-full pl-9"
                  />
                </div>
                <Button type="submit" variant="ghost" size="icon" aria-label="Search">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            )}
            {header.showAccount && (
              <Button variant="ghost" size="icon" asChild aria-label="Account">
                <Link to="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {header.showCart && (
              <CartDrawer
                emptyMessage={messages.emptyCart as string}
                freeShippingThreshold={Number(shop.freeShippingThreshold) || 0}
                showFreeShippingBar={Boolean(shop.showFreeShippingBar)}
              />
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t md:hidden">
            <nav className="container-site flex flex-col py-3" aria-label="Mobile navigation">
              {nav.map((item) => (
                <div key={item.id}>
                  <CmsLink to={item.url} className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </CmsLink>
                  {(megaGroups[item.label] ?? []).map((child) => (
                    <CmsLink
                      key={child.id}
                      to={child.url}
                      className="block py-1.5 pl-4 text-sm text-muted-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </CmsLink>
                  ))}
                </div>
              ))}
              {features.search && (
                <form onSubmit={submitSearch} className="flex gap-2 pt-3">
                  <Input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder={messages.searchPlaceholder as string}
                    aria-label="Search products"
                  />
                  <Button type="submit" size="icon" aria-label="Search">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </nav>
          </div>
        )}
      </header>

    </>
  );
}

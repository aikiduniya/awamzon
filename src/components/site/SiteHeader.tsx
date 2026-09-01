import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./CartDrawer";
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

  const store = group(config.settings, "store", storeDefaults);
  const header = group(config.settings, "header", {
    sticky: true,
    showSearch: true,
    showAccount: true,
    showCart: true,
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

  const nav = config.menus.filter((m) => m.location === "header");

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
            <Link to={announcement.link as string} className="underline-offset-4 hover:underline">
              {announcement.text}
            </Link>
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

      <header className={`${header.sticky ? "sticky top-0 z-40" : ""} border-b bg-background/95 backdrop-blur`}>
        <div className="container-site flex items-center justify-between gap-4 h-16">
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
                <span className="font-heading text-xl tracking-tight">{store.logoText || store.name}</span>
              )}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {nav.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className="text-sm hover:text-primary transition-colors"
                activeProps={{ className: "text-sm text-primary font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {header.showSearch && features.search && (
              <form onSubmit={submitSearch} className="hidden lg:flex items-center">
                <label htmlFor="header-search" className="sr-only">
                  Search
                </label>
                <Input
                  id="header-search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={messages.searchPlaceholder as string}
                  className="h-9 w-48"
                />
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
          <div className="md:hidden border-t">
            <nav className="container-site flex flex-col py-3" aria-label="Mobile navigation">
              {nav.map((item) => (
                <Link key={item.id} to={item.url} className="py-2 text-sm" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {features.search && (
                <form onSubmit={submitSearch} className="flex gap-2 pt-2">
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

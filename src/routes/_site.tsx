import { createFileRoute, Outlet, getRouteApi, redirect } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ThemeStyle } from "@/components/site/ThemeStyle";
import { AnalyticsScripts, ChatWidget, CookieBanner, SitePopup } from "@/components/site/Overlays";
import { getRedirects, getSiteConfig } from "@/lib/cms.functions";
import { group, type ThemeSettings } from "@/lib/cms-types";
import { securityDefaults, siteJsonLdScripts } from "@/lib/seo";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";
import { useCartSync } from "@/hooks/useCartSync";

const themeDefaults: ThemeSettings = {
  primary: "oklch(0.45 0.12 250)",
  primaryForeground: "oklch(0.99 0 0)",
  accent: "oklch(0.75 0.15 60)",
  background: "oklch(0.99 0.005 90)",
  foreground: "oklch(0.2 0.02 260)",
  muted: "oklch(0.96 0.005 90)",
  border: "oklch(0.9 0.01 90)",
  headingFont: '"Instrument Serif", Georgia, serif',
  bodyFont: '"DM Sans", system-ui, sans-serif',
  radius: "0.75rem",
  containerWidth: "1280px",
  sectionSpacing: "5rem",
};

const performanceDefaults = {
  lazyLoadImages: true,
  preconnectShopify: true,
  preloadFonts: true,
  imageQuality: 80,
  productsPerPage: 24,
};

function normalize(path: string) {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export const Route = createFileRoute("/_site")({
  beforeLoad: async ({ location }) => {
    const rules = await getRedirects().catch(() => []);
    if (!rules.length) return;
    const from = normalize(location.pathname);
    const hit = rules.find((r) => normalize(String(r.from_path)) === from);
    if (!hit) return;
    const to = String(hit.to_path);
    if (normalize(to) === from) return;
    const statusCode = Number(hit.status_code) === 302 ? 302 : 301;
    if (/^https?:\/\//.test(to)) throw redirect({ href: to, statusCode });
    throw redirect({ href: to.startsWith("/") ? to : `/${to}`, statusCode });
  },
  loader: () => getSiteConfig(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const perf = group(loaderData.settings, "performance", performanceDefaults);
    const store = group(loaderData.settings, "store", { faviconUrl: "" });
    const links: Array<Record<string, string>> = [];
    if (perf.preconnectShopify) {
      links.push({ rel: "preconnect", href: "https://cdn.shopify.com", crossOrigin: "" });
      links.push({ rel: "dns-prefetch", href: `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}` });
    }
    if (store.faviconUrl) links.push({ rel: "icon", href: String(store.faviconUrl) });
    return { links, scripts: siteJsonLdScripts(loaderData.settings) };
  },
  component: SiteLayout,
});

export const siteRouteApi = getRouteApi("/_site");

function SiteLayout() {
  const config = Route.useLoaderData();
  useCartSync();
  const theme = group(config.settings, "theme", themeDefaults);
  const security = group(config.settings, "security", securityDefaults);

  if (security.maintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <ThemeStyle theme={theme} />
        <h1 className="font-heading text-3xl">We'll be right back</h1>
        <p className="max-w-md text-muted-foreground">{security.maintenanceMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ThemeStyle theme={theme} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader config={config} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter config={config} />
      <CookieBanner config={config} />
      <SitePopup config={config} />
      <ChatWidget config={config} />
      <AnalyticsScripts config={config} />
      <Toaster position="top-center" />
    </div>
  );
}

import { createFileRoute, Outlet, getRouteApi } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ThemeStyle } from "@/components/site/ThemeStyle";
import { AnalyticsScripts, ChatWidget, CookieBanner, SitePopup } from "@/components/site/Overlays";
import { getSiteConfig } from "@/lib/cms.functions";
import { group, type ThemeSettings } from "@/lib/cms-types";
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

export const Route = createFileRoute("/_site")({
  loader: () => getSiteConfig(),
  component: SiteLayout,
});

export const siteRouteApi = getRouteApi("/_site");

function SiteLayout() {
  const config = Route.useLoaderData();
  useCartSync();
  const theme = group(config.settings, "theme", themeDefaults);

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

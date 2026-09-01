import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsLink } from "@/components/site/CmsLink";
import { getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group, type StoreSettings } from "@/lib/cms-types";
import { CtaSection } from "@/components/site/CtaSection";
import { siteRouteApi } from "@/routes/_site";

export const Route = createFileRoute("/_site/account")({
  loader: () => getSettings(),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Account" }] };
    const store = group(loaderData, "store", { name: "Store" });
    return buildMeta(loaderData, {
      title: `Your account | ${store.name}`,
      description: "Track an order, review delivery details or get help with a recent purchase.",
      path: "/account",
      robots: "noindex, follow",
    });
  },
  component: AccountPage,
});

function AccountPage() {
  const siteConfig = siteRouteApi.useLoaderData();
  const settings = Route.useLoaderData();
  const store = group(settings, "store", {} as StoreSettings);

  return (
    <div className="container-site max-w-2xl py-16 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl">Your account</h1>
        <p className="text-muted-foreground">
          Order confirmations and tracking links are emailed to you at checkout. Use the link in that email to follow your
          delivery at any time.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-6">
          <PackageSearch className="h-5 w-5 text-muted-foreground" />
          <h2 className="mt-3 font-medium">Track an order</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open the tracking link in your confirmation email, or contact us with your order number.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <CmsLink to="/contact">Contact support</CmsLink>
          </Button>
        </div>
        <div className="rounded-xl border p-6">
          <LifeBuoy className="h-5 w-5 text-muted-foreground" />
          <h2 className="mt-3 font-medium">Returns &amp; help</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find answers about shipping, exchanges and refunds in our FAQ.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <CmsLink to="/faq">Read the FAQ</CmsLink>
          </Button>
        </div>
      </div>

      {store.email && (
        <p className="text-sm text-muted-foreground">
          Prefer email? Write to{" "}
          <a href={`mailto:${store.email}`} className="underline">
            {store.email}
          </a>
          .
        </p>
      )}
      <CtaSection config={siteConfig} location="account" />

    </div>
  );
}

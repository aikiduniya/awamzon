import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { group } from "@/lib/cms-types";
import { setResponseStatus } from "@tanstack/react-start/server";
import { siteRouteApi } from "./_site";

export const Route = createFileRoute("/_site/$")({
  loader: () => {
    if (typeof window === "undefined") setResponseStatus(404);
    return null;
  },
  head: () => ({ meta: [{ title: "Page not found" }, { name: "robots", content: "noindex, follow" }] }),
  component: SiteNotFound,
});

function SiteNotFound() {
  const config = siteRouteApi.useLoaderData();
  const messages = group(config.settings, "messages", {
    notFound: "The page you are looking for does not exist.",
  });
  return (
    <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="font-heading text-4xl">Page not found</h1>
      <p className="max-w-md text-muted-foreground">{messages.notFound}</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

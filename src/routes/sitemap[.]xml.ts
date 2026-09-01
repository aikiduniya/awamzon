import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: settingRows } = await supabase.from("site_settings").select("key,value");
        const settings = Object.fromEntries(
          (settingRows ?? []).map((r) => [r.key, (r.value ?? {}) as Record<string, unknown>]),
        );
        const seo = settings["seo"] ?? {};
        const cache = settings["cache"] ?? {};
        const security = settings["security"] ?? {};

        const configuredBase = String(seo["canonicalBase"] ?? "").replace(/\/+$/, "");
        const base = configuredBase || new URL(request.url).origin;

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/shop", changefreq: "daily", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.4" },
          { path: "/contact", changefreq: "monthly", priority: "0.4" },
        ];

        const pageSize = 1000;
        for (let offset = 0; ; offset += pageSize) {
          const { data } = await supabase
            .from("pages")
            .select("slug, updated_at")
            .eq("status", "published")
            .order("slug")
            .range(offset, offset + pageSize - 1);
          const rows = data ?? [];
          entries.push(
            ...rows.map((p) => ({
              path: `/pages/${encodeURIComponent(p.slug)}`,
              lastmod: p.updated_at ?? undefined,
              changefreq: "monthly" as const,
            })),
          );
          if (rows.length < pageSize) break;
        }

        for (let offset = 0; ; offset += pageSize) {
          const { data } = await supabase
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("status", "published")
            .order("slug")
            .range(offset, offset + pageSize - 1);
          const rows = data ?? [];
          entries.push(
            ...rows.map((p) => ({
              path: `/blog/${encodeURIComponent(p.slug)}`,
              lastmod: p.updated_at ?? undefined,
              changefreq: "weekly" as const,
            })),
          );
          if (rows.length < pageSize) break;
        }

        // Shopify products and collections
        try {
          const { fetchProducts, fetchCollections } = await import("@/lib/shopify");
          const [products, collections] = await Promise.all([
            fetchProducts({ first: 250 }).catch(() => []),
            fetchCollections(50).catch(() => []),
          ]);
          entries.push(
            ...products.map((p) => ({
              path: `/product/${encodeURIComponent(p.node.handle)}`,
              changefreq: "weekly" as const,
              priority: "0.8",
            })),
          );
          entries.push(
            ...collections.map((c) => ({
              path: `/collections/${encodeURIComponent(c.handle)}`,
              changefreq: "weekly" as const,
              priority: "0.7",
            })),
          );
        } catch {
          /* commerce catalogue unavailable — still return CMS URLs */
        }

        const { indexingEnabled } = await import("@/lib/seo");
        const urls = !indexingEnabled(settings)
          ? []
          : entries.map((e) =>

              [
                "  <url>",
                `    <loc>${base}${e.path}</loc>`,
                e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
                e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
                e.priority ? `    <priority>${e.priority}</priority>` : null,
                "  </url>",
              ]
                .filter(Boolean)
                .join("\n"),
            );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        const maxAge = Number(cache["sitemapMaxAge"] ?? 3600) || 3600;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": `public, max-age=${maxAge}`,
          },
        });
      },
    },
  },
});

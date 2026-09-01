import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data } = await supabase.from("site_settings").select("key,value");
        const settings = Object.fromEntries(
          (data ?? []).map((r) => [r.key, (r.value ?? {}) as Record<string, unknown>]),
        );
        const robots = settings["robots"] ?? {};
        const cache = settings["cache"] ?? {};
        const security = settings["security"] ?? {};
        const seo = settings["seo"] ?? {};

        const base = String(seo["canonicalBase"] ?? "").replace(/\/+$/, "") || new URL(request.url).origin;

        let body = security["noindexSite"]
          ? "User-agent: *\nDisallow: /"
          : String(robots["content"] ?? "User-agent: *\nAllow: /\nDisallow: /admin").trim();

        if (!security["noindexSite"] && !/^sitemap:/im.test(body)) {
          body += `\n\nSitemap: ${base}/sitemap.xml`;
        }

        const maxAge = Number(cache["robotsMaxAge"] ?? 3600) || 3600;
        return new Response(`${body}\n`, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": `public, max-age=${maxAge}`,
          },
        });
      },
    },
  },
});

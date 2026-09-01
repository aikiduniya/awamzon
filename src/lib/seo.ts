import { group, type SeoSettings, type SettingsMap } from "./cms-types";

export const seoDefaults: SeoSettings = {
  siteTitle: "Store",
  defaultTitle: "Store",
  defaultDescription: "",
  keywords: "",
  ogImage: "",
  twitterImage: "",
  brandName: "Store",
  titleTemplateProduct: "{product_title} | {site_name}",
  titleTemplateCollection: "{collection_title} | {site_name}",
  titleTemplateBlog: "{post_title} | {site_name}",
};

export interface AdvancedSeo {
  canonicalBase: string;
  twitterSite: string;
  titleTemplatePage: string;
  defaultRobots: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
}

export const advancedSeoDefaults: AdvancedSeo = {
  canonicalBase: "",
  twitterSite: "",
  titleTemplatePage: "{page_title} | {site_name}",
  defaultRobots: "index, follow",
  googleSiteVerification: "",
  bingSiteVerification: "",
};

export interface SecuritySettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  noindexSite: boolean;
  contactSpamProtection: boolean;
  blockRightClick: boolean;
  maxContactMessageLength: number;
}

export const securityDefaults: SecuritySettings = {
  maintenanceMode: false,
  maintenanceMessage: "We are performing scheduled maintenance. Please check back soon.",
  noindexSite: false,
  contactSpamProtection: true,
  blockRightClick: false,
  maxContactMessageLength: 2000,
};

export interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  type?: string | undefined;
  robots?: string | undefined;
}

/** Turns a site-relative path into an absolute URL when a canonical base is configured. */
export function absoluteUrl(settings: SettingsMap, path: string) {
  const adv = group(settings, "seo", advancedSeoDefaults);
  const base = String(adv.canonicalBase ?? "").replace(/\/+$/, "");
  if (!base) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMeta(settings: SettingsMap, input: MetaInput) {
  const seo = group(settings, "seo", seoDefaults);
  const adv = group(settings, "seo", advancedSeoDefaults);
  const security = group(settings, "security", securityDefaults);
  const rawImage = input.image || seo.ogImage;
  const image = rawImage ? absoluteUrl(settings, rawImage) : "";
  const url = absoluteUrl(settings, input.path);
  const description = input.description || seo.defaultDescription;
  const robots = security.noindexSite ? "noindex, nofollow" : input.robots || adv.defaultRobots;

  const meta: Array<Record<string, string>> = [
    { title: input.title },
    { name: "description", content: description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: seo.siteTitle || seo.brandName },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: description },
  ];
  if (adv.twitterSite) meta.push({ name: "twitter:site", content: String(adv.twitterSite) });
  if (seo.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (robots) meta.push({ name: "robots", content: robots });
  if (adv.googleSiteVerification) meta.push({ name: "google-site-verification", content: String(adv.googleSiteVerification) });
  if (adv.bingSiteVerification) meta.push({ name: "msvalidate.01", content: String(adv.bingSiteVerification) });
  if (image && /^https?:\/\//.test(image)) {
    meta.push({ property: "og:image", content: image });
    meta.push({ property: "og:image:alt", content: input.title });
    meta.push({ name: "twitter:image", content: image });
  }
  return { meta, links: [{ rel: "canonical", href: url }] };
}

export function applyTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), template);
}

export function jsonLd(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export interface SchemaSettings {
  organization: boolean;
  website: boolean;
  product: boolean;
  article: boolean;
  faq: boolean;
  breadcrumbs: boolean;
  customJsonLd: string;
}

export const schemaDefaults: SchemaSettings = {
  organization: true,
  website: true,
  product: true,
  article: true,
  faq: true,
  breadcrumbs: true,
  customJsonLd: "",
};

/** Site-wide Organization + WebSite JSON-LD plus any admin-authored custom schema. */
export function siteJsonLdScripts(settings: SettingsMap) {
  const schema = group(settings, "schema", schemaDefaults);
  const seo = group(settings, "seo", seoDefaults);
  const store = group(settings, "store", { name: "Store", logoUrl: "", email: "", phone: "", address: "" });
  const social = settings["social"] ?? {};
  const scripts: Array<{ type: string; children: string }> = [];
  const sameAs = Object.values(social)
    .filter((v): v is string => typeof v === "string" && /^https?:\/\//.test(v));

  if (schema.organization) {
    scripts.push(
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: seo.brandName || store.name,
        url: absoluteUrl(settings, "/"),
        ...(store.logoUrl ? { logo: absoluteUrl(settings, String(store.logoUrl)) } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(store.email || store.phone
          ? {
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  ...(store.email ? { email: store.email } : {}),
                  ...(store.phone ? { telephone: store.phone } : {}),
                },
              ],
            }
          : {}),
      }),
    );
  }

  if (schema.website) {
    const base = absoluteUrl(settings, "/");
    scripts.push(
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: seo.siteTitle || store.name,
        url: base,
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl(settings, "/search")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }),
    );
  }

  const custom = String(schema.customJsonLd ?? "").trim();
  if (custom) {
    try {
      scripts.push(jsonLd(JSON.parse(custom)));
    } catch {
      /* invalid JSON authored in admin — skip rather than break the page */
    }
  }

  return scripts;
}

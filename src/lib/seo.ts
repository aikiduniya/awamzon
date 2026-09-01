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

export interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
  robots?: string;
}

export function buildMeta(settings: SettingsMap, input: MetaInput) {
  const seo = group(settings, "seo", seoDefaults);
  const image = input.image || seo.ogImage;
  const meta: Array<Record<string, string>> = [
    { title: input.title },
    { name: "description", content: input.description || seo.defaultDescription },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description || seo.defaultDescription },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: input.path },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description || seo.defaultDescription },
  ];
  if (seo.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (input.robots) meta.push({ name: "robots", content: input.robots });
  if (image && /^https?:\/\//.test(image)) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  return { meta, links: [{ rel: "canonical", href: input.path }] };
}

export function applyTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), template);
}

export function jsonLd(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export interface StoreSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  logoText: string;
  faviconUrl: string;
  email: string;
  phone: string;
  address: string;
  currencyNote: string;
}

export interface SeoSettings {
  siteTitle: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string;
  ogImage: string;
  twitterImage: string;
  brandName: string;
  titleTemplateProduct: string;
  titleTemplateCollection: string;
  titleTemplateBlog: string;
}

export interface ThemeSettings {
  primary: string;
  primaryForeground: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  containerWidth: string;
  sectionSpacing: string;
}

export interface MenuItem {
  id: string;
  location: string;
  label: string;
  url: string;
  position: number;
  enabled: boolean;
  column_group: string | null;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string | null;
  position: number;
  enabled: boolean;
  data: Record<string, unknown>;
  starts_at: string | null;
  ends_at: string | null;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  position: number;
  enabled: boolean;
}

export type SettingsMap = Record<string, Record<string, unknown>>;

export interface SiteConfig {
  settings: SettingsMap;
  menus: MenuItem[];
  sections: HomepageSection[];
  faqs: FaqRow[];
}

export function group<T extends Record<string, unknown>>(settings: SettingsMap, key: string, fallback: T): T {
  return { ...fallback, ...((settings[key] ?? {}) as Partial<T>) } as T;
}

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "announcement",
  "featured_products",
  "product_grid",
  "featured_collections",
  "promo_banner",
  "image_text",
  "rich_text",
  "brand_logos",
  "testimonials",
  "faq",
  "newsletter",
  "blog_posts",
  "video",
  "countdown",
  "trust_badges",
  "spacer",
] as const;

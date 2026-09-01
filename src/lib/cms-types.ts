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
  icon?: string | null;
  description?: string | null;
  badge?: string | null;
}

export interface CtaBlock {
  id: string;
  location: string;
  enabled: boolean;
  eyebrow: string | null;
  heading: string | null;
  text: string | null;
  image: string | null;
  button_label: string | null;
  button_icon: string | null;
  button_url: string | null;
  secondary_label: string | null;
  secondary_icon: string | null;
  secondary_url: string | null;
  style: string;
  position: number;
}


export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface SectionData {
  heading?: JsonValue;
  subheading?: JsonValue;
  text?: JsonValue;
  image?: JsonValue;
  imageAlt?: JsonValue;
  buttonLabel?: JsonValue;
  buttonLink?: JsonValue;
  items?: JsonValue;
  count?: JsonValue;
  limit?: JsonValue;
  url?: JsonValue;
  [key: string]: JsonValue | undefined;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string | null;
  position: number;
  enabled: boolean;
  data: SectionData;
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

export type SettingsGroup = { [key: string]: JsonValue };
export type SettingsMap = { [key: string]: SettingsGroup };

export interface SiteConfig {
  settings: SettingsMap;
  menus: MenuItem[];
  sections: HomepageSection[];
  faqs: FaqRow[];
  ctas: CtaBlock[];
}


export function group<T extends object>(settings: SettingsMap, key: string, fallback: T): T {
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

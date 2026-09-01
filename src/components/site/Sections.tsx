import {
  BadgeCheck,
  Headset,
  Quote,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsLink } from "./CmsLink";
import { CmsIcon } from "./Icon";
import { FaqAccordion } from "./FaqAccordion";
import { ProductCard, type ProductCardFeatures } from "./ProductCard";
import { ProductCarousel } from "./ProductCarousel";
import { HeroSlider, type HeroSlide } from "./HeroSlider";
import { NewsletterForm } from "./NewsletterForm";

import { group, type HomepageSection, type SiteConfig } from "@/lib/cms-types";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify";

interface Props {
  sections: HomepageSection[];
  config: SiteConfig;
  products: ShopifyProduct[];
  posts: Array<{ id: string; slug: string; title: string; excerpt: string | null; cover_image: string | null }>;
  noProductsMessage: string;
  collections?: ShopifyCollection[];
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const FULL_BLEED = new Set(["hero_slider"]);

/** Select products for a section: filter by tag/vendor/type keyword, then limit. */
function pickProducts(products: ShopifyProduct[], d: Record<string, unknown>) {
  const tag = str(d['tag']).trim().toLowerCase();
  const limit = Number(d['count'] ?? d['limit'] ?? 8);
  let list = products;
  if (tag) {
    const tagged = products.filter((p) => (p.node.tags ?? []).some((t) => t.toLowerCase() === tag));
    if (tagged.length > 0) list = tagged;
  }
  if (str(d['sort']) === "price-asc") {
    list = [...list].sort(
      (a, b) =>
        parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount),
    );
  }
  if (str(d['sort']) === "price-desc") {
    list = [...list].sort(
      (a, b) =>
        parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount),
    );
  }
  return list.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 8);
}

export function Sections({ sections, config, products, posts, noProductsMessage, collections = [] }: Props) {
  return (
    <>
      {sections.map((section) => {
        const full = FULL_BLEED.has(section.type);
        return (
          <section
            key={section.id}
            className={full ? undefined : "container-site"}
            style={full ? undefined : { paddingBlock: "var(--section-spacing)" }}
          >
            <SectionBody
              section={section}
              config={config}
              products={products}
              posts={posts}
              collections={collections}
              noProductsMessage={noProductsMessage}
            />
          </section>
        );
      })}
    </>
  );
}

function SectionBody({
  section,
  config,
  products,
  posts,
  noProductsMessage,
  collections = [],
}: Omit<Props, "sections"> & { section: HomepageSection }) {
  const d = section.data ?? {};
  const flags = group(config.settings, "features", { wishlist: true, quickView: true });
  const features: ProductCardFeatures = {
    wishlist: flags.wishlist !== false,
    quickView: flags.quickView !== false,
  };

  switch (section.type) {
    case "hero_slider": {
      const slides = Array.isArray(d['slides']) ? (d['slides'] as unknown as HeroSlide[]) : [];
      return (
        <HeroSlider
          slides={slides}
          autoplay={d['autoplay'] !== false}
          autoplayDelay={Number(d['autoplayDelay'] ?? 6000)}
        />
      );
    }

    case "product_carousel":
      return (
        <ProductCarousel
          products={pickProducts(products, d)}
          eyebrow={str(d['eyebrow'])}
          heading={str(d.heading, section.title ?? "Products")}
          subheading={str(d['subheading'])}
          linkTo={str(d['linkTo'], "/shop")}
          linkLabel={str(d['linkLabel'], "View all")}
          autoplay={d['autoplay'] === true}
          autoplayDelay={Number(d['autoplayDelay'] ?? 4500)}
          features={features}
          emptyMessage={noProductsMessage}
        />
      );

    case "featured_collections": {
      const configured = Array.isArray(d['items'])
        ? (d['items'] as unknown as Array<{ handle: string; title?: string; image?: string; text?: string; link?: string }>)
        : [];
      const items =
        configured.length > 0
          ? configured.map((item) => {
              const match = collections.find((c) => c.handle === item.handle);
              return {
                handle: item.handle,
                link: item.link ?? `/collections/${item.handle}`,
                title: item.title ?? match?.title ?? item.handle,
                text: item.text ?? match?.description ?? "",
                image: item.image ?? match?.image?.url ?? "",
              };
            })
          : collections.slice(0, Number(d['limit'] ?? 3)).map((c) => ({
              handle: c.handle,
              link: `/collections/${c.handle}`,
              title: c.title,
              text: c.description,
              image: c.image?.url ?? "",
            }));
      if (items.length === 0) return null;
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              {str(d['eyebrow']) ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{str(d['eyebrow'])}</p>
              ) : null}
              <h2 className="text-3xl font-semibold tracking-tight">{str(d.heading, "Shop by collection")}</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <CmsLink to="/shop">
                Browse all <ArrowRight className="size-4" aria-hidden />
              </CmsLink>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <CmsLink
                key={item.handle}
                to={item.link}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden />
                <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="block text-xl font-semibold">{item.title}</span>
                  {item.text ? <span className="mt-1 line-clamp-2 block text-sm opacity-85">{item.text}</span> : null}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                    Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </CmsLink>
            ))}
          </div>
        </div>
      );
    }

    case "banner_grid": {
      const items = Array.isArray(d['items'])
        ? (d['items'] as unknown as Array<{ heading: string; text?: string; image?: string; link?: string; buttonLabel?: string }>)
        : [];
      if (items.length === 0) return null;
      return (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <CmsLink
              key={i}
              to={item.link ?? "/shop"}
              className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-muted p-8"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />
              <span className="relative text-white">
                <span className="block text-2xl font-semibold tracking-tight">{item.heading}</span>
                {item.text ? <span className="mt-1 block text-sm opacity-90">{item.text}</span> : null}
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                  {item.buttonLabel ?? "Shop now"}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </span>
            </CmsLink>
          ))}
        </div>
      );
    }


    case "hero":
      return (
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {str(d['eyebrow']) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                {str(d['eyebrow'])}
              </span>
            ) : null}
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{str(d.heading)}</h1>
            <p className="max-w-prose text-lg text-muted-foreground">{str(d.subheading)}</p>
            <div className="flex flex-wrap items-center gap-3">
              {str(d.buttonLabel) && (
                <Button asChild size="lg" className="gap-1.5">
                  <CmsLink to={str(d.buttonLink, "/shop")}>
                    {str(d.buttonLabel)}
                    <ArrowRight className="size-4" aria-hidden />
                  </CmsLink>
                </Button>
              )}
              {str(d['secondaryButtonLabel']) && (
                <Button asChild size="lg" variant="outline">
                  <CmsLink to={str(d['secondaryButtonLink'], "/pages/about-us")}>{str(d['secondaryButtonLabel'])}</CmsLink>
                </Button>
              )}
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Truck className="size-4 text-primary" aria-hidden /> Fast nationwide delivery
              </li>
              <li className="flex items-center gap-1.5">
                <RefreshCw className="size-4 text-primary" aria-hidden /> Easy returns
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" aria-hidden /> Secure checkout
              </li>
            </ul>
          </div>
          {str(d.image) ? (
            <img
              src={str(d.image)}
              alt={str(d.imageAlt)}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl ring-1 ring-border"
              fetchPriority="high"
            />
          ) : (
            <div className="aspect-[4/3] w-full rounded-xl bg-muted" aria-hidden="true" />
          )}
        </div>
      );

    case "featured_products":
    case "product_grid": {
      const list = pickProducts(products, d);
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              {str(d['eyebrow']) ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{str(d['eyebrow'])}</p>
              ) : null}
              <h2 className="text-3xl font-semibold tracking-tight">{str(d.heading, section.title ?? "Products")}</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <CmsLink to={str(d['linkTo'], "/shop")}>
                {str(d['linkLabel'], "View all")}
                <ArrowRight className="size-4" aria-hidden />
              </CmsLink>
            </Button>
          </div>
          {list.length === 0 ? (
            <p className="text-muted-foreground">{noProductsMessage}</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.node.id} product={p} features={features} />
              ))}
            </div>
          )}
        </div>

      );
    }

    case "image_text":
      return (
        <div className="grid items-center gap-10 md:grid-cols-2">
          {str(d.image) ? (
            <img src={str(d.image)} alt={str(d.imageAlt)} loading="lazy" className="rounded-xl object-cover" />
          ) : (
            <div className="aspect-[4/3] rounded-xl bg-muted" aria-hidden="true" />
          )}
          <div className="space-y-4">
            <h2 className="text-3xl">{str(d.heading)}</h2>
            <p className="text-muted-foreground">{str(d.text)}</p>
            {str(d.buttonLabel) && (
              <Button asChild variant="outline">
                <CmsLink to={str(d.buttonLink, "/")}>{str(d.buttonLabel)}</CmsLink>
              </Button>
            )}
          </div>
        </div>
      );

    case "rich_text":
      return (
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl">{str(d.heading)}</h2>
          <p className="whitespace-pre-line text-muted-foreground">{str(d.text)}</p>
        </div>
      );

    case "promo_banner":
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-8 py-14 text-primary-foreground shadow-lg">
          <Sparkles className="pointer-events-none absolute -right-6 -top-6 size-40 opacity-15" aria-hidden />
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">{str(d.heading)}</h2>
          <p className="mt-2 max-w-xl opacity-90">{str(d.text)}</p>
          {str(d.buttonLabel) && (
            <Button asChild variant="secondary" className="mt-5">
              <CmsLink to={str(d.buttonLink, "/shop")}>{str(d.buttonLabel)}</CmsLink>
            </Button>
          )}
        </div>
      );

    case "trust_badges": {
      const items = Array.isArray(d.items) ? (d.items as Array<{ title: string; text: string }>) : [];
      const icons = [Truck, RefreshCw, ShieldCheck, Headset, BadgeCheck];
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length]!;
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "testimonials": {
      const items = Array.isArray(d.items) ? (d.items as Array<{ quote: string; author: string }>) : [];
      if (items.length === 0) return null;
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">{str(d.heading, "What customers say")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <blockquote key={i} className="rounded-2xl border bg-card p-6 text-sm shadow-sm">
                <Quote className="size-6 text-primary/40" aria-hidden />
                <p className="mt-3 leading-relaxed">{item.quote}</p>
                <footer className="mt-4 flex items-center gap-2 text-muted-foreground">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {item.author.slice(0, 2).toUpperCase()}
                  </span>
                  {item.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      );
    }

    case "faq": {
      const limit = Number(d.limit ?? 5);
      const category = str(d["category"], "");
      const source = category ? config.faqs.filter((f) => (f.category ?? "") === category) : config.faqs;
      const faqs = source.slice(0, limit);
      if (faqs.length === 0) return null;
      const link = str(d.buttonLink, "");
      return (
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <CmsIcon name={str(d["icon"], "HelpCircle")} className="size-3.5" />
              {str(d.subheading, "FAQ")}
            </span>
            <h2 className="font-heading text-3xl tracking-tight md:text-4xl">
              {str(d.heading, "Frequently asked questions")}
            </h2>
            {d.text ? <p className="mx-auto max-w-xl text-muted-foreground">{str(d.text, "")}</p> : null}
          </div>
          <FaqAccordion items={faqs} iconStyle={str(d["iconStyle"], "plus")} defaultOpenFirst />
          {link && d.buttonLabel ? (
            <div className="text-center">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <CmsLink to={link}>
                  <CmsIcon name={str(d["buttonIcon"], "MessageCircle")} />
                  {str(d.buttonLabel, "")}
                </CmsLink>
              </Button>
            </div>
          ) : null}
        </div>
      );
    }


    case "blog_posts": {
      const list = posts.slice(0, Number(d.limit ?? 3));
      if (list.length === 0) return null;
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">{str(d.heading, "From the journal")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {list.map((post) => (
              <CmsLink
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-medium group-hover:text-primary">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </CmsLink>
            ))}
          </div>
        </div>
      );
    }

    case "newsletter":
      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-muted/60 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-5" aria-hidden />
          </span>
          <h2 className="text-3xl font-semibold tracking-tight">{str(d.heading, "Join the list")}</h2>
          <p className="max-w-md text-muted-foreground">{str(d.text)}</p>
          <NewsletterForm buttonLabel={str(d.buttonLabel, "Subscribe")} />
        </div>
      );

    case "video":
      return str(d.url) ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <iframe src={str(d.url)} title={str(d.heading, "Video")} className="h-full w-full" allowFullScreen />
        </div>
      ) : null;

    case "brand_logos": {
      const items = Array.isArray(d.items) ? (d.items as Array<{ url: string; alt: string }>) : [];
      return (
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
          {items.map((item, i) => (
            <img key={i} src={item.url} alt={item.alt} loading="lazy" className="h-8" />
          ))}
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: str(d['height'], "2rem") }} aria-hidden="true" />;

    default:
      return null;
  }
}

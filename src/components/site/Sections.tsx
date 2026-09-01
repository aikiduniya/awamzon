import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CmsLink } from "./CmsLink";
import { ProductCard } from "./ProductCard";
import { NewsletterForm } from "./NewsletterForm";
import type { HomepageSection, SiteConfig } from "@/lib/cms-types";
import type { ShopifyProduct } from "@/lib/shopify";

interface Props {
  sections: HomepageSection[];
  config: SiteConfig;
  products: ShopifyProduct[];
  posts: Array<{ id: string; slug: string; title: string; excerpt: string | null; cover_image: string | null }>;
  noProductsMessage: string;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export function Sections({ sections, config, products, posts, noProductsMessage }: Props) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="container-site" style={{ paddingBlock: "var(--section-spacing)" }}>
          <SectionBody
            section={section}
            config={config}
            products={products}
            posts={posts}
            noProductsMessage={noProductsMessage}
          />
        </section>
      ))}
    </>
  );
}

function SectionBody({ section, config, products, posts, noProductsMessage }: Omit<Props, "sections"> & { section: HomepageSection }) {
  const d = section.data ?? {};

  switch (section.type) {
    case "hero":
      return (
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <h1 className="text-4xl leading-tight md:text-6xl">{str(d.heading)}</h1>
            <p className="text-lg text-muted-foreground">{str(d.subheading)}</p>
            {str(d.buttonLabel) && (
              <Button asChild size="lg">
                <CmsLink to={str(d.buttonLink, "/shop")}>{str(d.buttonLabel)}</CmsLink>
              </Button>
            )}
          </div>
          {str(d.image) ? (
            <img
              src={str(d.image)}
              alt={str(d.imageAlt)}
              className="aspect-[4/3] w-full rounded-xl object-cover"
              fetchPriority="high"
            />
          ) : (
            <div className="aspect-[4/3] w-full rounded-xl bg-muted" aria-hidden="true" />
          )}
        </div>
      );

    case "featured_products":
    case "product_grid": {
      const count = Number(d.count ?? 8);
      const list = products.slice(0, count);
      return (
        <div className="space-y-6">
          <h2 className="text-3xl">{str(d.heading, section.title ?? "Products")}</h2>
          {list.length === 0 ? (
            <p className="text-muted-foreground">{noProductsMessage}</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.node.id} product={p} />
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
        <div className="rounded-xl bg-primary px-8 py-12 text-primary-foreground">
          <h2 className="text-3xl">{str(d.heading)}</h2>
          <p className="mt-2 opacity-90">{str(d.text)}</p>
          {str(d.buttonLabel) && (
            <Button asChild variant="secondary" className="mt-5">
              <CmsLink to={str(d.buttonLink, "/shop")}>{str(d.buttonLabel)}</CmsLink>
            </Button>
          )}
        </div>
      );

    case "trust_badges": {
      const items = Array.isArray(d.items) ? (d.items as Array<{ title: string; text: string }>) : [];
      return (
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border p-6">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      );
    }

    case "testimonials": {
      const items = Array.isArray(d.items) ? (d.items as Array<{ quote: string; author: string }>) : [];
      if (items.length === 0) return null;
      return (
        <div className="space-y-6">
          <h2 className="text-3xl">{str(d.heading, "What customers say")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <blockquote key={i} className="rounded-lg border p-6 text-sm">
                <p>{item.quote}</p>
                <footer className="mt-3 text-muted-foreground">{item.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      );
    }

    case "faq": {
      const limit = Number(d.limit ?? 5);
      const faqs = config.faqs.slice(0, limit);
      if (faqs.length === 0) return null;
      return (
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl text-center">{str(d.heading, "FAQ")}</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    case "blog_posts": {
      const list = posts.slice(0, Number(d.limit ?? 3));
      if (list.length === 0) return null;
      return (
        <div className="space-y-6">
          <h2 className="text-3xl">{str(d.heading, "From the journal")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {list.map((post) => (
              <CmsLink key={post.id} to={`/blog/${post.slug}`} className="group block">
                {post.cover_image && (
                  <img src={post.cover_image} alt="" loading="lazy" className="mb-3 aspect-video w-full rounded-lg object-cover" />
                )}
                <h3 className="font-medium group-hover:underline">{post.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              </CmsLink>
            ))}
          </div>
        </div>
      );
    }

    case "newsletter":
      return (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-muted px-6 py-14 text-center">
          <h2 className="text-3xl">{str(d.heading, "Join the list")}</h2>
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

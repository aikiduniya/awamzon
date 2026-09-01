import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { CmsLink } from "./CmsLink";
import { ProductCard, type ProductCardFeatures } from "./ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";

interface Props {
  products: ShopifyProduct[];
  heading?: string;
  subheading?: string;
  eyebrow?: string;
  linkTo?: string;
  linkLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  features?: ProductCardFeatures;
  emptyMessage?: string;
}

export function ProductCarousel({
  products,
  heading,
  subheading,
  eyebrow,
  linkTo,
  linkLabel = "View all",
  autoplay = false,
  autoplayDelay = 4500,
  features,
  emptyMessage = "No products found",
}: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    setSnaps(api.scrollSnapList());
    sync();
    api.on("select", sync);
    api.on("reInit", () => {
      setSnaps(api.scrollSnapList());
      sync();
    });
  }, [api]);

  useEffect(() => {
    if (!api || !autoplay) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      api.scrollNext();
    }, autoplayDelay);
    return () => window.clearInterval(id);
  }, [api, autoplay, autoplayDelay]);

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        {heading ? <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2> : null}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          ) : null}
          {heading ? <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2> : null}
          {subheading ? <p className="max-w-prose text-muted-foreground">{subheading}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {linkTo ? (
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <CmsLink to={linkTo}>
                {linkLabel}
                <ArrowRight className="size-4" aria-hidden />
              </CmsLink>
            </Button>
          ) : null}
        </div>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start", loop: products.length > 4, dragFree: false }}>
        <CarouselContent className="-ml-4">
          {products.map((p, i) => (
            <CarouselItem key={p.node.id} className="basis-[78%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <ProductCard product={p} features={features} priority={i === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 hidden size-10 md:flex" />
        <CarouselNext className="-right-3 hidden size-10 md:flex" />
      </Carousel>

      {snaps.length > 1 ? (
        <div className="flex justify-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

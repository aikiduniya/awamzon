import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { CmsLink } from "./CmsLink";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  eyebrow?: string;
  heading?: string;
  text?: string;
  image?: string;
  mobileImage?: string;
  imageAlt?: string;
  video?: string;
  overlay?: number;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
  buttonLabel?: string;
  buttonLink?: string;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
  startsAt?: string;
  endsAt?: string;
}

function isLive(slide: HeroSlide) {
  const now = Date.now();
  if (slide.startsAt && new Date(slide.startsAt).getTime() > now) return false;
  if (slide.endsAt && new Date(slide.endsAt).getTime() < now) return false;
  return true;
}

export function HeroSlider({
  slides,
  autoplay = true,
  autoplayDelay = 6000,
}: {
  slides: HeroSlide[];
  autoplay?: boolean;
  autoplayDelay?: number;
}) {
  const live = slides.filter(isLive);
  const [emblaRef, embla] = useEmblaCarousel({ loop: live.length > 1, duration: 28 });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const sync = () => setSelected(embla.selectedScrollSnap());
    sync();
    embla.on("select", sync);
    embla.on("reInit", sync);
  }, [embla]);

  useEffect(() => {
    if (!embla || !autoplay || live.length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") embla.scrollNext();
    }, autoplayDelay);
    return () => window.clearInterval(id);
  }, [embla, autoplay, autoplayDelay, live.length]);

  if (live.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
      <div ref={emblaRef}>
        <div className="flex">
          {live.map((slide, i) => {
            const align = slide.align ?? "left";
            const dark = (slide.theme ?? "dark") === "dark";
            return (
              <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative h-[78vh] max-h-[760px] min-h-[460px] w-full">
                  {slide.video ? (
                    <video
                      src={slide.video}
                      poster={slide.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : slide.image ? (
                    <picture>
                      {slide.mobileImage ? <source media="(max-width: 640px)" srcSet={slide.mobileImage} /> : null}
                      <img
                        src={slide.image}
                        alt={slide.imageAlt ?? slide.heading ?? ""}
                        className="absolute inset-0 h-full w-full object-cover"
                        fetchPriority={i === 0 ? "high" : "low"}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </picture>
                  ) : (
                    <div className="absolute inset-0 bg-muted" aria-hidden />
                  )}

                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"
                    style={{ opacity: (slide.overlay ?? 55) / 100 }}
                    aria-hidden
                  />

                  <div className="container-site relative flex h-full items-center">
                    <div
                      className={cn(
                        "max-w-xl space-y-5",
                        align === "center" && "mx-auto text-center",
                        align === "right" && "ml-auto text-right",
                        dark ? "text-white" : "text-foreground",
                      )}
                    >
                      {slide.eyebrow ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                          <Sparkles className="size-3.5" aria-hidden />
                          {slide.eyebrow}
                        </span>
                      ) : null}
                      {slide.heading ? (
                        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                          {slide.heading}
                        </h1>
                      ) : null}
                      {slide.text ? <p className="text-base opacity-90 md:text-lg">{slide.text}</p> : null}
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-3",
                          align === "center" && "justify-center",
                          align === "right" && "justify-end",
                        )}
                      >
                        {slide.buttonLabel ? (
                          <Button asChild size="lg" className="gap-1.5">
                            <CmsLink to={slide.buttonLink ?? "/shop"}>
                              {slide.buttonLabel}
                              <ArrowRight className="size-4" aria-hidden />
                            </CmsLink>
                          </Button>
                        ) : null}
                        {slide.secondaryButtonLabel ? (
                          <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                          >
                            <CmsLink to={slide.secondaryButtonLink ?? "/collections"}>
                              {slide.secondaryButtonLabel}
                            </CmsLink>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {live.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => embla?.scrollPrev()}
            className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow-lg backdrop-blur transition hover:bg-background md:grid"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => embla?.scrollNext()}
            className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow-lg backdrop-blur transition hover:bg-background md:grid"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {live.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full bg-white/50 transition-all",
                  i === selected ? "w-8 bg-white" : "w-3 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { CmsLink } from "./CmsLink";
import { CmsIcon } from "./Icon";
import type { CtaBlock, SiteConfig } from "@/lib/cms-types";

/** Picks the admin-authored CTA block for a storefront location. */
export function ctaFor(config: Pick<SiteConfig, "ctas">, location: string): CtaBlock | null {
  const list = (config.ctas ?? []).filter((c) => c.location === location && c.enabled);
  return list.sort((a, b) => a.position - b.position)[0] ?? null;
}

const styles: Record<string, string> = {
  gradient: "bg-gradient-to-br from-primary/12 via-accent/10 to-background border-primary/20",
  soft: "bg-muted/60 border-border",
  outline: "bg-background border-border",
};

/** Renders a CMS-managed CTA band. Nothing renders when admins disable it. */
export function CtaSection({
  config,
  location,
  className,
}: {
  config: Pick<SiteConfig, "ctas">;
  location: string;
  className?: string;
}) {
  const block = ctaFor(config, location);
  if (!block) return null;
  const hasPrimary = Boolean(block.button_label && block.button_url);
  const hasSecondary = Boolean(block.secondary_label && block.secondary_url);

  return (
    <section className={className ?? "container-site py-14"}>
      <div
        className={`relative overflow-hidden rounded-3xl border p-8 md:p-12 ${styles[block.style] ?? styles["soft"]}`}
      >
        <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {block.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{block.eyebrow}</p>
            ) : null}
            {block.heading ? <h2 className="font-heading text-2xl md:text-3xl">{block.heading}</h2> : null}
            {block.text ? <p className="max-w-xl text-muted-foreground">{block.text}</p> : null}
            {(hasPrimary || hasSecondary) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {hasPrimary && (
                  <Button asChild size="lg" className="gap-2">
                    <CmsLink to={block.button_url!}>
                      <CmsIcon name={block.button_icon} />
                      {block.button_label}
                    </CmsLink>
                  </Button>
                )}
                {hasSecondary && (
                  <Button asChild size="lg" variant="outline" className="gap-2">
                    <CmsLink to={block.secondary_url!}>
                      <CmsIcon name={block.secondary_icon} />
                      {block.secondary_label}
                    </CmsLink>
                  </Button>
                )}
              </div>
            )}
          </div>
          {block.image ? (
            <img
              src={block.image}
              alt={block.heading ?? ""}
              loading="lazy"
              className="hidden aspect-[4/3] w-full rounded-2xl object-cover md:block"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

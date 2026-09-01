import { Facebook, Instagram, Linkedin, Youtube, Music2, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { CmsLink } from "./CmsLink";
import { CmsIcon } from "./Icon";
import { NewsletterForm } from "./NewsletterForm";
import { Button } from "@/components/ui/button";
import { group, type MenuItem, type SiteConfig, type StoreSettings } from "@/lib/cms-types";

const socialIcons: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  twitter: Twitter,
};

function FooterColumn({ title, items }: { title: string; items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={`${title} navigation`}>
      <h2 className="mb-4 text-sm font-semibold tracking-wide">{title}</h2>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.id}>
            <CmsLink to={item.url} className="inline-flex items-center gap-2 hover:text-foreground">
              {item.icon ? <CmsIcon name={item.icon} className="size-4 text-primary/70" /> : null}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {item.badge}
                </span>
              ) : null}
            </CmsLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ config }: { config: SiteConfig }) {
  const store = group(config.settings, "store", {
    name: "Store",
    logoUrl: "",
    email: "",
    phone: "",
    address: "",
  } as unknown as StoreSettings);
  const footer = group(config.settings, "footer", {
    about: "",
    copyright: "© {year}",
    showNewsletter: true,
    newsletterTitle: "Join the list",
    newsletterText: "",
    paymentIcons: "",
    badges: "",
    showBadges: true,
    showPayments: true,
    showSocial: true,
    showContact: true,
    exploreTitle: "Shop",
    supportTitle: "Support",
    legalTitle: "Legal",
    ctaEnabled: false,
    ctaHeading: "",
    ctaText: "",
    ctaButtonLabel: "",
    ctaButtonIcon: "",
    ctaButtonLink: "/shop",
  });
  const social = group(config.settings, "social", {} as Record<string, string>);
  const messages = group(config.settings, "messages", { newsletterSuccess: "You are subscribed!" });
  const features = group(config.settings, "features", { newsletter: true });

  const explore = config.menus.filter((m) => m.location === "footer");
  const support = config.menus.filter((m) => m.location === "support");
  const legal = config.menus.filter((m) => m.location === "legal");
  const socialLinks = Object.entries(social).filter(([, url]) => Boolean(url));
  const badges = String(footer.badges ?? "")
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean);
  const payments = String(footer.paymentIcons ?? "")
    .split(/[,|]/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <footer className="mt-24 border-t bg-gradient-to-b from-muted/30 to-muted/60">
      {footer.ctaEnabled && footer.ctaHeading ? (
        <div className="container-site pt-14">
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/10 to-background p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl">{footer.ctaHeading}</h2>
              {footer.ctaText ? <p className="mt-2 max-w-xl text-muted-foreground">{footer.ctaText}</p> : null}
            </div>
            {footer.ctaButtonLabel && footer.ctaButtonLink ? (
              <Button asChild size="lg" className="gap-2">
                <CmsLink to={String(footer.ctaButtonLink)}>
                  <CmsIcon name={String(footer.ctaButtonIcon ?? "")} />
                  {footer.ctaButtonLabel}
                </CmsLink>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {footer.showBadges && badges.length > 0 ? (
        <div className="container-site grid gap-4 border-b py-10 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-xl border bg-background/70 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <CmsIcon name="ShieldCheck" className="size-4" />
              </span>
              <span className="text-sm font-medium">{b}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-8 w-auto" />
          ) : (
            <h2 className="font-heading text-xl">{store.name}</h2>
          )}
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{footer.about}</p>
          {footer.showContact ? (
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              {store.email && (
                <a href={`mailto:${store.email}`} className="flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-4 text-primary/70" aria-hidden />
                  {store.email}
                </a>
              )}
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4 text-primary/70" aria-hidden />
                  {store.phone}
                </a>
              )}
              {store.address && (
                <span className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 text-primary/70" aria-hidden />
                  {store.address}
                </span>
              )}
            </address>
          ) : null}
          {footer.showSocial && socialLinks.length > 0 ? (
            <div className="flex gap-2 pt-1">
              {socialLinks.map(([key, url]) => {
                const Icon = socialIcons[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="grid size-9 place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {Icon ? <Icon className="size-4" /> : key}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <FooterColumn title={String(footer.exploreTitle)} items={explore} />
        <FooterColumn title={String(footer.supportTitle)} items={support} />

        <div className="space-y-4" id="newsletter">
          {footer.showNewsletter && features.newsletter ? (
            <>
              <h2 className="text-sm font-semibold tracking-wide">{footer.newsletterTitle}</h2>
              <p className="text-sm text-muted-foreground">{footer.newsletterText}</p>
              <NewsletterForm successMessage={messages.newsletterSuccess as string} />
            </>
          ) : null}
          <FooterColumn title={String(footer.legalTitle)} items={legal} />
        </div>
      </div>

      <div className="border-t">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{String(footer.copyright).replace("{year}", String(new Date().getFullYear()))}</p>
          {footer.showPayments && payments.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {payments.map((p) => (
                <li key={p} className="rounded-md border bg-background px-2.5 py-1 font-medium tracking-wide">
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

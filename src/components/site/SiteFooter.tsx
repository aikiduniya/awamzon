import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, Music2, Twitter } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import { group, type SiteConfig, type StoreSettings } from "@/lib/cms-types";

const socialIcons: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  twitter: Twitter,
};

export function SiteFooter({ config }: { config: SiteConfig }) {
  const store = group(config.settings, "store", {
    name: "Store",
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
  });
  const social = group(config.settings, "social", {} as Record<string, string>);
  const messages = group(config.settings, "messages", { newsletterSuccess: "You are subscribed!" });
  const features = group(config.settings, "features", { newsletter: true });

  const nav = config.menus.filter((m) => m.location === "footer");
  const legal = config.menus.filter((m) => m.location === "legal");
  const socialLinks = Object.entries(social).filter(([, url]) => Boolean(url));

  return (
    <footer className="border-t mt-20 bg-muted/40">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <h2 className="font-heading text-lg">{store.name}</h2>
          <p className="text-sm text-muted-foreground">{footer.about}</p>
          <div className="flex gap-3 pt-1">
            {socialLinks.map(([key, url]) => {
              const Icon = socialIcons[key];
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : key}
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold mb-3">Explore</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {nav.map((item) => (
              <li key={item.id}>
                <Link to={item.url} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal navigation">
          <h2 className="text-sm font-semibold mb-3">Legal</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {legal.map((item) => (
              <li key={item.id}>
                <Link to={item.url} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3" id="newsletter">
          {footer.showNewsletter && features.newsletter && (
            <>
              <h2 className="text-sm font-semibold">{footer.newsletterTitle}</h2>
              <p className="text-sm text-muted-foreground">{footer.newsletterText}</p>
              <NewsletterForm successMessage={messages.newsletterSuccess as string} />
            </>
          )}
          <address className="not-italic text-sm text-muted-foreground space-y-1 pt-2">
            {store.email && (
              <div>
                <a href={`mailto:${store.email}`} className="hover:text-foreground">
                  {store.email}
                </a>
              </div>
            )}
            {store.phone && <div>{store.phone}</div>}
            {store.address && <div>{store.address}</div>}
          </address>
        </div>
      </div>
      <div className="border-t">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{String(footer.copyright).replace("{year}", String(new Date().getFullYear()))}</p>
          {footer.paymentIcons && <p>{footer.paymentIcons}</p>}
        </div>
      </div>
    </footer>
  );
}

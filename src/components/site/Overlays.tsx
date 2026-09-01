import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { group, type SiteConfig } from "@/lib/cms-types";

export function CookieBanner({ config }: { config: SiteConfig }) {
  const cookies = group(config.settings, "cookies", {
    enabled: true,
    text: "We use cookies.",
    acceptLabel: "Accept",
    rejectLabel: "Reject",
    privacyLink: "/privacy",
    position: "bottom",
  });
  const features = group(config.settings, "features", { cookieBanner: true });
  const [choice, setChoice] = useState<string | null>("pending");

  useEffect(() => {
    setChoice(localStorage.getItem("cookie-consent"));
  }, []);

  if (!cookies.enabled || !features.cookieBanner || choice !== null) return null;

  const decide = (value: string) => {
    localStorage.setItem("cookie-consent", value);
    setChoice(value);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
  };

  return (
    <div
      className={`fixed inset-x-0 ${cookies.position === "top" ? "top-0" : "bottom-0"} z-50 border-t bg-background p-4`}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container-site flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          {cookies.text}{" "}
          <a href={cookies.privacyLink as string} className="underline">
            Privacy policy
          </a>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => decide("rejected")}>
            {cookies.rejectLabel}
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            {cookies.acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ChatWidget({ config }: { config: SiteConfig }) {
  const chat = group(config.settings, "chat", {
    enabled: false,
    number: "",
    message: "",
    position: "right",
    color: "oklch(0.6 0.15 150)",
  });
  const features = group(config.settings, "features", { chatWidget: false });
  if (!chat.enabled || !features.chatWidget || !chat.number) return null;

  const href = `https://wa.me/${String(chat.number).replace(/\D/g, "")}?text=${encodeURIComponent(String(chat.message))}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-5 ${chat.position === "left" ? "left-5" : "right-5"} z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg`}
      style={{ background: chat.color as string }}
    >
      <MessageCircle className="h-6 w-6 text-white" />
    </a>
  );
}

export function SitePopup({ config }: { config: SiteConfig }) {
  const popup = group(config.settings, "popup", {
    enabled: false,
    title: "",
    text: "",
    buttonLabel: "",
    buttonLink: "",
    delaySeconds: 8,
    image: "",
  });
  const features = group(config.settings, "features", { popup: false });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!popup.enabled || !features.popup) return;
    if (sessionStorage.getItem("popup-seen")) return;
    const timer = setTimeout(() => setVisible(true), Number(popup.delaySeconds ?? 8) * 1000);
    return () => clearTimeout(timer);
  }, [popup.enabled, popup.delaySeconds, features.popup]);

  if (!visible) return null;

  const close = () => {
    sessionStorage.setItem("popup-seen", "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <button onClick={close} aria-label="Close popup" className="absolute right-3 top-3">
          <X className="h-4 w-4" />
        </button>
        {popup.image ? <img src={popup.image as string} alt="" className="mb-4 w-full rounded" /> : null}
        <h2 className="font-heading text-xl">{popup.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{popup.text}</p>
        {popup.buttonLabel ? (
          <Button asChild className="mt-4 w-full" onClick={close}>
            <a href={popup.buttonLink as string}>{popup.buttonLabel}</a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function AnalyticsScripts({ config }: { config: SiteConfig }) {
  const analytics = group(config.settings, "analytics", {
    ga4Id: "",
    gtmId: "",
    metaPixelId: "",
    tiktokPixelId: "",
    enabled: false,
    consentRequired: true,
  });
  const ads = group(config.settings, "ads", { enabled: false, publisherId: "" });
  const features = group(config.settings, "features", { analytics: false, ads: false });
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const update = () => setConsented(localStorage.getItem("cookie-consent") === "accepted");
    update();
    window.addEventListener("cookie-consent", update);
    return () => window.removeEventListener("cookie-consent", update);
  }, []);

  useEffect(() => {
    if (!analytics.enabled || !features.analytics) return;
    if (analytics.consentRequired && !consented) return;
    const loaded: HTMLScriptElement[] = [];

    if (analytics.ga4Id) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`;
      document.head.appendChild(s);
      loaded.push(s);
      const inline = document.createElement("script");
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.ga4Id}');`;
      document.head.appendChild(inline);
      loaded.push(inline);
    }
    if (analytics.gtmId) {
      const s = document.createElement("script");
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.gtmId}');`;
      document.head.appendChild(s);
      loaded.push(s);
    }
    if (analytics.metaPixelId) {
      const s = document.createElement("script");
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.metaPixelId}');fbq('track','PageView');`;
      document.head.appendChild(s);
      loaded.push(s);
    }
    return () => loaded.forEach((s) => s.remove());
  }, [analytics, consented, features.analytics]);

  useEffect(() => {
    if (!ads.enabled || !features.ads || !ads.publisherId) return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.publisherId}`;
    document.head.appendChild(s);
    return () => s.remove();
  }, [ads, features.ads]);

  return null;
}

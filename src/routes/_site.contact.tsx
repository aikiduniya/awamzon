import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSettings, sendContactMessage } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group, type StoreSettings } from "@/lib/cms-types";
import { CtaSection } from "@/components/site/CtaSection";
import { siteRouteApi } from "@/routes/_site";

export const Route = createFileRoute("/_site/contact")({
  loader: () => getSettings(),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Contact" }] };
    const store = group(loaderData, "store", { name: "Store" });
    return buildMeta(loaderData, {
      title: `Contact us | ${store.name}`,
      description: `Questions about an order or a product? Reach the ${store.name} team and we'll reply shortly.`,
      path: "/contact",
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const siteConfig = siteRouteApi.useLoaderData();
  const settings = Route.useLoaderData();
  const store = group(settings, "store", {} as Partial<StoreSettings> as StoreSettings);
  const messages = group(settings, "messages", { contactSuccess: "Thanks! We'll be in touch soon." });
  const send = useServerFn(sendContactMessage);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", company: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await send({ data: form });
      toast.success(String(messages.contactSuccess));
      setForm({ name: "", email: "", subject: "", message: "", company: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container-site grid gap-12 py-12 md:grid-cols-2">
      <div className="space-y-6">
        <h1 className="text-4xl">Contact us</h1>
        <p className="text-muted-foreground">
          We usually reply within one business day. For order updates include your order number.
        </p>
        <ul className="space-y-3 text-sm">
          {store.email && (
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${store.email}`} className="hover:underline">
                {store.email}
              </a>
            </li>
          )}
          {store.phone && (
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${store.phone}`} className="hover:underline">
                {store.phone}
              </a>
            </li>
          )}
          {store.address && (
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{store.address}</span>
            </li>
          )}
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border p-6">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            maxLength={150}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            required
            rows={6}
            maxLength={2000}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </form>
      <CtaSection config={siteConfig} location="contact" />

    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, SettingsCard } from "@/components/admin/AdminUI";
import { useSettings } from "./admin.settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/security")({ component: SecurityAdmin });

const KEYS: Array<{ key: string; title: string; description: string }> = [
  {
    key: "security",
    title: "Security & access",
    description:
      "Maintenance mode, site-wide noindex, contact-form spam protection and message limits. Changes apply to the live storefront immediately.",
  },
  {
    key: "performance",
    title: "Performance",
    description: "Image lazy loading, font preloading, CDN preconnect and products per page.",
  },
  {
    key: "cache",
    title: "Cache controls",
    description: "Cache lifetimes used by /sitemap.xml, /robots.txt and static assets.",
  },
  {
    key: "email",
    title: "Email / SMTP",
    description: "Sender identity, reply-to, SMTP host details and notification preferences for contact and newsletter events.",
  },
];

function SecurityAdmin() {
  const { draft, setDraft, saving, save } = useSettings();
  return (
    <AdminPage
      title="Security & performance"
      description="Hardening, performance and delivery settings for the live storefront."
    >
      {KEYS.map((k) => (
        <SettingsCard
          key={k.key}
          title={k.title}
          description={k.description}
          value={draft[k.key] ?? {}}
          onChange={(next) => setDraft((d) => ({ ...d, [k.key]: next }))}
          onSave={() => void save(k.key, k.key === "email" ? "integrations" : "security")}
          saving={saving === k.key}
        />
      ))}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Built-in protections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Admin access is enforced by database row-level security and staff role checks on the server — the browser can never grant itself permissions.</p>
          <p>Payment and checkout data never touches this app; Shopify handles it on its PCI-compliant checkout, and no secret keys are exposed to the browser.</p>
          <p>Server functions are protected against cross-site requests, and the admin area is excluded from search engines.</p>
          <p>SMTP passwords are never stored in these settings — ask in chat to connect a mail provider securely when you need transactional email.</p>
        </CardContent>
      </Card>
    </AdminPage>
  );
}

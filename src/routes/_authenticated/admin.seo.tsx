import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, SettingsCard } from "@/components/admin/AdminUI";
import { useSettings } from "./admin.settings";

export const Route = createFileRoute("/_authenticated/admin/seo")({ component: SeoAdmin });

const KEYS: Array<{ key: string; title: string; description: string }> = [
  { key: "seo", title: "Global SEO", description: "Titles, descriptions, keywords, OG/Twitter images and title templates." },
  { key: "schema", title: "Structured data (JSON-LD)", description: "Toggle organization, website, product, article, FAQ and breadcrumb schema." },
  { key: "robots", title: "robots.txt", description: "Served at /robots.txt for crawlers." },
];

function SeoAdmin() {
  const { draft, setDraft, saving, save } = useSettings();
  return (
    <AdminPage
      title="SEO manager"
      description="Every meta tag, template and schema flag used by the storefront. Per-page SEO lives in Pages and Blog."
    >
      {KEYS.map((k) => (
        <SettingsCard
          key={k.key}
          title={k.title}
          description={k.description}
          value={draft[k.key] ?? {}}
          onChange={(next) => setDraft((d) => ({ ...d, [k.key]: next }))}
          onSave={() => void save(k.key, "seo")}
          saving={saving === k.key}
        />
      ))}
    </AdminPage>
  );
}

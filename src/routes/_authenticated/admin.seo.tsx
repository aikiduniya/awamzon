import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, SettingsCard } from "@/components/admin/AdminUI";
import { useSettings } from "./admin.settings";

export const Route = createFileRoute("/_authenticated/admin/seo")({ component: SeoAdmin });

const KEYS: Array<{ key: string; title: string; description: string }> = [
  {
    key: "seo",
    title: "Global SEO",
    description:
      "Master control: “search engine indexing” OFF forces noindex, nofollow on every public page (homepage, products, collections, blog, categories, tags, CMS pages, search) and blocks robots.txt + sitemap. When ON, pages use “default robots” (index/noindex) + “default follow” (follow/nofollow). Also holds titles, descriptions, keywords, OG/Twitter images, title templates, canonical base URL and verification codes.",
  },

  {
    key: "schema",
    title: "Structured data (JSON-LD)",
    description:
      "Toggle organization, website, product, article, FAQ and breadcrumb schema. Paste extra JSON-LD in “custom json ld” to inject it site-wide.",
  },
  {
    key: "robots",
    title: "robots.txt",
    description: "Served live at /robots.txt. The sitemap line is appended automatically.",
  },
  {
    key: "cache",
    title: "Cache controls",
    description: "Cache lifetimes for /sitemap.xml, /robots.txt and static assets.",
  },
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

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/site/BlogList";
import { CtaSection } from "@/components/site/CtaSection";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { getFaqs, getSettings } from "@/lib/cms.functions";
import { buildMeta, jsonLd } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { siteRouteApi } from "@/routes/_site";

const faqPageDefaults = {
  eyebrow: "Support",
  title: "Help centre",
  intro: "",
  searchPlaceholder: "Search questions…",
  showSearch: true,
  showCategoryFilter: true,
  showBreadcrumbs: true,
  allCategoriesLabel: "All topics",
  emptyText: "No questions published yet.",
  noResultsText: "No answers matched your search.",
  iconStyle: "plus",
};

export const Route = createFileRoute("/_site/faq")({
  loader: async () => {
    const [settings, faqs] = await Promise.all([getSettings(), getFaqs()]);
    return { settings, faqs };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "FAQ" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const page = group(loaderData.settings, "faqPage", faqPageDefaults);
    const base = buildMeta(loaderData.settings, {
      title: `${page.title} | ${store.name}`,
      description: page.intro || `Answers about shipping, returns, payments and orders at ${store.name}.`,
      path: "/faq",
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: loaderData.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      ],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  const { settings, faqs } = Route.useLoaderData();
  const config = siteRouteApi.useLoaderData();
  const page = group(settings, "faqPage", faqPageDefaults);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("__all");

  const categories = useMemo(
    () => Array.from(new Set(faqs.map((f) => f.category ?? "General"))),
    [faqs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const inCategory = category === "__all" || (f.category ?? "General") === category;
      const inQuery = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [faqs, query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const f of filtered) {
      const key = f.category ?? "General";
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <div className="container-site max-w-4xl py-12 space-y-10">
        {page.showBreadcrumbs ? <Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: page.title }]} /> : null}

        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <HelpCircle className="size-3.5" aria-hidden />
            {page.eyebrow}
          </span>
          <h1 className="mt-4 font-heading text-4xl md:text-5xl">{page.title}</h1>
          {page.intro ? <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{page.intro}</p> : null}
        </header>

        {page.showSearch ? (
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={String(page.searchPlaceholder)}
              aria-label={String(page.searchPlaceholder)}
              className="h-12 rounded-full pl-11"
            />
          </div>
        ) : null}

        {page.showCategoryFilter && categories.length > 1 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {[{ key: "__all", label: String(page.allCategoriesLabel) }, ...categories.map((c) => ({ key: c, label: c }))].map(
              (c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    category === c.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ),
            )}
          </div>
        ) : null}

        {faqs.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{page.emptyText}</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{page.noResultsText}</p>
        ) : (
          grouped.map(([name, items]) => (
            <section key={name} className="space-y-4">
              <h2 className="font-heading text-xl">{name}</h2>
              <FaqAccordion items={items} iconStyle={String(page.iconStyle)} />
            </section>
          ))
        )}
      </div>
      <CtaSection config={config} location="faq" />
    </>
  );
}

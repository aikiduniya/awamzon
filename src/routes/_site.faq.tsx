import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFaqs, getSettings } from "@/lib/cms.functions";
import { buildMeta, jsonLd } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/faq")({
  loader: async () => {
    const [settings, faqs] = await Promise.all([getSettings(), getFaqs()]);
    return { settings, faqs };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "FAQ" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const base = buildMeta(loaderData.settings, {
      title: `Frequently asked questions | ${store.name}`,
      description: `Answers about shipping, returns, payments and orders at ${store.name}.`,
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
  const { faqs } = Route.useLoaderData();
  const categories = Array.from(new Set(faqs.map((f) => f.category ?? "General")));

  return (
    <div className="container-site max-w-3xl py-12 space-y-10">
      <header>
        <h1 className="text-4xl">Frequently asked questions</h1>
        <p className="mt-2 text-muted-foreground">Everything about orders, shipping and returns.</p>
      </header>
      {faqs.length === 0 ? (
        <p className="text-muted-foreground">No questions published yet.</p>
      ) : (
        categories.map((category) => (
          <section key={category} className="space-y-3">
            <h2 className="text-xl">{category}</h2>
            <Accordion type="single" collapsible>
              {faqs
                .filter((f) => (f.category ?? "General") === category)
                .map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-muted-foreground">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </section>
        ))
      )}
    </div>
  );
}

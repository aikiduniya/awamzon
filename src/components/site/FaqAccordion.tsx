import { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { FaqRow } from "@/lib/cms-types";

/**
 * Premium FAQ accordion with smooth expand/collapse. Icon style, content and
 * ordering all come from the CMS (Admin → FAQ / Site settings → Faq page).
 */
export function FaqAccordion({
  items,
  iconStyle = "plus",
  defaultOpenFirst = false,
}: {
  items: Array<Pick<FaqRow, "id" | "question" | "answer">>;
  iconStyle?: string;
  defaultOpenFirst?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpenFirst ? (items[0]?.id ?? null) : null);

  return (
    <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border bg-card/60 shadow-sm">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className={isOpen ? "bg-muted/40" : "transition-colors hover:bg-muted/25"}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-7"
              >
                <span className="font-heading text-base leading-snug md:text-lg">{item.question}</span>
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    isOpen ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                  }`}
                >
                  {iconStyle === "chevron" ? (
                    <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  ) : isOpen ? (
                    <Minus className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </span>
              </button>
            </h3>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-6 pr-14 text-sm leading-relaxed text-muted-foreground md:px-7">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

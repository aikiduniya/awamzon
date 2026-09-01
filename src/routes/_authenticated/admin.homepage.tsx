import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminPage, DeleteButton, EmptyState, Field, JsonForm, useTable } from "@/components/admin/AdminUI";
import { adminReorder, type Row } from "@/lib/admin.functions";
import { HOMEPAGE_SECTION_TYPES } from "@/lib/cms-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const Route = createFileRoute("/_authenticated/admin/homepage")({ component: HomepageAdmin });

const TEMPLATE: Record<string, Record<string, unknown>> = {
  hero: { heading: "New season", subheading: "", text: "", image: "", buttonLabel: "Shop now", buttonLink: "/shop" },
  announcement: { text: "" },
  featured_products: { heading: "Featured", limit: 8, query: "" },
  product_grid: { heading: "Shop all", limit: 12, query: "" },
  featured_collections: { heading: "Collections", limit: 6 },
  promo_banner: { heading: "", text: "", image: "", buttonLabel: "", buttonLink: "" },
  image_text: { heading: "", text: "", image: "", imageAlt: "", buttonLabel: "", buttonLink: "" },
  rich_text: { heading: "", text: "" },
  brand_logos: { heading: "", items: [] },
  testimonials: { heading: "What customers say", items: [] },
  faq: { heading: "Frequently asked questions", limit: 6 },
  newsletter: { heading: "Join the list", text: "" },
  blog_posts: { heading: "From the journal", limit: 3 },
  video: { heading: "", url: "" },
  countdown: { heading: "", text: "", endsAt: "" },
  trust_badges: { items: [] },
  spacer: { height: "3rem" },
};

function HomepageAdmin() {
  const { rows, loading, save, remove, reload } = useTable("homepage_sections", "position");
  const [newType, setNewType] = useState<string>("hero");

  const sections = useMemo(() => [...rows].sort((a, b) => Number(a["position"]) - Number(b["position"])), [rows]);

  async function move(index: number, delta: number) {
    const next = [...sections];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    try {
      await adminReorder({ data: { table: "homepage_sections", ids: next.map((s) => String(s["id"])) } });
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder");
    }
  }

  return (
    <AdminPage
      title="Homepage builder"
      description="Add, reorder, schedule and edit every homepage section. Nothing on the homepage is hard-coded."
      actions={
        <div className="flex gap-2">
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOMEPAGE_SECTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() =>
              void save({
                type: newType,
                title: newType.replace(/_/g, " "),
                position: sections.length,
                enabled: true,
                data: TEMPLATE[newType] ?? {},
              })
            }
          >
            Add section
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : sections.length === 0 ? (
        <EmptyState text="No sections yet — add your first one above." />
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionEditor
              key={String(section["id"])}
              section={section}
              index={index}
              onMove={move}
              onSave={save}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function SectionEditor({
  section,
  index,
  onMove,
  onSave,
  onDelete,
}: {
  section: Row;
  index: number;
  onMove: (index: number, delta: number) => void;
  onSave: (values: Row) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Row>(section);
  const data = (draft["data"] ?? {}) as Record<string, unknown>;

  return (
    <Card>
      <Collapsible>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CollapsibleTrigger asChild>
            <button type="button" className="text-left">
              <CardTitle className="text-base capitalize">
                {String(draft["title"] || String(draft["type"]).replace(/_/g, " "))}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{String(draft["type"])}</p>
            </button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Switch checked={Boolean(draft["enabled"])} onCheckedChange={(c) => setDraft({ ...draft, enabled: c })} />
            <Button variant="outline" size="sm" onClick={() => onMove(index, -1)}>
              ↑
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMove(index, 1)}>
              ↓
            </Button>
            <Button size="sm" onClick={() => void onSave(draft)}>
              Save
            </Button>
            <DeleteButton onConfirm={() => onDelete(String(section["id"]))} />
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Internal title">
                <Input value={String(draft["title"] ?? "")} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </Field>
              <Field label="Starts at" hint="Optional scheduling">
                <Input
                  type="datetime-local"
                  value={toLocal(draft["starts_at"])}
                  onChange={(e) => setDraft({ ...draft, starts_at: fromLocal(e.target.value) })}
                />
              </Field>
              <Field label="Ends at">
                <Input
                  type="datetime-local"
                  value={toLocal(draft["ends_at"])}
                  onChange={(e) => setDraft({ ...draft, ends_at: fromLocal(e.target.value) })}
                />
              </Field>
            </div>
            <JsonForm value={data} onChange={(next) => setDraft({ ...draft, data: next })} />
            <AddFieldRow onAdd={(key) => setDraft({ ...draft, data: { ...data, [key]: "" } })} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function AddFieldRow({ onAdd }: { onAdd: (key: string) => void }) {
  const [key, setKey] = useState("");
  return (
    <div className="flex gap-2">
      <Input placeholder="Add custom field key" value={key} onChange={(e) => setKey(e.target.value)} className="max-w-xs" />
      <Button
        variant="outline"
        onClick={() => {
          if (!key.trim()) return;
          onAdd(key.trim());
          setKey("");
        }}
      >
        Add field
      </Button>
    </div>
  );
}

function toLocal(value: unknown) {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}

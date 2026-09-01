import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminPage, DeleteButton, EmptyState, Field, useTable } from "@/components/admin/AdminUI";
import { adminReorder, type Row } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/faq")({ component: FaqAdmin });

function FaqAdmin() {
  const { rows, loading, save, remove, reload } = useTable("faqs", "position");
  const items = useMemo(() => [...rows].sort((a, b) => Number(a["position"]) - Number(b["position"])), [rows]);

  async function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    try {
      await adminReorder({ data: { table: "faqs", ids: next.map((i) => String(i["id"])) } });
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder");
    }
  }

  return (
    <AdminPage
      title="FAQ"
      description="Questions shown on the FAQ page, the homepage FAQ section and in FAQ structured data."
      actions={
        <Button
          onClick={() => void save({ question: "New question", answer: "", category: "general", position: items.length, enabled: true })}
        >
          Add question
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState text="No FAQs yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <FaqRowEditor key={String(item["id"])} item={item} index={index} onMove={move} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function FaqRowEditor({
  item,
  index,
  onMove,
  onSave,
  onDelete,
}: {
  item: Row;
  index: number;
  onMove: (index: number, delta: number) => void;
  onSave: (v: Row) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Row>(item);
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <Field label="Question">
            <Input value={String(draft["question"] ?? "")} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
          </Field>
          <Field label="Category">
            <Input value={String(draft["category"] ?? "")} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          </Field>
        </div>
        <Field label="Answer">
          <Textarea rows={3} value={String(draft["answer"] ?? "")} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Switch checked={Boolean(draft["enabled"])} onCheckedChange={(c) => setDraft({ ...draft, enabled: c })} />
          <span className="text-xs uppercase text-muted-foreground">Visible</span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onMove(index, -1)}>
              ↑
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMove(index, 1)}>
              ↓
            </Button>
            <Button size="sm" onClick={() => void onSave(draft)}>
              Save
            </Button>
            <DeleteButton onConfirm={() => onDelete(String(item["id"]))} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, DeleteButton, EmptyState, Field, useTable } from "@/components/admin/AdminUI";
import { adminReorder, type Row } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/menus")({ component: MenusAdmin });

const LOCATIONS = ["header", "footer", "mobile", "legal"];

function MenusAdmin() {
  const { rows, loading, save, remove, reload } = useTable("menu_items", "position");
  const [location, setLocation] = useState("header");

  const items = useMemo(
    () => rows.filter((r) => String(r["location"]) === location).sort((a, b) => Number(a["position"]) - Number(b["position"])),
    [rows, location],
  );

  async function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    try {
      await adminReorder({ data: { table: "menu_items", ids: next.map((i) => String(i["id"])) } });
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder");
    }
  }

  return (
    <AdminPage
      title="Menus"
      description="Navigation links for the header, footer, mobile menu and legal row. Changes appear on the storefront immediately."
      actions={
        <Button
          onClick={() =>
            void save({ location, label: "New link", url: "/", position: items.length, enabled: true })
          }
        >
          Add link
        </Button>
      }
    >
      <Tabs value={location} onValueChange={setLocation}>
        <TabsList>
          {LOCATIONS.map((l) => (
            <TabsTrigger key={l} value={l} className="capitalize">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCATIONS.map((l) => (
          <TabsContent key={l} value={l} className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <EmptyState text="No links yet" />
            ) : (
              items.map((item, index) => <MenuRow key={String(item["id"])} item={item} index={index} onMove={move} onSave={save} onDelete={remove} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminPage>
  );
}

function MenuRow({
  item,
  index,
  onMove,
  onSave,
  onDelete,
}: {
  item: Row;
  index: number;
  onMove: (index: number, delta: number) => void;
  onSave: (values: Row) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState(item);
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
        <Field label="Label">
          <Input value={String(draft["label"] ?? "")} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        </Field>
        <Field label="URL">
          <Input value={String(draft["url"] ?? "")} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
        </Field>
        <Field label="Column group">
          <Input
            value={String(draft["column_group"] ?? "")}
            onChange={(e) => setDraft({ ...draft, column_group: e.target.value || null })}
          />
        </Field>
        <Field label="Icon (Lucide name)">
          <Input
            placeholder="ShoppingBag"
            value={String(draft["icon"] ?? "")}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value || null })}
          />
        </Field>
        <Field label="Description (mega menu)">
          <Input
            value={String(draft["description"] ?? "")}
            onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
          />
        </Field>
        <Field label="Badge">
          <Input
            placeholder="New"
            value={String(draft["badge"] ?? "")}
            onChange={(e) => setDraft({ ...draft, badge: e.target.value || null })}
          />
        </Field>

        <div className="flex items-end gap-2">
          <div className="flex flex-col items-center">
            <Switch
              checked={Boolean(draft["enabled"])}
              onCheckedChange={(c) => setDraft({ ...draft, enabled: c })}
            />
            <span className="mt-1 text-[10px] uppercase text-muted-foreground">Live</span>
          </div>
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
      </CardContent>
    </Card>
  );
}

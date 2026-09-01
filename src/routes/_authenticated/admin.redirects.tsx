import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, DeleteButton, EmptyState, Field, useTable } from "@/components/admin/AdminUI";
import type { Row } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/redirects")({ component: RedirectsAdmin });

function RedirectsAdmin() {
  const { rows, loading, save, remove } = useTable("redirects", "created_at", false);
  return (
    <AdminPage
      title="Redirects"
      description="301/302 redirects for retired URLs. Useful when renaming pages, products or collections."
      actions={<Button onClick={() => void save({ from_path: "/old", to_path: "/new", status_code: 301, active: true })}>Add redirect</Button>}
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No redirects yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <RedirectRow key={String(row["id"])} row={row} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function RedirectRow({ row, onSave, onDelete }: { row: Row; onSave: (v: Row) => Promise<boolean>; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Row>(row);
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
        <Field label="From path">
          <Input value={String(draft["from_path"] ?? "")} onChange={(e) => setDraft({ ...draft, from_path: e.target.value })} />
        </Field>
        <Field label="To path">
          <Input value={String(draft["to_path"] ?? "")} onChange={(e) => setDraft({ ...draft, to_path: e.target.value })} />
        </Field>
        <Field label="Status">
          <Input
            type="number"
            value={Number(draft["status_code"] ?? 301)}
            onChange={(e) => setDraft({ ...draft, status_code: Number(e.target.value) })}
          />
        </Field>
        <div className="flex items-end gap-2">
          <Switch checked={Boolean(draft["active"])} onCheckedChange={(c) => setDraft({ ...draft, active: c })} />
          <Button size="sm" onClick={() => void onSave(draft)}>
            Save
          </Button>
          <DeleteButton onConfirm={() => onDelete(String(row["id"]))} />
        </div>
      </CardContent>
    </Card>
  );
}

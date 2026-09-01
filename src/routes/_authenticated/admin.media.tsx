import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminPage, DeleteButton, EmptyState, Field, useTable } from "@/components/admin/AdminUI";
import type { Row } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/media")({ component: MediaAdmin });

function MediaAdmin() {
  const { rows, loading, save, remove } = useTable("media", "created_at", false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  async function add() {
    if (!/^https?:\/\//.test(url) && !url.startsWith("/")) {
      toast.error("Enter a full https URL or a path starting with /");
      return;
    }
    const ok = await save({ url, alt, title: alt });
    if (ok) {
      setUrl("");
      setAlt("");
    }
  }

  return (
    <AdminPage title="Media library" description="Reusable image URLs for homepage sections, banners, blog covers and SEO images.">
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr_auto]">
          <Field label="Image URL">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Alt text">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={() => void add()}>Add media</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No media yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
            <MediaCard key={String(row["id"])} row={row} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function MediaCard({ row, onSave, onDelete }: { row: Row; onSave: (v: Row) => Promise<boolean>; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Row>(row);
  const url = String(draft["url"] ?? "");
  return (
    <Card className="overflow-hidden">
      <img src={url} alt={String(draft["alt"] ?? "")} className="h-40 w-full bg-muted object-cover" loading="lazy" />
      <CardContent className="space-y-2 p-3">
        <Field label="Alt">
          <Input value={String(draft["alt"] ?? "")} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
        </Field>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(url);
              toast.success("URL copied");
            }}
          >
            Copy URL
          </Button>
          <Button size="sm" onClick={() => void onSave(draft)}>
            Save
          </Button>
          <DeleteButton onConfirm={() => onDelete(String(row["id"]))} />
        </div>
      </CardContent>
    </Card>
  );
}

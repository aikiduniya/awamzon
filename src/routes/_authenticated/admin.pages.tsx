import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, DeleteButton, EmptyState, Field, JsonForm, slugify, useTable } from "@/components/admin/AdminUI";
import type { Row } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/pages")({ component: PagesAdmin });

const SEO_TEMPLATE = { metaTitle: "", metaDescription: "", ogImage: "", robots: "index, follow", canonical: "" };

function PagesAdmin() {
  const { rows, loading, save, remove } = useTable("pages", "updated_at", false);

  return (
    <AdminPage
      title="Pages"
      description="Content pages such as About, Shipping, Returns, Privacy and Terms — published at /pages/{slug} with their own SEO."
      actions={
        <Button
          onClick={() =>
            void save({ slug: `new-page-${Date.now().toString(36)}`, title: "New page", content: "", status: "draft", seo: SEO_TEMPLATE })
          }
        >
          New page
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No pages yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <PageEditor key={String(row["id"])} row={row} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function PageEditor({ row, onSave, onDelete }: { row: Row; onSave: (v: Row) => Promise<boolean>; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Row>(row);
  const seo = { ...SEO_TEMPLATE, ...((draft["seo"] ?? {}) as Record<string, unknown>) };

  return (
    <Card>
      <Collapsible>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CollapsibleTrigger asChild>
            <button type="button" className="text-left">
              <CardTitle className="text-base">{String(draft["title"])}</CardTitle>
              <p className="text-xs text-muted-foreground">/pages/{String(draft["slug"])}</p>
            </button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Badge variant={draft["status"] === "published" ? "default" : "secondary"}>{String(draft["status"])}</Badge>
            <Button
              size="sm"
              onClick={() =>
                void onSave({
                  ...draft,
                  seo,
                  updated_at: new Date().toISOString(),
                  published_at: draft["status"] === "published" ? (draft["published_at"] ?? new Date().toISOString()) : null,
                })
              }
            >
              Save
            </Button>
            <DeleteButton onConfirm={() => onDelete(String(row["id"]))} />
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Title">
                <Input value={String(draft["title"] ?? "")} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </Field>
              <Field label="Slug">
                <Input
                  value={String(draft["slug"] ?? "")}
                  onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                />
              </Field>
              <Field label="Status">
                <Select value={String(draft["status"])} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Content" hint="Plain text or HTML — rendered on the page.">
              <Textarea
                rows={12}
                value={String(draft["content"] ?? "")}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </Field>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page SEO</p>
              <JsonForm value={seo} onChange={(next) => setDraft({ ...draft, seo: next })} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

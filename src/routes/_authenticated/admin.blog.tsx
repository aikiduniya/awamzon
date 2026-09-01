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

export const Route = createFileRoute("/_authenticated/admin/blog")({ component: BlogAdmin });

const SEO_TEMPLATE = { metaTitle: "", metaDescription: "", ogImage: "", robots: "index, follow", canonical: "" };

function BlogAdmin() {
  const { rows, loading, save, remove } = useTable("blog_posts", "created_at", false);

  return (
    <AdminPage
      title="Blog"
      description="Write, schedule and publish articles with per-post SEO, cover images, categories and tags."
      actions={
        <Button
          onClick={() =>
            void save({
              slug: `new-post-${Date.now().toString(36)}`,
              title: "New post",
              excerpt: "",
              content: "",
              status: "draft",
              tags: [],
              seo: SEO_TEMPLATE,
            })
          }
        >
          New post
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No posts yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <PostEditor key={String(row["id"])} row={row} onSave={save} onDelete={remove} />
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function PostEditor({ row, onSave, onDelete }: { row: Row; onSave: (v: Row) => Promise<boolean>; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<Row>(row);
  const seo = { ...SEO_TEMPLATE, ...((draft["seo"] ?? {}) as Record<string, unknown>) };
  const tags = Array.isArray(draft["tags"]) ? (draft["tags"] as string[]) : [];

  return (
    <Card>
      <Collapsible>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CollapsibleTrigger asChild>
            <button type="button" className="text-left">
              <CardTitle className="text-base">{String(draft["title"])}</CardTitle>
              <p className="text-xs text-muted-foreground">/blog/{String(draft["slug"])}</p>
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
                  published_at:
                    draft["status"] === "published" ? (draft["published_at"] ?? new Date().toISOString()) : draft["published_at"] ?? null,
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
                <Input value={String(draft["slug"] ?? "")} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
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
              <Field label="Category">
                <Input value={String(draft["category"] ?? "")} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              </Field>
              <Field label="Author">
                <Input value={String(draft["author"] ?? "")} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <Input
                  value={tags.join(", ")}
                  onChange={(e) =>
                    setDraft({ ...draft, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
                  }
                />
              </Field>
              <Field label="Cover image URL">
                <Input value={String(draft["cover_image"] ?? "")} onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })} />
              </Field>
              <Field label="Cover alt text">
                <Input value={String(draft["cover_alt"] ?? "")} onChange={(e) => setDraft({ ...draft, cover_alt: e.target.value })} />
              </Field>
              <Field label="Publish date">
                <Input
                  type="datetime-local"
                  value={toLocal(draft["published_at"])}
                  onChange={(e) => setDraft({ ...draft, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </Field>
            </div>
            <Field label="Excerpt">
              <Textarea rows={2} value={String(draft["excerpt"] ?? "")} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            </Field>
            <Field label="Content" hint="Plain text or HTML.">
              <Textarea rows={14} value={String(draft["content"] ?? "")} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            </Field>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Post SEO</p>
              <JsonForm value={seo} onChange={(next) => setDraft({ ...draft, seo: next })} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function toLocal(value: unknown) {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

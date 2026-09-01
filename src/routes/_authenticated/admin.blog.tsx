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
import { Switch } from "@/components/ui/switch";

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
  const related = Array.isArray(draft["related_slugs"]) ? (draft["related_slugs"] as string[]) : [];

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
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Subcategory">
                <Input value={String(draft["subcategory"] ?? "")} onChange={(e) => setDraft({ ...draft, subcategory: e.target.value || null })} />
              </Field>
              <Field label="Author slug" hint="Used for /blog/author/…">
                <Input value={String(draft["author_slug"] ?? "")} onChange={(e) => setDraft({ ...draft, author_slug: slugify(e.target.value) || null })} />
              </Field>
              <Field label="Author avatar URL">
                <Input value={String(draft["author_avatar"] ?? "")} onChange={(e) => setDraft({ ...draft, author_avatar: e.target.value || null })} />
              </Field>
              <Field label="Reading time (min)" hint="Leave blank to auto-calculate">
                <Input
                  type="number"
                  value={draft["reading_time"] == null ? "" : String(draft["reading_time"])}
                  onChange={(e) => setDraft({ ...draft, reading_time: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
              <Field label="Related post slugs" hint="Comma separated">
                <Input
                  value={related.join(", ")}
                  onChange={(e) =>
                    setDraft({ ...draft, related_slugs: e.target.value.split(",").map((t) => slugify(t.trim())).filter(Boolean) })
                  }
                />
              </Field>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={draft["show_toc"] !== false} onCheckedChange={(c) => setDraft({ ...draft, show_toc: c })} />
                  Table of contents
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={draft["show_breadcrumbs"] !== false}
                    onCheckedChange={(c) => setDraft({ ...draft, show_breadcrumbs: c })}
                  />
                  Breadcrumbs
                </label>
              </div>
            </div>
            <Field label="Author bio">
              <Textarea rows={2} value={String(draft["author_bio"] ?? "")} onChange={(e) => setDraft({ ...draft, author_bio: e.target.value || null })} />
            </Field>
            <Field label="Excerpt">
              <Textarea rows={2} value={String(draft["excerpt"] ?? "")} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            </Field>
            <Field label="Content" hint="Plain text or HTML.">
              <Textarea rows={14} value={String(draft["content"] ?? "")} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            </Field>
            <Field label="Post FAQs" hint='JSON array: [{"question":"…","answer":"…"}]'>
              <Textarea
                rows={4}
                value={JSON.stringify(draft["faqs"] ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    setDraft({ ...draft, faqs: JSON.parse(e.target.value) });
                  } catch {
                    /* keep last valid value while typing */
                  }
                }}
              />
            </Field>
            <Field label="Internal / external links" hint='JSON array: [{"label":"…","url":"…"}]'>
              <Textarea
                rows={3}
                value={JSON.stringify(draft["links"] ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    setDraft({ ...draft, links: JSON.parse(e.target.value) });
                  } catch {
                    /* keep last valid value while typing */
                  }
                }}
              />
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

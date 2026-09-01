import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { adminStats, type Row } from "@/lib/admin.functions";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

const LABELS: Record<string, { label: string; to: string }> = {
  pages: { label: "Pages", to: "/admin/pages" },
  blog_posts: { label: "Blog posts", to: "/admin/blog" },
  faqs: { label: "FAQs", to: "/admin/faq" },
  media: { label: "Media", to: "/admin/media" },
  subscribers: { label: "Subscribers", to: "/admin/subscribers" },
  contact_messages: { label: "Messages", to: "/admin/messages" },
  homepage_sections: { label: "Homepage sections", to: "/admin/homepage" },
  menu_items: { label: "Menu items", to: "/admin/menus" },
};

function Dashboard() {
  const [data, setData] = useState<{ counts: Record<string, number>; recent: Row[]; messages: Row[] } | null>(null);

  useEffect(() => {
    void adminStats().then(setData, () => setData(null));
  }, []);

  return (
    <AdminPage title="Dashboard" description="Everything on your storefront is editable here — no code changes required.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(LABELS).map(([key, meta]) => (
          <Link key={key} to={meta.to}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{meta.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{data?.counts[key] ?? "—"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.messages.length ? (
              data.messages.map((m) => (
                <div key={String(m["id"])} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{String(m["name"])}</p>
                  <p className="text-muted-foreground">{String(m["email"])}</p>
                  <p className="text-muted-foreground">{String(m["subject"] ?? "")}</p>
                </div>
              ))
            ) : (
              <EmptyState text="No messages yet" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data?.recent.length ? (
              data.recent.map((a) => (
                <div key={String(a["id"])} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
                  <span>
                    <span className="font-medium">{String(a["action"])}</span> · {String(a["module"])}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(String(a["created_at"])).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState text="No activity yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}

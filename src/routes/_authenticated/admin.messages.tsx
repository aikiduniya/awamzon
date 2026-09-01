import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, DeleteButton, EmptyState, useTable } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/messages")({ component: MessagesAdmin });

function MessagesAdmin() {
  const { rows, loading, save, remove } = useTable("contact_messages", "created_at", false);

  return (
    <AdminPage title="Contact messages" description="Messages submitted through the storefront contact form.">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No messages yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={String(row["id"])}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{String(row["name"])}</p>
                  <a className="text-sm text-muted-foreground underline" href={`mailto:${String(row["email"])}`}>
                    {String(row["email"])}
                  </a>
                  <Badge variant={row["status"] === "new" ? "default" : "secondary"}>{String(row["status"])}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(String(row["created_at"])).toLocaleString()}
                  </span>
                </div>
                {row["subject"] ? <p className="text-sm font-medium">{String(row["subject"])}</p> : null}
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{String(row["message"])}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void save({ ...row, status: row["status"] === "read" ? "new" : "read" })}
                  >
                    Mark as {row["status"] === "read" ? "unread" : "read"}
                  </Button>
                  <DeleteButton onConfirm={() => remove(String(row["id"]))} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminPage>
  );
}

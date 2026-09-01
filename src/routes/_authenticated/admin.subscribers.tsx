import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, DeleteButton, EmptyState, useTable } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({ component: SubscribersAdmin });

function SubscribersAdmin() {
  const { rows, loading, save, remove } = useTable("subscribers", "created_at", false);

  function exportCsv() {
    const csv = ["email,status,source,created_at", ...rows.map((r) => [r["email"], r["status"], r["source"] ?? "", r["created_at"]].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminPage
      title="Subscribers"
      description="Newsletter signups collected from the footer, popups and homepage sections."
      actions={
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          Export CSV
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No subscribers yet" />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row["id"])}>
                    <TableCell>{String(row["email"])}</TableCell>
                    <TableCell>
                      <Badge variant={row["status"] === "subscribed" ? "default" : "secondary"}>{String(row["status"])}</Badge>
                    </TableCell>
                    <TableCell>{String(row["source"] ?? "")}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(String(row["created_at"])).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void save({ ...row, status: row["status"] === "subscribed" ? "unsubscribed" : "subscribed" })
                        }
                      >
                        {row["status"] === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                      </Button>
                      <DeleteButton onConfirm={() => remove(String(row["id"]))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPage>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, EmptyState, useTable } from "@/components/admin/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/activity")({ component: ActivityAdmin });

function ActivityAdmin() {
  const { rows, loading } = useTable("activity_logs", "created_at", false);

  return (
    <AdminPage title="Activity log" description="Audit trail of every change made through the admin.">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No activity recorded yet" />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row["id"])}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(String(row["created_at"])).toLocaleString()}
                    </TableCell>
                    <TableCell>{String(row["action"])}</TableCell>
                    <TableCell>{String(row["module"])}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {String(row["record"] ?? "")}
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

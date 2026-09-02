import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, useTable } from "@/components/admin/AdminUI";
import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import type { Row } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/activity")({ component: ActivityAdmin });

function ActivityAdmin() {
  const { rows, loading } = useTable("activity_logs", "created_at", false);

  const columns: Array<DataColumn<Row>> = [
    {
      key: "created_at",
      header: "When",
      value: (r) => String(r["created_at"] ?? ""),
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(String(r["created_at"])).toLocaleString()}
        </span>
      ),
    },
    { key: "user_email", header: "User", value: (r) => String(r["user_email"] ?? "—") },
    {
      key: "action",
      header: "Action",
      value: (r) => String(r["action"] ?? ""),
      render: (r) => <Badge variant="secondary">{String(r["action"])}</Badge>,
    },
    { key: "module", header: "Module", value: (r) => String(r["module"] ?? "") },
    {
      key: "record",
      header: "Record",
      value: (r) => String(r["record"] ?? ""),
      className: "max-w-[260px] truncate text-xs text-muted-foreground",
    },
  ];

  const moduleOptions = useMemo(() => {
    const set = new Set(rows.map((r) => String(r["module"] ?? "")).filter(Boolean));
    return Array.from(set).map((m) => ({ value: m, label: m }));
  }, [rows]);

  const actionOptions = useMemo(() => {
    const set = new Set(rows.map((r) => String(r["action"] ?? "")).filter(Boolean));
    return Array.from(set).map((m) => ({ value: m, label: m }));
  }, [rows]);

  return (
    <AdminPage title="Activity log" description="Audit trail of every change made through the admin.">
      <DataTable
        rows={rows}
        loading={loading}
        columns={columns}
        getId={(r) => String(r["id"])}
        searchPlaceholder="Search activity…"
        csvName="activity-log"
        emptyText="No activity recorded yet"
        dateValue={(r) => String(r["created_at"] ?? "")}
        filters={[
          {
            key: "module",
            label: "Modules",
            options: moduleOptions,
            match: (r, v) => String(r["module"] ?? "") === v,
          },
          {
            key: "action",
            label: "Actions",
            options: actionOptions,
            match: (r, v) => String(r["action"] ?? "") === v,
          },
        ]}
      />
    </AdminPage>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, useTable } from "@/components/admin/AdminUI";
import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Row } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/messages")({ component: MessagesAdmin });

function MessagesAdmin() {
  const { rows, loading, save, remove } = useTable("contact_messages", "created_at", false);
  const [open, setOpen] = useState<Row | null>(null);

  const columns: Array<DataColumn<Row>> = [
    {
      key: "created_at",
      header: "Received",
      value: (r) => String(r["created_at"] ?? ""),
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(String(r["created_at"])).toLocaleString()}
        </span>
      ),
    },
    { key: "name", header: "Name", value: (r) => String(r["name"] ?? "") },
    {
      key: "email",
      header: "Email",
      value: (r) => String(r["email"] ?? ""),
      render: (r) => (
        <a className="underline" href={`mailto:${String(r["email"])}`}>
          {String(r["email"])}
        </a>
      ),
    },
    { key: "subject", header: "Subject", value: (r) => String(r["subject"] ?? "—") },
    {
      key: "message",
      header: "Message",
      value: (r) => String(r["message"] ?? ""),
      className: "max-w-[280px] truncate text-muted-foreground",
    },
    {
      key: "status",
      header: "Status",
      value: (r) => String(r["status"] ?? ""),
      render: (r) => (
        <Badge variant={r["status"] === "new" ? "default" : "secondary"}>{String(r["status"])}</Badge>
      ),
    },
  ];

  return (
    <AdminPage title="Contact messages" description="Messages submitted through the storefront contact form.">
      <DataTable
        rows={rows}
        loading={loading}
        columns={columns}
        getId={(r) => String(r["id"])}
        searchPlaceholder="Search messages…"
        csvName="contact-messages"
        emptyText="No messages yet"
        dateValue={(r) => String(r["created_at"] ?? "")}
        filters={[
          {
            key: "status",
            label: "Statuses",
            options: [
              { value: "new", label: "New" },
              { value: "read", label: "Read" },
            ],
            match: (r, v) => String(r["status"] ?? "") === v,
          },
        ]}
        bulkActions={[
          { label: "Mark as read", run: (selected) => Promise.all(selected.map((r) => save({ ...r, status: "read" }))) },
          { label: "Mark as new", run: (selected) => Promise.all(selected.map((r) => save({ ...r, status: "new" }))) },
          {
            label: "Delete",
            destructive: true,
            confirm: "Selected messages will be permanently deleted.",
            run: (selected) => Promise.all(selected.map((r) => remove(String(r["id"])))),
          },
        ]}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(row)}>
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void save({ ...row, status: row["status"] === "read" ? "new" : "read" })}
            >
              {row["status"] === "read" ? "Unread" : "Read"}
            </Button>
          </div>
        )}
      />

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{String(open?.["subject"] ?? "Message")}</DialogTitle>
            <DialogDescription>
              {String(open?.["name"] ?? "")} · {String(open?.["email"] ?? "")}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{String(open?.["message"] ?? "")}</p>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

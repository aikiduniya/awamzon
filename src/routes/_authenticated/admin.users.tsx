import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { adminListUsers, adminSetRole, type Row } from "@/lib/admin.functions";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersAdmin });

const ROLES = ["super_admin", "admin", "editor", "seo_manager", "content_manager", "order_manager", "support_manager"];

function UsersAdmin() {
  const [data, setData] = useState<{ profiles: Row[]; roles: Row[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await adminListUsers());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load users");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rolesFor = useCallback(
    (userId: string) =>
      (data?.roles ?? []).filter((r) => String(r["user_id"]) === userId).map((r) => String(r["role"])),
    [data],
  );

  async function toggle(userId: string, role: string, grant: boolean) {
    try {
      await adminSetRole({ data: { userId, role, grant } });
      toast.success("Roles updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update roles");
    }
  }

  if (error) {
    return (
      <AdminPage title="Users & roles">
        <EmptyState text={error} />
      </AdminPage>
    );
  }

  const columns: Array<DataColumn<Row>> = [
    { key: "full_name", header: "Name", value: (r) => String(r["full_name"] ?? "—") },
    { key: "email", header: "Email", value: (r) => String(r["email"] ?? "") },
    {
      key: "roles",
      header: "Roles",
      value: (r) => rolesFor(String(r["id"])).join(", "),
      render: (r) => {
        const held = rolesFor(String(r["id"]));
        return held.length === 0 ? (
          <span className="text-xs text-muted-foreground">No roles</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {held.map((role) => (
              <Badge key={role} variant="secondary" className="capitalize">
                {role.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: "created_at",
      header: "Joined",
      value: (r) => String(r["created_at"] ?? ""),
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {r["created_at"] ? new Date(String(r["created_at"])).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const editingRoles = editing ? rolesFor(String(editing["id"])) : [];

  return (
    <AdminPage
      title="Users & roles"
      description="Grant staff permissions. Roles are stored server-side and enforced by database policies — never in the browser."
    >
      <DataTable
        rows={data?.profiles ?? []}
        loading={data === null}
        columns={columns}
        getId={(r) => String(r["id"])}
        searchPlaceholder="Search users…"
        csvName="users"
        emptyText="No users yet"
        dateValue={(r) => String(r["created_at"] ?? "")}
        filters={[
          {
            key: "role",
            label: "Roles",
            options: ROLES.map((r) => ({ value: r, label: r.replace(/_/g, " ") })),
            match: (row, v) => rolesFor(String(row["id"])).includes(v),
          },
        ]}
        rowActions={(row) => (
          <Button size="sm" variant="outline" onClick={() => setEditing(row)}>
            Manage roles
          </Button>
        )}
      />

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage roles</DialogTitle>
            <DialogDescription>{String(editing?.["email"] ?? "")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={editingRoles.includes(role)}
                  onCheckedChange={(c) => void toggle(String(editing?.["id"]), role, Boolean(c))}
                />
                <Label className="cursor-pointer capitalize">{role.replace(/_/g, " ")}</Label>
              </label>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

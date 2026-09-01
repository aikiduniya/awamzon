import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { adminListUsers, adminSetRole, type Row } from "@/lib/admin.functions";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersAdmin });

const ROLES = ["super_admin", "admin", "editor", "seo_manager", "content_manager", "order_manager", "support_manager"];

function UsersAdmin() {
  const [data, setData] = useState<{ profiles: Row[]; roles: Row[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AdminPage
      title="Users & roles"
      description="Grant staff permissions. Roles are stored server-side and enforced by database policies — never in the browser."
    >
      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : data.profiles.length === 0 ? (
        <EmptyState text="No users yet" />
      ) : (
        <div className="space-y-3">
          {data.profiles.map((p) => {
            const userId = String(p["id"]);
            const held = data.roles.filter((r) => String(r["user_id"]) === userId).map((r) => String(r["role"]));
            return (
              <Card key={userId}>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="font-medium">{String(p["full_name"] ?? p["email"] ?? "User")}</p>
                    <p className="text-sm text-muted-foreground">{String(p["email"] ?? "")}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={held.includes(role)}
                          onCheckedChange={(c) => void toggle(userId, role, Boolean(c))}
                        />
                        <Label className="cursor-pointer">{role.replace(/_/g, " ")}</Label>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { adminList, adminSaveSetting, type Row } from "@/lib/admin.functions";
import { AdminPage, humanize } from "@/components/admin/AdminUI";
import { SettingsCard } from "@/components/admin/AdminUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsAdmin });

const HIDDEN_GROUPS = ["theme", "seo"];

export function useSettings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void adminList({ data: { table: "site_settings", orderBy: "key" } }).then(
      (data) => {
        setRows(data);
        const next: Record<string, Record<string, unknown>> = {};
        for (const r of data) next[String(r["key"])] = (r["value"] ?? {}) as Record<string, unknown>;
        setDraft(next);
      },
      (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load settings"),
    );
  }, []);

  async function save(key: string, groupName: string) {
    setSaving(key);
    try {
      await adminSaveSetting({ data: { key, value: draft[key] ?? {}, group_name: groupName } });
      toast.success("Saved — your storefront is updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(null);
    }
  }

  return { rows, draft, setDraft, saving, save };
}

function SettingsAdmin() {
  const { rows, draft, setDraft, saving, save } = useSettings();

  const groups = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const row of rows) {
      const g = String(row["group_name"] ?? "general");
      if (HIDDEN_GROUPS.includes(g)) continue;
      (map[g] ??= []).push(row);
    }
    return map;
  }, [rows]);

  const groupNames = Object.keys(groups).sort();

  return (
    <AdminPage
      title="Site settings"
      description="Store identity, header, footer, announcement bar, popups, chat widget, cookie banner, analytics, ads, social links and storefront copy."
    >
      {groupNames.length ? (
        <Tabs defaultValue={groupNames[0] ?? "general"}>
          <TabsList className="flex h-auto flex-wrap justify-start">
            {groupNames.map((g) => (
              <TabsTrigger key={g} value={g}>
                {humanize(g)}
              </TabsTrigger>
            ))}
          </TabsList>
          {groupNames.map((g) => (
            <TabsContent key={g} value={g} className="mt-4 space-y-4">
              {groups[g]!.map((row) => {
                const key = String(row["key"]);
                return (
                  <SettingsCard
                    key={key}
                    title={humanize(key)}
                    {...(row["description"] ? { description: String(row["description"]) } : {})}
                    value={draft[key] ?? {}}
                    onChange={(next) => setDraft((d) => ({ ...d, [key]: next }))}
                    onSave={() => void save(key, g)}
                    saving={saving === key}
                  />
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      )}
    </AdminPage>
  );
}

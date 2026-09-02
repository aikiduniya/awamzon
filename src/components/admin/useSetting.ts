import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminList, adminSaveSetting } from "@/lib/admin.functions";

/** Loads a single site_settings row and lets an admin page edit + save it. */
export function useSetting<T extends Record<string, unknown>>(key: string, groupName: string, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void adminList({ data: { table: "site_settings", orderBy: "key" } }).then(
      (rows) => {
        if (!active) return;
        const row = rows.find((r) => String(r["key"]) === key);
        const stored = (row?.["value"] ?? {}) as Record<string, unknown>;
        setValue({ ...defaults, ...stored } as T);
        setLoading(false);
      },
      (error: unknown) => {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : "Could not load settings");
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    async (next?: T) => {
      setSaving(true);
      try {
        await adminSaveSetting({ data: { key, value: next ?? value, group_name: groupName } });
        toast.success("Saved — your storefront is updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save");
      } finally {
        setSaving(false);
      }
    },
    [key, groupName, value],
  );

  const patch = useCallback((next: Partial<T>) => setValue((v) => ({ ...v, ...next })), []);

  return { value, setValue, patch, loading, saving, save };
}

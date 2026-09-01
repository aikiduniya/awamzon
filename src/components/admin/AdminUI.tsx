import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminDelete, adminList, adminSave, type Row } from "@/lib/admin.functions";

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function humanize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

const LONG_KEYS = /(text|description|content|about|answer|copyright|body|excerpt|custom|robots)/i;
const COLOR_KEYS = /(color|background|foreground|primary|accent|muted|border)/i;

/** Renders an editable form from an arbitrary JSON settings object. */
export function JsonForm({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  const keys = Object.keys(value).sort();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {keys.map((key) => {
        const current = value[key];
        if (typeof current === "boolean") {
          return (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3 sm:col-span-1">
              <Label className="text-sm">{humanize(key)}</Label>
              <Switch checked={current} onCheckedChange={(c) => set(key, c)} />
            </div>
          );
        }
        if (typeof current === "number") {
          return (
            <Field key={key} label={humanize(key)}>
              <Input type="number" value={current} onChange={(e) => set(key, Number(e.target.value))} />
            </Field>
          );
        }
        const text = current == null ? "" : typeof current === "string" ? current : JSON.stringify(current, null, 2);
        const isLong = LONG_KEYS.test(key) || text.length > 80;
        return (
          <div key={key} className={isLong ? "sm:col-span-2" : ""}>
            <Field label={humanize(key)}>
              {isLong ? (
                <Textarea rows={3} value={text} onChange={(e) => set(key, e.target.value)} />
              ) : (
                <div className="flex gap-2">
                  <Input value={text} onChange={(e) => set(key, e.target.value)} />
                  {COLOR_KEYS.test(key) ? (
                    <span
                      className="h-9 w-9 shrink-0 rounded-md border"
                      style={{ background: text || "transparent" }}
                      aria-hidden
                    />
                  ) : null}
                </div>
              )}
            </Field>
          </div>
        );
      })}
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  value,
  onChange,
  onSave,
  saving,
}: {
  title: string;
  description?: string;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </CardHeader>
      <CardContent>
        <JsonForm value={value} onChange={onChange} />
      </CardContent>
    </Card>
  );
}

export function DeleteButton({ onConfirm, label = "Delete" }: { onConfirm: () => void; label?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Loads and mutates a CMS table through the secure admin server functions. */
export function useTable(table: string, orderBy?: string, ascending = true) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminList({ data: { table, ...(orderBy ? { orderBy } : {}), ascending } });
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [table, orderBy, ascending]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (values: Row) => {
      setSaving(true);
      try {
        await adminSave({ data: { table, values } });
        toast.success("Saved");
        await reload();
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [table, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await adminDelete({ data: { table, id } });
        toast.success("Deleted");
        await reload();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete");
      }
    },
    [table, reload],
  );

  return { rows, loading, saving, reload, save, remove };
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">{text}</div>;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

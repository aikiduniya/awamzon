import { createFileRoute } from "@tanstack/react-router";
import { Code2, Info } from "lucide-react";
import { AdminPage, Field } from "@/components/admin/AdminUI";
import { useSetting } from "@/components/admin/useSetting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/code")({ component: CustomCodeAdmin });

interface CodeValue extends Record<string, unknown> {
  enabled: boolean;
  label: string;
  head: string;
  bodyStart: string;
  bodyEnd: string;
  pages: string;
  devices: string;
}

const DEFAULTS: CodeValue = {
  enabled: false,
  label: "Global custom code",
  head: "",
  bodyStart: "",
  bodyEnd: "",
  pages: "*",
  devices: "all",
};

function CustomCodeAdmin() {
  const { value, patch, loading, saving, save } = useSetting<CodeValue>("custom_code", "integrations", DEFAULTS);

  return (
    <AdminPage
      title="Custom code"
      description="Inject your own scripts, styles or verification tags into the storefront without touching source code."
      actions={
        <Button onClick={() => void save()} disabled={saving || loading}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            This code runs in the visitor’s browser. Never paste API secrets, private keys or admin tokens here — only
            public snippets such as chat widgets, heatmaps or verification tags.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-primary" aria-hidden /> Placement & targeting
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Custom code enabled</span>
            <Switch checked={value.enabled} onCheckedChange={(c) => patch({ enabled: c })} />
          </div>
          <Field label="Label" hint="Internal reference only.">
            <Input value={value.label} onChange={(e) => patch({ label: e.target.value })} />
          </Field>
          <Field label="Pages" hint='Comma separated paths, or * for every page. Example: /, /shop, /product/*'>
            <Input value={value.pages} onChange={(e) => patch({ pages: e.target.value })} />
          </Field>
          <Field label="Devices">
            <Select value={value.devices} onValueChange={(v) => patch({ devices: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All devices</SelectItem>
                <SelectItem value="desktop">Desktop only</SelectItem>
                <SelectItem value="mobile">Mobile only</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Code blocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Head" hint="Injected inside <head>.">
            <Textarea rows={6} className="font-mono text-xs" value={value.head} onChange={(e) => patch({ head: e.target.value })} />
          </Field>
          <Field label="Body start" hint="Injected right after <body> opens.">
            <Textarea
              rows={6}
              className="font-mono text-xs"
              value={value.bodyStart}
              onChange={(e) => patch({ bodyStart: e.target.value })}
            />
          </Field>
          <Field label="Body end" hint="Injected right before </body> closes.">
            <Textarea
              rows={6}
              className="font-mono text-xs"
              value={value.bodyEnd}
              onChange={(e) => patch({ bodyEnd: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
    </AdminPage>
  );
}

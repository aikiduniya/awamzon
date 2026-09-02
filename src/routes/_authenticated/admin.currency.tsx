import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Coins, Info, Plus, Trash2 } from "lucide-react";
import { AdminPage, Field } from "@/components/admin/AdminUI";
import { useSetting } from "@/components/admin/useSetting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/currency")({ component: CurrencyAdmin });

interface CurrencyRow {
  code: string;
  label: string;
  symbol: string;
  rate: number;
  position: string;
  decimals: number;
  enabled: boolean;
  order: number;
}

interface CurrencyValue extends Record<string, unknown> {
  enabled: boolean;
  defaultCode: string;
  showSwitcher: boolean;
  note: string;
  list: CurrencyRow[];
}

const DEFAULTS: CurrencyValue = {
  enabled: false,
  defaultCode: "PKR",
  showSwitcher: false,
  note: "Prices are shown for reference. Checkout is always completed in the Shopify store currency.",
  list: [],
};

function CurrencyAdmin() {
  const { value, patch, loading, saving, save } = useSetting<CurrencyValue>("currency", "currency", DEFAULTS);
  const list = Array.isArray(value.list) ? value.list : [];

  const setList = (next: CurrencyRow[]) => patch({ list: next.map((c, i) => ({ ...c, order: i })) });

  const update = (index: number, fields: Partial<CurrencyRow>) =>
    setList(list.map((c, i) => (i === index ? { ...c, ...fields } : c)));

  const move = (index: number, delta: number) => {
    const next = [...list];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    setList(next);
  };

  return (
    <AdminPage
      title="Currency management"
      description="Control which currencies shoppers can browse in. Display only — Shopify remains the source of truth for the checkout currency."
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
            Converted prices are for browsing only. Shopify charges in the store/market currency at checkout, so keep your
            exchange rates close to the real ones to avoid surprising customers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="size-4 text-primary" aria-hidden /> Display settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Multi-currency display</span>
            <Switch checked={value.enabled} onCheckedChange={(c) => patch({ enabled: c })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Show currency switcher in header</span>
            <Switch checked={value.showSwitcher} onCheckedChange={(c) => patch({ showSwitcher: c })} />
          </div>
          <Field label="Default currency">
            <Select value={value.defaultCode} onValueChange={(v) => patch({ defaultCode: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {list
                  .filter((c) => c.enabled)
                  .map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Storefront note" hint="Shown near the currency switcher.">
              <Textarea rows={2} value={value.note} onChange={(e) => patch({ note: e.target.value })} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Currencies</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              setList([
                ...list,
                {
                  code: "",
                  label: "",
                  symbol: "",
                  rate: 1,
                  position: "before",
                  decimals: 2,
                  enabled: true,
                  order: list.length,
                },
              ])
            }
          >
            <Plus className="size-3.5" aria-hidden /> Add currency
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && list.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No currencies yet — add your store currency first.
            </p>
          ) : null}
          {list.map((c, index) => (
            <div key={index} className="grid gap-3 rounded-xl border p-4 lg:grid-cols-12">
              <div className="lg:col-span-2">
                <Field label="Code">
                  <Input
                    value={c.code}
                    placeholder="USD"
                    onChange={(e) => update(index, { code: e.target.value.toUpperCase() })}
                  />
                </Field>
              </div>
              <div className="lg:col-span-3">
                <Field label="Name">
                  <Input value={c.label} onChange={(e) => update(index, { label: e.target.value })} />
                </Field>
              </div>
              <div className="lg:col-span-1">
                <Field label="Symbol">
                  <Input value={c.symbol} onChange={(e) => update(index, { symbol: e.target.value })} />
                </Field>
              </div>
              <div className="lg:col-span-2">
                <Field label="Rate" hint="× store price">
                  <Input
                    type="number"
                    step="0.0001"
                    value={c.rate}
                    onChange={(e) => update(index, { rate: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="lg:col-span-1">
                <Field label="Decimals">
                  <Input
                    type="number"
                    min={0}
                    max={4}
                    value={c.decimals}
                    onChange={(e) => update(index, { decimals: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="lg:col-span-2">
                <Field label="Symbol position">
                  <Select value={c.position} onValueChange={(v) => update(index, { position: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before amount</SelectItem>
                      <SelectItem value="after">After amount</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="flex items-end justify-between gap-2 lg:col-span-1">
                <Switch
                  checked={c.enabled}
                  aria-label={`Enable ${c.code}`}
                  onCheckedChange={(v) => update(index, { enabled: v })}
                />
              </div>
              <div className="flex items-center gap-1 lg:col-span-12">
                <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" aria-hidden />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto gap-1.5 text-destructive"
                  onClick={() => setList(list.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-3.5" aria-hidden /> Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}

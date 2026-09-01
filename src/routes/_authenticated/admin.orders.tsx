import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Info, Receipt, ShieldCheck, Users } from "lucide-react";
import { adminList, type Row } from "@/lib/admin.functions";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: OrdersAdmin });

const money = (value: number, currency = "PKR") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

function OrdersAdmin() {
  const [orders, setOrders] = useState<Row[]>([]);
  const [customers, setCustomers] = useState<Row[]>([]);

  useEffect(() => {
    void adminList({ data: { table: "demo_orders", orderBy: "created_at", ascending: false } }).then(setOrders, () => setOrders([]));
    void adminList({ data: { table: "demo_customers", orderBy: "total_spent", ascending: false } }).then(
      setCustomers,
      () => setCustomers([]),
    );
  }, []);

  return (
    <AdminPage
      title="Orders & customers"
      description="Checkout, payments and fulfilment run on Shopify. The records below are seed data so you can preview the experience."
      actions={
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href="https://admin.shopify.com" target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" aria-hidden /> Open Shopify admin
          </a>
        </Button>
      }
    >
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            Live orders, refunds and customer accounts always stay in Shopify — the secure, PCI-compliant system of record.
            No payment data is duplicated here and no Shopify secret is ever exposed to the browser.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1.5">
            <Receipt className="size-3.5" aria-hidden /> Orders
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="size-3.5" aria-hidden /> Customers
          </TabsTrigger>
          <TabsTrigger value="how" className="gap-1.5">
            <ShieldCheck className="size-3.5" aria-hidden /> How it works
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders</CardTitle>
              <CardDescription>{orders.length} records</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {orders.length === 0 ? (
                <div className="px-6">
                  <EmptyState text="No orders to show" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-6 py-2.5 font-medium">Order</th>
                        <th className="px-3 py-2.5 font-medium">Date</th>
                        <th className="px-3 py-2.5 font-medium">Customer</th>
                        <th className="px-3 py-2.5 font-medium">Payment</th>
                        <th className="px-3 py-2.5 font-medium">Fulfilment</th>
                        <th className="px-3 py-2.5 font-medium">Items</th>
                        <th className="px-6 py-2.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={String(o["id"])} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="px-6 py-3 font-medium">
                            {String(o["order_number"])}
                            {o["is_demo"] ? (
                              <Badge variant="outline" className="ml-2 h-5 text-[10px]">
                                demo
                              </Badge>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {new Date(String(o["created_at"])).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3">
                            <span className="block">{String(o["customer_name"])}</span>
                            <span className="block text-xs text-muted-foreground">{String(o["customer_email"])}</span>
                          </td>
                          <td className="px-3 py-3">
                            <Pill value={String(o["financial_status"])} />
                          </td>
                          <td className="px-3 py-3">
                            <Pill value={String(o["fulfillment_status"])} />
                          </td>
                          <td className="px-3 py-3 tabular-nums">{String(o["items"])}</td>
                          <td className="px-6 py-3 text-right font-medium tabular-nums">
                            {money(Number(o["total"]), String(o["currency"] ?? "PKR"))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customers.length === 0 ? <EmptyState text="No customers to show" /> : null}
            {customers.map((c) => (
              <Card key={String(c["id"])}>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {String(c["name"]).slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{String(c["name"])}</p>
                    <p className="truncate text-xs text-muted-foreground">{String(c["email"])}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium tabular-nums">{money(Number(c["total_spent"]))}</span>{" "}
                      <span className="text-muted-foreground">· {String(c["orders_count"])} orders</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {String(c["city"] ?? "—")}
                      </Badge>
                      {((c["tags"] as string[] | null) ?? []).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="how" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Secure checkout flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>The storefront cart is created through the Shopify Storefront API and checkout completes on Shopify.</p>
                <p>Orders, refunds, customers and inventory therefore live in your Shopify admin.</p>
                <p>Everything else — content, design, navigation, SEO and marketing — is fully editable in this CMS.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manage in Shopify</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Open your Shopify admin to view real orders, customers and inventory.</p>
                <a className="text-primary underline" href="https://admin.shopify.com" target="_blank" rel="noreferrer">
                  Open Shopify admin
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}

function Pill({ value }: { value: string }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    fulfilled: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    unfulfilled: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    refunded: "bg-destructive/10 text-destructive",
    returned: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", map[value] ?? "bg-muted")}>
      {value}
    </span>
  );
}

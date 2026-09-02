import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Info, Receipt, ShieldCheck, Users } from "lucide-react";
import { adminList, type Row } from "@/lib/admin.functions";
import { AdminPage } from "@/components/admin/AdminUI";
import { DataTable, type DataColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const orderColumns: Array<DataColumn<Row>> = [
    {
      key: "order_number",
      header: "Order",
      value: (o) => String(o["order_number"] ?? ""),
      render: (o) => (
        <span className="font-medium">
          {String(o["order_number"])}
          {o["is_demo"] ? (
            <Badge variant="outline" className="ml-2 h-5 text-[10px]">
              demo
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      value: (o) => String(o["created_at"] ?? ""),
      render: (o) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(String(o["created_at"])).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      value: (o) => String(o["customer_name"] ?? ""),
      render: (o) => (
        <div>
          <span className="block">{String(o["customer_name"])}</span>
          <span className="block text-xs text-muted-foreground">{String(o["customer_email"])}</span>
        </div>
      ),
    },
    {
      key: "financial_status",
      header: "Payment",
      value: (o) => String(o["financial_status"] ?? ""),
      render: (o) => <Pill value={String(o["financial_status"])} />,
    },
    {
      key: "fulfillment_status",
      header: "Fulfilment",
      value: (o) => String(o["fulfillment_status"] ?? ""),
      render: (o) => <Pill value={String(o["fulfillment_status"])} />,
    },
    { key: "channel", header: "Channel", hidden: true, value: (o) => String(o["channel"] ?? "") },
    { key: "items", header: "Items", value: (o) => Number(o["items"] ?? 0) },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      value: (o) => Number(o["total"] ?? 0),
      render: (o) => (
        <span className="block text-right font-medium tabular-nums">
          {money(Number(o["total"]), String(o["currency"] ?? "PKR"))}
        </span>
      ),
    },
  ];

  const customerColumns: Array<DataColumn<Row>> = [
    {
      key: "name",
      header: "Customer",
      value: (c) => String(c["name"] ?? ""),
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {String(c["name"]).slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{String(c["name"])}</p>
            <p className="truncate text-xs text-muted-foreground">{String(c["email"])}</p>
          </div>
        </div>
      ),
    },
    { key: "city", header: "City", value: (c) => String(c["city"] ?? "—") },
    { key: "country", header: "Country", hidden: true, value: (c) => String(c["country"] ?? "—") },
    { key: "orders_count", header: "Orders", value: (c) => Number(c["orders_count"] ?? 0) },
    {
      key: "total_spent",
      header: "Total spent",
      className: "text-right",
      value: (c) => Number(c["total_spent"] ?? 0),
      render: (c) => <span className="block text-right font-medium tabular-nums">{money(Number(c["total_spent"]))}</span>,
    },
    {
      key: "tags",
      header: "Tags",
      value: (c) => ((c["tags"] as string[] | null) ?? []).join(", "),
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {((c["tags"] as string[] | null) ?? []).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

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
          <DataTable
            rows={orders}
            columns={orderColumns}
            getId={(o) => String(o["id"])}
            searchPlaceholder="Search orders…"
            csvName="orders"
            emptyText="No orders to show"
            dateValue={(o) => String(o["created_at"] ?? "")}
            filters={[
              {
                key: "financial_status",
                label: "Payment",
                options: [
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "refunded", label: "Refunded" },
                ],
                match: (o, v) => String(o["financial_status"] ?? "") === v,
              },
              {
                key: "fulfillment_status",
                label: "Fulfilment",
                options: [
                  { value: "fulfilled", label: "Fulfilled" },
                  { value: "unfulfilled", label: "Unfulfilled" },
                  { value: "returned", label: "Returned" },
                ],
                match: (o, v) => String(o["fulfillment_status"] ?? "") === v,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <DataTable
            rows={customers}
            columns={customerColumns}
            getId={(c) => String(c["id"])}
            searchPlaceholder="Search customers…"
            csvName="customers"
            emptyText="No customers to show"
            dateValue={(c) => String(c["created_at"] ?? "")}
            filters={[
              {
                key: "city",
                label: "Cities",
                options: Array.from(new Set(customers.map((c) => String(c["city"] ?? "")).filter(Boolean))).map((c) => ({
                  value: c,
                  label: c,
                })),
                match: (c, v) => String(c["city"] ?? "") === v,
              },
            ]}
          />
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

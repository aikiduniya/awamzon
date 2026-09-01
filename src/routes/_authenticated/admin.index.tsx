import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CircleDollarSign,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Newspaper,
  Receipt,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { adminDashboard, purgeDemoData, type Row } from "@/lib/admin.functions";
import { AdminPage, EmptyState } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

type Data = Awaited<ReturnType<typeof adminDashboard>>;

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

const CONTENT_LINKS: Array<{ key: string; label: string; to: string; icon: typeof FileText }> = [
  { key: "pages", label: "Pages", to: "/admin/pages", icon: FileText },
  { key: "blog_posts", label: "Blog posts", to: "/admin/blog", icon: Newspaper },
  { key: "faqs", label: "FAQs", to: "/admin/faq", icon: HelpCircle },
  { key: "media", label: "Media", to: "/admin/media", icon: ImageIcon },
  { key: "homepage_sections", label: "Homepage sections", to: "/admin/homepage", icon: LayoutTemplate },
  { key: "menu_items", label: "Menu items", to: "/admin/menus", icon: LayoutTemplate },
  { key: "subscribers", label: "Subscribers", to: "/admin/subscribers", icon: Mail },
  { key: "contact_messages", label: "Messages", to: "/admin/messages", icon: MessageSquare },
];

function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminDashboard());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function purge() {
    try {
      await purgeDemoData();
      toast.success("Demo data removed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove demo data");
    }
  }

  const currency = data?.currency ?? "PKR";
  const k = data?.kpis;

  return (
    <AdminPage
      title="Dashboard"
      description="Live commerce metrics and every storefront setting, editable without touching code."
      actions={
        <>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/products">
              <ShoppingBag className="size-3.5" aria-hidden /> Products
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/admin/homepage">
              <Sparkles className="size-3.5" aria-hidden /> Edit homepage
            </Link>
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Revenue (30 days)"
            value={money(k?.revenue ?? 0, currency)}
            trend={k?.revenueTrend ?? 0}
            icon={CircleDollarSign}
            tone="emerald"
          />
          <Kpi label="Orders (30 days)" value={String(k?.orders ?? 0)} trend={k?.ordersTrend ?? 0} icon={Receipt} tone="violet" />
          <Kpi
            label="Average order value"
            value={money(k?.aov ?? 0, currency)}
            trend={k?.aovTrend ?? 0}
            icon={TrendingUp}
            tone="amber"
          />
          <Kpi label="Customers" value={String(k?.customers ?? 0)} trend={k?.customersTrend ?? 0} icon={Users} tone="sky" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Revenue, last 14 days</CardTitle>
              <CardDescription>Sales trend across all channels.</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3" aria-hidden /> {k?.ordersTrend ?? 0}%
            </Badge>
          </CardHeader>
          <CardContent className="h-[260px] pl-0">
            {data?.series?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.series} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={16} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={54} />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-popover)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => money(Number(value), currency)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No sales data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4 text-primary" aria-hidden /> Notifications
            </CardTitle>
            {data?.notifications?.length ? <Badge variant="secondary">{data.notifications.length}</Badge> : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.notifications?.length ? (
              data.notifications.slice(0, 5).map((n) => (
                <div key={String(n["id"])} className="flex gap-3 rounded-lg border p-3">
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      n["level"] === "warning" && "bg-amber-500",
                      n["level"] === "success" && "bg-emerald-500",
                      n["level"] === "info" && "bg-sky-500",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{String(n["title"])}</p>
                    <p className="text-xs text-muted-foreground">{String(n["body"] ?? "")}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="You are all caught up" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="size-4 text-primary" aria-hidden /> Recent orders
              </CardTitle>
              <CardDescription>Live orders and payments are processed by Shopify.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {data?.orders?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-2.5 font-medium">Order</th>
                      <th className="px-3 py-2.5 font-medium">Customer</th>
                      <th className="px-3 py-2.5 font-medium">Status</th>
                      <th className="px-6 py-2.5 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o: Row) => (
                      <tr key={String(o["id"])} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-6 py-3 font-medium">{String(o["order_number"])}</td>
                        <td className="px-3 py-3">
                          <span className="block">{String(o["customer_name"])}</span>
                          <span className="block text-xs text-muted-foreground">{String(o["channel"])}</span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge value={String(o["financial_status"])} />
                        </td>
                        <td className="px-6 py-3 text-right font-medium tabular-nums">
                          {money(Number(o["total"]), String(o["currency"] ?? currency))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6">
                <EmptyState text="No orders yet" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" aria-hidden /> Top customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.customers?.length ? (
              data.customers.map((c: Row) => (
                <div key={String(c["id"])} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {String(c["name"]).slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{String(c["name"])}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(c["city"] ?? "")} · {String(c["orders_count"])} orders
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{money(Number(c["total_spent"]), currency)}</span>
                </div>
              ))
            ) : (
              <EmptyState text="No customers yet" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content at a glance</CardTitle>
          <CardDescription>Jump straight into any part of the CMS.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CONTENT_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xl font-semibold leading-none">{data?.counts?.[item.key] ?? 0}</span>
                    <span className="block text-xs text-muted-foreground">{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4 text-primary" aria-hidden /> Latest messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.messages?.length ? (
              data.messages.map((m: Row) => (
                <div key={String(m["id"])} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{String(m["name"])}</p>
                    {m["status"] === "new" ? <Badge className="h-5">New</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{String(m["email"])}</p>
                  <p className="mt-1 text-muted-foreground">{String(m["subject"] ?? "")}</p>
                </div>
              ))
            ) : (
              <EmptyState text="No messages yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data?.recent?.length ? (
              data.recent.map((a: Row) => (
                <div key={String(a["id"])} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
                  <span className="truncate">
                    <span className="font-medium capitalize">{String(a["action"]).replace(/_/g, " ")}</span>{" "}
                    <span className="text-muted-foreground">in {String(a["module"])}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(String(a["created_at"])).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState text="No activity yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {data?.demoActive ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" aria-hidden /> Demo content is active
            </CardTitle>
            <CardDescription>
              Sample pages, posts, FAQs, media, subscribers, messages, orders and customers are loaded so you can preview
              every screen. Everything is flagged as demo and can be removed in one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="size-3.5" aria-hidden /> Remove all demo data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes every row flagged as demo content. Your own content and Shopify products are
                    not affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={purge}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ) : null}
    </AdminPage>
  );
}

const TONES: Record<string, string> = {
  emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
  violet: "from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-400",
  amber: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400",
  sky: "from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-400",
};

function Kpi({
  label,
  value,
  trend,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  trend: number;
  icon: typeof TrendingUp;
  tone: keyof typeof TONES;
}) {
  const up = trend >= 0;
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", TONES[tone])} aria-hidden />
      <CardContent className="relative flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
          <p
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive",
            )}
          >
            {up ? <ArrowUpRight className="size-3" aria-hidden /> : <ArrowDownRight className="size-3" aria-hidden />}
            {Math.abs(trend)}% vs previous 30 days
          </p>
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-background/70 shadow-sm", TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    refunded: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", map[value] ?? "bg-muted")}>
      {value}
    </span>
  );
}

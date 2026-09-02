import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminMe, claimOwnership } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Code2,
  Coins,
  FileText,
  HelpCircle,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Package,
  Palette,
  PanelsTopLeft,
  PlugZap,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserCog,
  Users,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin | Store CMS" }, { name: "robots", content: "noindex, nofollow" }] }),
});

const NAV: Array<{ group: string; items: Array<{ to: string; label: string; icon: LucideIcon }> }> = [
  {
    group: "Commerce",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/products", label: "Products & inventory", icon: Package },
      { to: "/admin/orders", label: "Orders & customers", icon: ShoppingCart },
      { to: "/admin/currency", label: "Currency management", icon: Coins },
    ],
  },
  {
    group: "Storefront",
    items: [
      { to: "/admin/homepage", label: "Homepage builder", icon: LayoutTemplate },
      { to: "/admin/menus", label: "Header & footer menus", icon: Menu },
      { to: "/admin/theme", label: "Theme, colors & fonts", icon: Palette },
      { to: "/admin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/blog", label: "Blog", icon: Newspaper },
      { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    group: "Marketing",
    items: [
      { to: "/admin/settings", label: "Settings & banners", icon: Megaphone },
      { to: "/admin/subscribers", label: "Subscribers", icon: Users },
      { to: "/admin/messages", label: "Contact messages", icon: MessageSquare },
      { to: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
  },
  {
    group: "SEO",
    items: [
      { to: "/admin/seo", label: "SEO manager", icon: Search },
      { to: "/admin/redirects", label: "Redirects", icon: RouteIcon },
      { to: "/admin/security", label: "Security & performance", icon: ShieldCheck },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/admin/integrations", label: "Integrations & tracking", icon: PlugZap },
      { to: "/admin/code", label: "Custom code", icon: Code2 },
      { to: "/admin/users", label: "Users & roles", icon: UserCog },
      { to: "/admin/activity", label: "Activity log", icon: History },
    ],
  },
];

type Me = Awaited<ReturnType<typeof adminMe>>;

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMe(await adminMe());
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  async function claim() {
    try {
      await claimOwnership();
      toast.success("You are now the store owner");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim ownership");
    }
  }

  const nav = (
    <nav className="space-y-7 px-3 py-5">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {section.group}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all",
                      "hover:bg-accent hover:text-foreground",
                      active &&
                        "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_var(--color-primary)] hover:bg-primary/15 hover:text-primary",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110")} aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading admin…</div>;
  }

  if (!me?.isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No admin access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your account ({me?.email ?? "signed in"}) has no staff role yet. If you are setting up this store for the
              first time, claim ownership below. Otherwise ask an administrator to grant you a role.
            </p>
            <div className="flex gap-2">
              <Button onClick={claim}>Claim store ownership</Button>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto p-0">
            {nav}
          </SheetContent>
        </Sheet>
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">Store admin</span>
            <span className="hidden text-xs text-muted-foreground sm:block">Commerce control centre</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {me.roles.slice(0, 2).map((r) => (
            <Badge key={r} variant="secondary" className="hidden capitalize md:inline-flex">
              {r.replace(/_/g, " ")}
            </Badge>
          ))}
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">View store</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-[264px] shrink-0 border-r bg-background lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {nav}
            <div className="px-6 pb-6">
              <div className="rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <PanelsTopLeft className="size-3.5" aria-hidden /> No code needed
                </p>
                <p className="mt-1">Every storefront element on this list updates the live site instantly.</p>
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

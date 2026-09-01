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

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin | Store CMS" }, { name: "robots", content: "noindex, nofollow" }] }),
});

const NAV: Array<{ group: string; items: Array<{ to: string; label: string }> }> = [
  {
    group: "Overview",
    items: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/products", label: "Products & inventory" },
      { to: "/admin/orders", label: "Orders & customers" },
    ],
  },
  {
    group: "Storefront",
    items: [
      { to: "/admin/homepage", label: "Homepage builder" },
      { to: "/admin/menus", label: "Header & footer menus" },
      { to: "/admin/theme", label: "Theme, colors & fonts" },
      { to: "/admin/media", label: "Media library" },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin/pages", label: "Pages" },
      { to: "/admin/blog", label: "Blog" },
      { to: "/admin/faq", label: "FAQ" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { to: "/admin/settings", label: "Settings & banners" },
      { to: "/admin/subscribers", label: "Subscribers" },
      { to: "/admin/messages", label: "Contact messages" },
    ],
  },
  {
    group: "SEO",
    items: [
      { to: "/admin/seo", label: "SEO manager" },
      { to: "/admin/redirects", label: "Redirects" },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/admin/users", label: "Users & roles" },
      { to: "/admin/activity", label: "Activity log" },
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
    <nav className="space-y-6 p-4">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.group}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "block rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                      active && "bg-primary/10 font-medium text-primary",
                    )}
                  >
                    {item.label}
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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto p-0">
            {nav}
          </SheetContent>
        </Sheet>
        <Link to="/admin" className="font-semibold">
          Store admin
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {me.roles.map((r) => (
            <Badge key={r} variant="secondary" className="hidden sm:inline-flex">
              {r.replace("_", " ")}
            </Badge>
          ))}
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noreferrer">
              View store
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
          <div className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto">{nav}</div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

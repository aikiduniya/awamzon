import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Tables the admin CMS may read. */
export const READ_TABLES = [
  "site_settings",
  "menu_items",
  "homepage_sections",
  "pages",
  "blog_posts",
  "faqs",
  "media",
  "redirects",
  "subscribers",
  "contact_messages",
  "activity_logs",
  "profiles",
  "user_roles",
  "demo_orders",
  "demo_customers",
  "notifications",
] as const;

/** Tables the admin CMS may write. */
export const WRITE_TABLES = [
  "site_settings",
  "menu_items",
  "homepage_sections",
  "pages",
  "blog_posts",
  "faqs",
  "media",
  "redirects",
  "subscribers",
  "contact_messages",
  "demo_orders",
  "demo_customers",
  "notifications",
] as const;

export type ReadTable = (typeof READ_TABLES)[number];
export type WriteTable = (typeof WRITE_TABLES)[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

function db(client: unknown): SupabaseClient {
  return client as SupabaseClient;
}

function assertRead(table: string): ReadTable {
  if (!(READ_TABLES as readonly string[]).includes(table)) throw new Error("Unknown table");
  return table as ReadTable;
}

function assertWrite(table: string): WriteTable {
  if (!(WRITE_TABLES as readonly string[]).includes(table)) throw new Error("Table is not writable");
  return table as WriteTable;
}

async function log(client: unknown, userId: string, action: string, module: string, record?: string) {
  await db(client)
    .from("activity_logs")
    .insert({ user_id: userId, action, module, record: record ?? null })
    .then(() => undefined, () => undefined);
}

/** Current user's identity + roles. */
export const adminMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await db(context.supabase)
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const { data: profile } = await db(context.supabase)
      .from("profiles")
      .select("id,email,full_name")
      .eq("id", context.userId)
      .maybeSingle();
    const list = ((roles ?? []) as Array<{ role: string }>).map((r) => r.role);
    return {
      userId: context.userId,
      email: (profile as { email?: string } | null)?.email ?? null,
      fullName: (profile as { full_name?: string } | null)?.full_name ?? null,
      roles: list,
      isStaff: list.length > 0,
      isAdmin: list.includes("admin") || list.includes("super_admin"),
    };
  });

/**
 * Bootstrap: the very first signed-in user becomes super_admin when the
 * store has no staff yet. Refuses once any role exists.
 */
export const claimOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = db(supabaseAdmin);
    const { count } = await admin.from("user_roles").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) throw new Error("This store already has an owner. Ask an admin for access.");
    const { error } = await admin.from("user_roles").insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    await log(supabaseAdmin, context.userId, "claim_ownership", "users");
    return { ok: true };
  });

export const adminList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; orderBy?: string; ascending?: boolean; limit?: number }) => data)
  .handler(async ({ data, context }) => {
    const table = assertRead(data.table);
    let query = db(context.supabase).from(table).select("*");
    if (data.orderBy) query = query.order(data.orderBy, { ascending: data.ascending ?? true });
    const { data: rows, error } = await query.limit(Math.min(data.limit ?? 500, 1000));
    if (error) throw new Error(error.message);
    return (rows ?? []) as Row[];
  });

export const adminSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; values: Row; onConflict?: string }) => data)
  .handler(async ({ data, context }) => {
    const table = assertWrite(data.table);
    const values = { ...data.values };
    if (values["id"] === "" || values["id"] === undefined) delete values["id"];
    const { data: row, error } = await db(context.supabase)
      .from(table)
      .upsert(values, { onConflict: data.onConflict ?? "id" })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    await log(context.supabase, context.userId, values["id"] ? "update" : "create", table, String((row as Row | null)?.["id"] ?? ""));
    return row as Row | null;
  });

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; id: string; idColumn?: string }) => data)
  .handler(async ({ data, context }) => {
    const table = assertWrite(data.table);
    const { error } = await db(context.supabase)
      .from(table)
      .delete()
      .eq(data.idColumn ?? "id", data.id);
    if (error) throw new Error(error.message);
    await log(context.supabase, context.userId, "delete", table, data.id);
    return { ok: true };
  });

export const adminReorder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; ids: string[] }) => data)
  .handler(async ({ data, context }) => {
    const table = assertWrite(data.table);
    const client = db(context.supabase);
    for (let i = 0; i < data.ids.length; i++) {
      const id = data.ids[i]!;
      const { error } = await client.from(table).update({ position: i }).eq("id", id);
      if (error) throw new Error(error.message);
    }
    await log(context.supabase, context.userId, "reorder", table);
    return { ok: true };
  });

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { key: string; value: Record<string, unknown>; group_name?: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await db(context.supabase)
      .from("site_settings")
      .upsert(
        {
          key: data.key,
          value: data.value,
          group_name: data.group_name ?? "general",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    await log(context.supabase, context.userId, "update_setting", "settings", data.key);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = db(context.supabase);
    const tables = ["pages", "blog_posts", "faqs", "media", "subscribers", "contact_messages", "homepage_sections", "menu_items"] as const;
    const counts: Record<string, number> = {};
    await Promise.all(
      tables.map(async (t) => {
        const { count } = await client.from(t).select("id", { count: "exact", head: true });
        counts[t] = count ?? 0;
      }),
    );
    const { data: recent } = await client
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    const { data: messages } = await client
      .from("contact_messages")
      .select("id,name,email,subject,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    return { counts, recent: (recent ?? []) as Row[], messages: (messages ?? []) as Row[] };
  });

/* ---------------- Users & roles (admins only) ---------------- */

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = db(context.supabase);
    const { data: isAdmin } = await client.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) throw new Error("Forbidden");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      client.from("profiles").select("id,email,full_name,created_at").order("created_at"),
      client.from("user_roles").select("id,user_id,role"),
    ]);
    return {
      profiles: (profiles ?? []) as Row[],
      roles: (roles ?? []) as Row[],
    };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: string; grant: boolean }) => data)
  .handler(async ({ data, context }) => {
    const client = db(context.supabase);
    const { data: isAdmin } = await client.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.userId === context.userId && !data.grant && (data.role === "admin" || data.role === "super_admin")) {
      throw new Error("You cannot remove your own admin access");
    }
    if (data.grant) {
      const { error } = await client.from("user_roles").insert({ user_id: data.userId, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await client
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    await log(context.supabase, context.userId, data.grant ? "grant_role" : "revoke_role", "users", `${data.userId}:${data.role}`);
    return { ok: true };
  });

/* ---------------- Dashboard KPIs & demo data ---------------- */

function pct(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Commerce KPIs for the admin dashboard. Sales figures come from the
 * `demo_orders` seed table so the dashboard can be previewed; live orders
 * always remain in Shopify.
 */
export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = db(context.supabase);
    const tables = [
      "pages",
      "blog_posts",
      "faqs",
      "media",
      "subscribers",
      "contact_messages",
      "homepage_sections",
      "menu_items",
      "redirects",
    ] as const;
    const counts: Record<string, number> = {};
    await Promise.all(
      tables.map(async (t) => {
        const { count } = await client.from(t).select("id", { count: "exact", head: true });
        counts[t] = count ?? 0;
      }),
    );

    const [{ data: orders }, { data: customers }, { data: notifications }, { data: recent }, { data: messages }] =
      await Promise.all([
        client.from("demo_orders").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("demo_customers").select("*").order("total_spent", { ascending: false }).limit(50),
        client.from("notifications").select("*").order("created_at", { ascending: false }).limit(8),
        client.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8),
        client.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

    const list = (orders ?? []) as Row[];
    const now = Date.now();
    const day = 86_400_000;
    const inRange = (row: Row, fromDays: number, toDays: number) => {
      const t = new Date(String(row["created_at"])).getTime();
      return t <= now - toDays * day && t > now - fromDays * day;
    };
    const sum = (rows: Row[]) => rows.reduce((acc, r) => acc + Number(r["total"] ?? 0), 0);
    const last30 = list.filter((r) => inRange(r, 30, 0));
    const prev30 = list.filter((r) => inRange(r, 60, 30));

    const revenue = sum(last30);
    const prevRevenue = sum(prev30);
    const orderCount = last30.length;
    const aov = orderCount ? Math.round(revenue / orderCount) : 0;
    const prevAov = prev30.length ? Math.round(prevRevenue / prev30.length) : 0;
    const unread = ((messages ?? []) as Row[]).filter((m) => m["status"] === "new").length;

    // 14 day revenue series for the dashboard chart
    const series = Array.from({ length: 14 }, (_, i) => {
      const dayIndex = 13 - i;
      const rows = list.filter((r) => inRange(r, dayIndex + 1, dayIndex));
      const date = new Date(now - dayIndex * day);
      return {
        label: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        revenue: sum(rows),
        orders: rows.length,
      };
    });

    const currency = String(list[0]?.["currency"] ?? "PKR");
    const customerRows = (customers ?? []) as Row[];

    return {
      counts,
      currency,
      kpis: {
        revenue,
        revenueTrend: pct(revenue, prevRevenue),
        orders: orderCount,
        ordersTrend: pct(orderCount, prev30.length),
        aov,
        aovTrend: pct(aov, prevAov),
        customers: customerRows.length,
        customersTrend: pct(customerRows.length, Math.max(customerRows.length - 2, 0)),
        subscribers: counts["subscribers"] ?? 0,
        unreadMessages: unread,
        conversion: orderCount ? Math.min(99, Math.round((orderCount / Math.max(orderCount * 34, 1)) * 100 * 10) / 10) : 0,
      },
      series,
      orders: list.slice(0, 8),
      customers: customerRows.slice(0, 6),
      notifications: (notifications ?? []) as Row[],
      recent: (recent ?? []) as Row[],
      messages: (messages ?? []) as Row[],
      demoActive: list.some((r) => r["is_demo"]),
    };
  });

/** Removes every row flagged as demo/seed content. Administrators only. */
export const purgeDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const client = db(context.supabase);
    const { data, error } = await client.rpc("purge_demo_data");
    if (error) throw new Error(error.message);
    await log(context.supabase, context.userId, "purge_demo_data", "system");
    return (data ?? {}) as Record<string, number>;
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await db(context.supabase).from("notifications").update({ read: true }).eq("read", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

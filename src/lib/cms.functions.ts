import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SettingsMap, SiteConfig } from "./cms-types";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getSiteConfig = createServerFn({ method: "GET" }).handler(async (): Promise<SiteConfig> => {
  const supabase = publicClient();
  const [settings, menus, sections, faqs, ctas] = await Promise.all([
    supabase.from("site_settings").select("key,value"),
    supabase.from("menu_items").select("*").eq("enabled", true).order("position"),
    supabase.from("homepage_sections").select("*").order("position"),
    supabase.from("faqs").select("*").eq("enabled", true).order("position"),
    supabase.from("cta_blocks").select("*").eq("enabled", true).order("position"),
  ]);

  const settingsMap: SettingsMap = {};
  for (const row of settings.data ?? []) {
    settingsMap[row.key] = (row.value ?? {}) as SettingsMap[string];
  }

  const now = Date.now();
  const activeSections = (sections.data ?? []).filter((s) => {
    if (!s.enabled) return false;
    if (s.starts_at && new Date(s.starts_at).getTime() > now) return false;
    if (s.ends_at && new Date(s.ends_at).getTime() < now) return false;
    return true;
  });

  return {
    settings: settingsMap,
    menus: (menus.data ?? []) as SiteConfig["menus"],
    sections: activeSections as unknown as SiteConfig["sections"],
    faqs: (faqs.data ?? []) as SiteConfig["faqs"],
    ctas: (ctas.data ?? []) as unknown as SiteConfig["ctas"],
  };
});


export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: page } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return page;
  });

export const getBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  return data ?? [];
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: post } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return post;
  });

export const getRedirect = createServerFn({ method: "GET" })
  .inputValidator((data: { path: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row } = await supabase
      .from("redirects")
      .select("*")
      .eq("from_path", data.path)
      .eq("active", true)
      .maybeSingle();
    return row;
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; source?: string }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) throw new Error("Invalid email address");
    return { email, source: (data.source ?? "site").slice(0, 60) };
  })
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("subscribers").insert({ email: data.email, source: data.source });
    if (error && !error.message.includes("duplicate")) throw new Error("Could not subscribe");
    return { ok: true };
  });

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; subject?: string; message: string; company?: string }) => {
    if (data.company) throw new Error("Spam detected");
    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim().toLowerCase();
    const message = String(data.message ?? "").trim();
    if (!name || name.length > 100) throw new Error("Please enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) throw new Error("Invalid email address");
    if (!message || message.length > 10000) throw new Error("Message is too long");
    return { name, email, message, subject: String(data.subject ?? "").slice(0, 150) };
  })
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: securityRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "security")
      .maybeSingle();
    const security = (securityRow?.value ?? {}) as Record<string, unknown>;
    const maxLength = Number(security["maxContactMessageLength"] ?? 2000) || 2000;
    if (data.message.length > maxLength) throw new Error(`Message must be under ${maxLength} characters`);
    const { error } = await supabase.from("contact_messages").insert(data);
    if (error) throw new Error("Could not send message");
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase.from("site_settings").select("key,value");
  const map: SettingsMap = {};
  for (const row of data ?? []) map[row.key] = (row.value ?? {}) as SettingsMap[string];
  return map;
});

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase.from("faqs").select("*").eq("enabled", true).order("position");
  return data ?? [];
});

export const getRedirects = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase.from("redirects").select("from_path,to_path,status_code").eq("active", true);
  return data ?? [];
});

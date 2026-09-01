-- ROLES
create type public.app_role as enum ('super_admin','admin','editor','seo_manager','content_manager','order_manager','support_manager');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin'))
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- PROFILES
create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.is_staff(auth.uid()));
create policy "own profile write" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- SETTINGS
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  group_name text not null default 'general',
  type text not null default 'json',
  description text,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "settings staff write" on public.site_settings for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- PAGES
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pages_status_idx on public.pages(status);
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "pages public read" on public.pages for select to anon using (status = 'published');
create policy "pages staff read" on public.pages for select to authenticated using (status = 'published' or public.is_staff(auth.uid()));
create policy "pages staff write" on public.pages for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

-- HOMEPAGE SECTIONS
create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text,
  position int not null default 0,
  enabled boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index homepage_sections_pos_idx on public.homepage_sections(position);
grant select on public.homepage_sections to anon, authenticated;
grant insert, update, delete on public.homepage_sections to authenticated;
grant all on public.homepage_sections to service_role;
alter table public.homepage_sections enable row level security;
create policy "sections public read" on public.homepage_sections for select to anon, authenticated using (true);
create policy "sections staff write" on public.homepage_sections for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger homepage_sections_touch before update on public.homepage_sections for each row execute function public.touch_updated_at();

-- MENU ITEMS
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'header',
  label text not null,
  url text not null default '/',
  position int not null default 0,
  enabled boolean not null default true,
  column_group text,
  created_at timestamptz not null default now()
);
create index menu_items_location_idx on public.menu_items(location, position);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "menu public read" on public.menu_items for select to anon, authenticated using (true);
create policy "menu staff write" on public.menu_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- BLOG
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text default '',
  content text not null default '',
  cover_image text,
  cover_alt text,
  category text,
  author text,
  tags text[] not null default '{}',
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy "posts public read" on public.blog_posts for select to anon using (status = 'published');
create policy "posts staff read" on public.blog_posts for select to authenticated using (status = 'published' or public.is_staff(auth.uid()));
create policy "posts staff write" on public.blog_posts for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger blog_posts_touch before update on public.blog_posts for each row execute function public.touch_updated_at();

-- FAQ
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'general',
  position int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "faq public read" on public.faqs for select to anon, authenticated using (true);
create policy "faq staff write" on public.faqs for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- REDIRECTS
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status_code int not null default 301,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.redirects to anon, authenticated;
grant insert, update, delete on public.redirects to authenticated;
grant all on public.redirects to service_role;
alter table public.redirects enable row level security;
create policy "redirects public read" on public.redirects for select to anon, authenticated using (true);
create policy "redirects staff write" on public.redirects for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- MEDIA
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text default '',
  title text,
  caption text,
  category text,
  created_at timestamptz not null default now()
);
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "media public read" on public.media for select to anon, authenticated using (true);
create policy "media staff write" on public.media for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- SUBSCRIBERS
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed',
  source text,
  created_at timestamptz not null default now()
);
grant insert on public.subscribers to anon, authenticated;
grant select, update, delete on public.subscribers to authenticated;
grant all on public.subscribers to service_role;
alter table public.subscribers enable row level security;
create policy "subscribe anyone" on public.subscribers for insert to anon, authenticated with check (true);
create policy "subscribers staff read" on public.subscribers for select to authenticated using (public.is_staff(auth.uid()));
create policy "subscribers staff write" on public.subscribers for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- CONTACT MESSAGES
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "contact anyone" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "contact staff read" on public.contact_messages for select to authenticated using (public.is_staff(auth.uid()));
create policy "contact staff write" on public.contact_messages for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ACTIVITY LOG
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text not null,
  module text not null,
  record text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "logs staff read" on public.activity_logs for select to authenticated using (public.is_staff(auth.uid()));
create policy "logs staff insert" on public.activity_logs for insert to authenticated with check (public.is_staff(auth.uid()));

-- SEED SETTINGS
insert into public.site_settings (key, value, group_name, type, description) values
('store', '{"name":"Studio Store","tagline":"Modern essentials, thoughtfully made","logoUrl":"","logoText":"STUDIO","faviconUrl":"/favicon.ico","email":"hello@studiostore.com","phone":"+92 300 0000000","address":"Karachi, Pakistan","currencyNote":"Prices shown in store currency"}', 'general', 'json', 'Core store identity used across header, footer and SEO'),
('seo', '{"siteTitle":"Studio Store","defaultTitle":"Studio Store — Modern essentials","defaultDescription":"Shop modern, well-made essentials. Fast checkout, secure payments and worldwide shipping.","keywords":"modern essentials, online store, shop","ogImage":"","twitterImage":"","brandName":"Studio Store","titleTemplateProduct":"{product_title} | {site_name}","titleTemplateCollection":"{collection_title} | {site_name}","titleTemplateBlog":"{post_title} | {site_name}"}', 'seo', 'json', 'Global SEO defaults; every page can override these'),
('theme', '{"primary":"oklch(0.45 0.12 250)","primaryForeground":"oklch(0.99 0 0)","accent":"oklch(0.75 0.15 60)","background":"oklch(0.99 0.005 90)","foreground":"oklch(0.2 0.02 260)","muted":"oklch(0.96 0.005 90)","border":"oklch(0.9 0.01 90)","headingFont":"\"Instrument Serif\", Georgia, serif","bodyFont":"\"DM Sans\", system-ui, sans-serif","radius":"0.75rem","containerWidth":"1280px","sectionSpacing":"5rem"}', 'theme', 'json', 'Theme tokens injected as CSS variables on every page'),
('header', '{"sticky":true,"showSearch":true,"showAccount":true,"showCart":true,"logoHeight":"32px"}', 'header', 'json', 'Header layout and feature toggles'),
('footer', '{"about":"Modern essentials, thoughtfully made and shipped worldwide.","copyright":"© {year} Studio Store. All rights reserved.","showNewsletter":true,"newsletterTitle":"Join the list","newsletterText":"Get new drops and offers in your inbox.","paymentIcons":"Visa, Mastercard, PayPal"}', 'footer', 'json', 'Footer content blocks'),
('announcement', '{"enabled":true,"text":"Free shipping on orders over 10,000","link":"/shop","background":"oklch(0.2 0.02 260)","color":"oklch(0.99 0 0)","dismissible":true}', 'marketing', 'json', 'Announcement bar above the header'),
('popup', '{"enabled":false,"title":"Get 10% off","text":"Subscribe to our newsletter for a welcome discount.","buttonLabel":"Subscribe","buttonLink":"/#newsletter","delaySeconds":8,"image":""}', 'marketing', 'json', 'Site-wide promotional popup'),
('social', '{"facebook":"","instagram":"","youtube":"","tiktok":"","pinterest":"","twitter":"","linkedin":"","whatsapp":""}', 'social', 'json', 'Only filled-in platforms are shown'),
('analytics', '{"ga4Id":"","gtmId":"","metaPixelId":"","tiktokPixelId":"","enabled":false,"consentRequired":true}', 'analytics', 'json', 'Tracking IDs — never hard-coded in source'),
('ads', '{"enabled":false,"publisherId":"","headerSlot":"","homepageSlot":"","productSlot":"","blogSlot":"","footerSlot":""}', 'ads', 'json', 'Google AdSense publisher and slot IDs'),
('features', '{"blog":true,"faq":true,"newsletter":true,"search":true,"popup":false,"reviews":false,"wishlist":false,"recentlyViewed":true,"chatWidget":false,"cookieBanner":true,"ads":false,"analytics":false}', 'features', 'json', 'Global feature flags'),
('messages', '{"emptyCart":"Your cart is empty","noProducts":"No products found","noSearchResults":"No results matched your search","contactSuccess":"Thanks — we will reply shortly.","contactError":"Something went wrong. Please try again.","newsletterSuccess":"You are subscribed!","searchPlaceholder":"Search products...","notFound":"The page you are looking for does not exist."}', 'content', 'json', 'All user-facing system messages'),
('chat', '{"enabled":false,"number":"","message":"Hi! I have a question about your products.","position":"right","color":"oklch(0.6 0.15 150)"}', 'marketing', 'json', 'Floating WhatsApp / chat widget'),
('cookies', '{"enabled":true,"text":"We use cookies to improve your experience.","acceptLabel":"Accept","rejectLabel":"Reject","privacyLink":"/privacy","position":"bottom"}', 'legal', 'json', 'Cookie consent banner'),
('robots', '{"content":"User-agent: *\nAllow: /\nDisallow: /admin"}', 'seo', 'text', 'robots.txt body served at /robots.txt'),
('schema', '{"organization":true,"website":true,"breadcrumbs":true,"product":true,"article":true,"faq":true,"custom":""}', 'seo', 'json', 'Structured data toggles'),
('shop', '{"productsPerPage":24,"defaultSort":"BEST_SELLING","collectionQuery":"","freeShippingThreshold":10000,"showFreeShippingBar":true}', 'shop', 'json', 'Storefront catalog behaviour');

-- SEED MENUS
insert into public.menu_items (location, label, url, position) values
('header','Shop','/shop',1),('header','Blog','/blog',2),('header','About','/about',3),('header','Contact','/contact',4),('header','FAQ','/faq',5),
('footer','Shop','/shop',1),('footer','Blog','/blog',2),('footer','Contact','/contact',3),
('legal','Privacy Policy','/privacy',1),('legal','Terms & Conditions','/terms',2),('legal','Refund Policy','/refund',3),('legal','Shipping Policy','/shipping',4);

-- SEED HOMEPAGE
insert into public.homepage_sections (type, title, position, enabled, data) values
('hero','Hero',1,true,'{"heading":"Modern essentials, thoughtfully made","subheading":"Considered design, honest materials and fast worldwide shipping.","buttonLabel":"Shop the collection","buttonLink":"/shop","image":"","imageAlt":"Studio Store hero"}'),
('featured_products','Featured products',2,true,'{"heading":"Featured products","count":8,"query":""}'),
('image_text','Our story',3,true,'{"heading":"Built to last","text":"Every piece is designed in-house and produced in small batches, so quality never gets lost at scale.","buttonLabel":"About us","buttonLink":"/about","image":"","imageAlt":"Workshop"}'),
('trust_badges','Trust badges',4,true,'{"items":[{"title":"Secure checkout","text":"Payments handled by Shopify"},{"title":"Fast shipping","text":"Dispatched within 48 hours"},{"title":"Easy returns","text":"30-day return window"}]}'),
('faq','FAQ',5,true,'{"heading":"Frequently asked questions","limit":5}'),
('newsletter','Newsletter',6,true,'{"heading":"Join the list","text":"New drops, offers and stories — no spam.","buttonLabel":"Subscribe"}');

-- SEED PAGES
insert into public.pages (slug,title,content,status,published_at,seo) values
('about','About us','We are a small studio making modern essentials. Edit this page from the admin panel.','published',now(),'{"metaTitle":"About us","metaDescription":"Learn about our studio, our materials and how we make our products."}'),
('privacy','Privacy Policy','Edit your privacy policy from the admin panel.','published',now(),'{"metaTitle":"Privacy Policy","metaDescription":"How we collect, use and protect your personal data."}'),
('terms','Terms & Conditions','Edit your terms from the admin panel.','published',now(),'{"metaTitle":"Terms & Conditions","metaDescription":"The terms that apply when you shop with us."}'),
('refund','Refund Policy','Edit your refund policy from the admin panel.','published',now(),'{"metaTitle":"Refund Policy","metaDescription":"Our returns and refunds process explained."}'),
('shipping','Shipping Policy','Edit your shipping policy from the admin panel.','published',now(),'{"metaTitle":"Shipping Policy","metaDescription":"Delivery times, costs and tracking information."}');

-- SEED FAQ
insert into public.faqs (question, answer, category, position) values
('How long does shipping take?','Orders are dispatched within 48 hours and typically arrive in 3-7 business days.','shipping',1),
('Can I return an item?','Yes — unused items can be returned within 30 days of delivery.','returns',2),
('Which payment methods do you accept?','All major cards and wallets supported by Shopify checkout.','payments',3);
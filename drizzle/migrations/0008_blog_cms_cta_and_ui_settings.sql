-- 1. Blog post model: full CMS fields
alter table public.blog_posts
  add column if not exists subcategory text,
  add column if not exists author_slug text,
  add column if not exists author_bio text,
  add column if not exists author_avatar text,
  add column if not exists reading_time integer,
  add column if not exists show_toc boolean not null default true,
  add column if not exists show_breadcrumbs boolean not null default true,
  add column if not exists faqs jsonb not null default '[]'::jsonb,
  add column if not exists related_slugs text[] not null default '{}'::text[],
  add column if not exists links jsonb not null default '[]'::jsonb;

-- 2. Menu items: icons, descriptions, badges
alter table public.menu_items
  add column if not exists icon text,
  add column if not exists description text,
  add column if not exists badge text;

-- 3. CMS-managed CTA blocks per storefront location
create table if not exists public.cta_blocks (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  enabled boolean not null default true,
  eyebrow text,
  heading text,
  text text,
  image text,
  button_label text,
  button_icon text,
  button_url text,
  secondary_label text,
  secondary_icon text,
  secondary_url text,
  style text not null default 'gradient',
  position integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

grant select on public.cta_blocks to anon;
grant select, insert, update, delete on public.cta_blocks to authenticated;
grant all on public.cta_blocks to service_role;

alter table public.cta_blocks enable row level security;

drop policy if exists "cta public read" on public.cta_blocks;
create policy "cta public read" on public.cta_blocks for select to anon, authenticated using (true);

drop policy if exists "cta staff write" on public.cta_blocks;
create policy "cta staff write" on public.cta_blocks for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create index if not exists cta_blocks_location_idx on public.cta_blocks (location, position);

-- 4. New / extended site settings
insert into public.site_settings (key, group_name, value, description) values
('buttons', 'content', jsonb_build_object(
  'showIcons', true,
  'addToCartLabel', 'Add to cart', 'addToCartIcon', 'ShoppingBag',
  'buyNowLabel', 'Buy it now', 'buyNowIcon', 'Zap',
  'shopNowLabel', 'Shop now', 'shopNowIcon', 'ArrowRight',
  'viewCollectionLabel', 'View collection', 'viewCollectionIcon', 'LayoutGrid',
  'readMoreLabel', 'Read more', 'readMoreIcon', 'BookOpen',
  'learnMoreLabel', 'Learn more', 'learnMoreIcon', 'Info',
  'subscribeLabel', 'Subscribe', 'subscribeIcon', 'Send',
  'contactLabel', 'Contact us', 'contactIcon', 'MessageCircle',
  'continueShoppingLabel', 'Continue shopping', 'continueShoppingIcon', 'ArrowLeft',
  'viewAllLabel', 'View all', 'viewAllIcon', 'ArrowRight',
  'quickViewLabel', 'Quick view', 'quickViewIcon', 'Eye',
  'checkoutLabel', 'Checkout', 'checkoutIcon', 'CreditCard',
  'searchLabel', 'Search', 'searchIcon', 'Search'
), 'Labels and icons for call-to-action buttons across the storefront.')
on conflict (key) do update set value = public.site_settings.value || excluded.value;

insert into public.site_settings (key, group_name, value, description) values
('blog', 'content', jsonb_build_object(
  'listTitle', 'The Journal',
  'listIntro', 'Guides, product stories and studio notes from our team.',
  'postsPerPage', 9,
  'showBreadcrumbs', true,
  'showCategories', true,
  'showTags', true,
  'showReadingTime', true,
  'showAuthorBox', true,
  'showToc', true,
  'tocTitle', 'On this page',
  'showRelated', true,
  'relatedTitle', 'Keep reading',
  'relatedCount', 3,
  'showFaq', true,
  'faqTitle', 'Frequently asked questions',
  'showShare', true,
  'categoryIntro', 'All articles filed under {name}.',
  'tagIntro', 'Articles tagged {name}.',
  'authorIntro', 'Articles written by {name}.',
  'emptyText', 'No articles published yet.'
), 'Blog listing, category, tag, author and article page behaviour.')
on conflict (key) do update set value = public.site_settings.value || excluded.value;

insert into public.site_settings (key, group_name, value, description) values
('faqPage', 'content', jsonb_build_object(
  'title', 'Help centre',
  'intro', 'Answers about orders, shipping, returns and payments.',
  'eyebrow', 'Support',
  'showBreadcrumbs', true,
  'showSearch', true,
  'searchPlaceholder', 'Search questions…',
  'showCategoryFilter', true,
  'allCategoriesLabel', 'All topics',
  'emptyText', 'No questions published yet.',
  'noResultsText', 'No answers matched your search. Try another keyword.',
  'iconStyle', 'plus'
), 'Dedicated FAQ page copy, search and filtering.')
on conflict (key) do update set value = public.site_settings.value || excluded.value;

update public.site_settings set value = value || jsonb_build_object(
  'showSocial', true,
  'showContact', true,
  'showBadges', true,
  'badges', 'Secure checkout|Free shipping over threshold|30-day returns|Support 7 days a week',
  'showPayments', true,
  'exploreTitle', 'Shop',
  'legalTitle', 'Legal',
  'supportTitle', 'Support',
  'mobileAccordion', true,
  'ctaEnabled', true,
  'ctaHeading', 'Design-led essentials, delivered',
  'ctaText', 'Free shipping on orders over the threshold, plus 30-day easy returns.',
  'ctaButtonLabel', 'Shop the collection',
  'ctaButtonIcon', 'ShoppingBag',
  'ctaButtonLink', '/shop'
) where key = 'footer';

update public.site_settings set value = value || jsonb_build_object(
  'showIcons', true,
  'megaMenu', true,
  'showWishlist', true,
  'activeUnderline', true,
  'topBarEnabled', true,
  'topBarText', 'Free express shipping on orders over $150'
) where key = 'header';

-- 5. Footer / support menus with icons
delete from public.menu_items where location in ('footer','legal','support') and is_demo = true;

insert into public.menu_items (location, label, url, position, enabled, icon, is_demo) values
('footer', 'All products', '/shop', 0, true, 'ShoppingBag', true),
('footer', 'New arrivals', '/search?q=new', 1, true, 'Sparkles', true),
('footer', 'Best sellers', '/search?q=bestseller', 2, true, 'Flame', true),
('footer', 'Journal', '/blog', 3, true, 'BookOpen', true),
('support', 'Help centre', '/faq', 0, true, 'LifeBuoy', true),
('support', 'Contact us', '/contact', 1, true, 'MessageCircle', true),
('support', 'Shipping & delivery', '/pages/shipping', 2, true, 'Truck', true),
('support', 'Returns & refunds', '/pages/returns', 3, true, 'RefreshCw', true),
('support', 'My account', '/account', 4, true, 'User', true),
('legal', 'Privacy policy', '/pages/privacy-policy', 0, true, 'ShieldCheck', true),
('legal', 'Terms of service', '/pages/terms', 1, true, 'FileText', true),
('legal', 'Cookie policy', '/pages/cookies', 2, true, 'Cookie', true);

update public.menu_items set icon = coalesce(icon, 'Store') where location = 'header' and column_group is null and icon is null;

-- 6. CTA blocks seed
delete from public.cta_blocks where is_demo = true;
insert into public.cta_blocks (location, enabled, eyebrow, heading, text, button_label, button_icon, button_url, secondary_label, secondary_icon, secondary_url, style, position, is_demo) values
('shop', true, 'Need a hand?', 'Not sure where to start?', 'Our team can help you pick the right piece for your space and budget.', 'Talk to us', 'MessageCircle', '/contact', 'Read the journal', 'BookOpen', '/blog', 'soft', 0, true),
('collection', true, 'More to explore', 'Browse the full catalogue', 'Every piece is made in small batches and shipped carbon-neutral.', 'Shop all products', 'ShoppingBag', '/shop', null, null, null, 'soft', 0, true),
('product', true, 'Questions before you buy?', 'We reply within one business day', 'Sizing, materials, delivery times — ask us anything.', 'Contact support', 'Headset', '/contact', 'Read FAQs', 'HelpCircle', '/faq', 'outline', 0, true),
('blog', true, 'Stay in the loop', 'New stories every week', 'Join the newsletter for guides, launches and subscriber-only offers.', 'Shop new arrivals', 'Sparkles', '/shop', 'Browse FAQs', 'HelpCircle', '/faq', 'gradient', 0, true),
('blog_post', true, 'Ready to shop?', 'Bring the story home', 'Explore the pieces featured in our editorial.', 'Shop the collection', 'ShoppingBag', '/shop', 'More articles', 'BookOpen', '/blog', 'gradient', 0, true),
('faq', true, 'Still stuck?', 'Our support team is here', 'Can not find the answer you need? Send us a message and we will get back fast.', 'Contact us', 'MessageCircle', '/contact', 'Track my order', 'Package', '/account', 'gradient', 0, true),
('contact', true, 'Prefer self-service?', 'Answers in seconds', 'Most questions about shipping, returns and payments are already answered.', 'Visit help centre', 'LifeBuoy', '/faq', null, null, null, 'soft', 0, true),
('page', true, 'Keep exploring', 'Discover the collection', 'Design-led essentials, made to last.', 'Shop now', 'ShoppingBag', '/shop', null, null, null, 'soft', 0, true),
('cart_empty', true, 'Your cart is waiting', 'Find something you love', 'Browse best sellers and new arrivals hand-picked by our studio.', 'Shop now', 'ShoppingBag', '/shop', 'View journal', 'BookOpen', '/blog', 'soft', 0, true),
('search_empty', true, 'No luck?', 'Try browsing instead', 'Explore the full catalogue or ask our team for a recommendation.', 'Browse all products', 'LayoutGrid', '/shop', 'Contact us', 'MessageCircle', '/contact', 'soft', 0, true),
('account', true, 'Need order help?', 'We are one message away', 'Questions about an order, a return or a refund?', 'Contact support', 'Headset', '/contact', 'Help centre', 'LifeBuoy', '/faq', 'soft', 0, true);

-- 7. Demo blog posts (full CMS data)
delete from public.blog_posts where is_demo = true;
insert into public.blog_posts (
  slug, title, excerpt, content, cover_image, cover_alt, category, subcategory, author, author_slug, author_bio, author_avatar,
  tags, seo, status, published_at, updated_at, reading_time, show_toc, show_breadcrumbs, faqs, related_slugs, links, is_demo
) values
(
  'how-to-choose-everyday-carry-essentials',
  'How to choose everyday carry essentials that actually last',
  'A practical framework for building an everyday carry kit around materials, weight and repairability instead of hype.',
  '<h2>Start with how you actually move</h2><p>Before you buy anything, track a normal week. What do you carry to work, to the gym, on a weekend trip? Most people over-build for edge cases and end up carrying weight they never use. Write the list down and be honest about it.</p><h2>Materials decide the lifespan</h2><p>Full-grain leather, 1000D recycled nylon, and stainless hardware age well. Bonded leather, coated canvas and zinc zips do not. If a product page will not tell you the material spec, treat that as an answer.</p><h3>What to look for</h3><ul><li>Bar-tacked stress points on straps and handles</li><li>Replaceable zip pulls and sliders</li><li>Water-resistant finish rather than a plastic coating</li></ul><h2>Weight budget beats capacity</h2><p>Choose a total carry weight first, then fit gear into it. A 20L pack that weighs 900g will get used far more often than a 30L pack at 1.8kg.</p><h2>Buy once, maintain forever</h2><p>Condition leather twice a year, wash nylon cold, and re-wax canvas annually. Ten minutes of maintenance adds years of life to every piece.</p>',
  '/demo/backpack.jpg', 'Leather and nylon everyday carry backpack on a studio table', 'Guides', 'Everyday carry',
  'Amara Cole', 'amara-cole', 'Amara leads product research at the studio and has tested more bags than she will admit to.', '/demo/wallet.jpg',
  array['everyday carry','materials','buying guide'],
  jsonb_build_object(
    'metaTitle', 'Everyday carry essentials: a buying guide that lasts',
    'metaDescription', 'Choose everyday carry gear on materials, weight and repairability — a practical framework from our product team.',
    'focusKeyword', 'everyday carry essentials',
    'canonical', '', 'robots', 'index, follow',
    'ogTitle', 'How to choose everyday carry essentials that actually last',
    'ogDescription', 'Materials, weight budgets and maintenance — the framework we use internally.',
    'ogImage', '/demo/backpack.jpg', 'twitterImage', '/demo/backpack.jpg',
    'schemaType', 'Article', 'customJsonLd', ''
  ),
  'published', now() - interval '9 days', now() - interval '4 days', 7, true, true,
  jsonb_build_array(
    jsonb_build_object('question', 'How much should I spend on a daily bag?', 'answer', 'Spend where the failure points are: hardware, stitching and fabric weight. A well-made 20L pack in the mid range will outlast three cheap ones.'),
    jsonb_build_object('question', 'Is leather or nylon better?', 'answer', 'Nylon wins on weight and weather resistance; full-grain leather wins on repairability and how it ages. Many people carry both, seasonally.')
  ),
  array['the-quiet-luxury-of-small-batch-manufacturing','a-care-guide-for-leather-that-lasts-decades'],
  jsonb_build_array(
    jsonb_build_object('label', 'Shop backpacks', 'url', '/shop'),
    jsonb_build_object('label', 'Materials FAQ', 'url', '/faq')
  ),
  true
),
(
  'the-quiet-luxury-of-small-batch-manufacturing',
  'The quiet luxury of small-batch manufacturing',
  'Why we cap production runs, what it costs, and how limited batches change the way a product is designed and priced.',
  '<h2>Why we cap every run</h2><p>Small batches force decisions. When you can only make four hundred units, you cannot hedge with five colourways and three trims — you commit to the best version and ship it.</p><h2>The real cost of doing it slowly</h2><p>Unit economics get worse: tooling is amortised over fewer pieces, and freight per unit rises. What improves is defect rate, revision speed and the amount of feedback that reaches the workshop.</p><h3>What changes for you</h3><ul><li>Restocks are announced, not silent</li><li>Every batch carries a revision note</li><li>Repairs stay possible because parts stay in stock</li></ul><h2>Designing for repair</h2><p>Screws instead of glue. Standard fasteners instead of proprietary ones. A product you can open is a product you can keep.</p><h2>What we are working on next</h2><p>Published material passports for every SKU, and a spare-parts store so a broken buckle never ends a product life.</p>',
  '/demo/candle.jpg', 'Small-batch candles curing in a workshop', 'Studio', 'Behind the scenes',
  'Jonas Weber', 'jonas-weber', 'Jonas runs production and spends most of his week between the workshop and the freight desk.', '/demo/mug.jpg',
  array['manufacturing','sustainability','studio notes'],
  jsonb_build_object(
    'metaTitle', 'Small-batch manufacturing: the real cost and the real benefit',
    'metaDescription', 'Capped production runs cost more per unit and produce better products. Here is the maths and the method behind our batches.',
    'focusKeyword', 'small-batch manufacturing',
    'canonical', '', 'robots', 'index, follow',
    'ogTitle', 'The quiet luxury of small-batch manufacturing',
    'ogDescription', 'Fewer units, better decisions, repairable products.',
    'ogImage', '/demo/candle.jpg', 'twitterImage', '/demo/candle.jpg',
    'schemaType', 'Article', 'customJsonLd', ''
  ),
  'published', now() - interval '20 days', now() - interval '11 days', 6, true, true,
  jsonb_build_array(
    jsonb_build_object('question', 'Will a sold-out product come back?', 'answer', 'Most core pieces are restocked two to three times a year. Join the newsletter to be told before a batch goes live.'),
    jsonb_build_object('question', 'Do you offer repairs?', 'answer', 'Yes. We keep spare hardware for every batch we have ever shipped and repair at cost within the first five years.')
  ),
  array['how-to-choose-everyday-carry-essentials','a-care-guide-for-leather-that-lasts-decades'],
  jsonb_build_array(
    jsonb_build_object('label', 'Browse the collection', 'url', '/shop'),
    jsonb_build_object('label', 'Talk to the studio', 'url', '/contact')
  ),
  true
),
(
  'a-care-guide-for-leather-that-lasts-decades',
  'A care guide for leather that lasts decades',
  'Cleaning, conditioning and storage steps that keep full-grain leather supple — plus the three mistakes that ruin it fastest.',
  '<h2>Know your leather first</h2><p>Full-grain and veg-tan leathers absorb conditioner and develop a patina. Corrected-grain and coated leathers do not — they need surface cleaning only, and conditioner will simply sit on top.</p><h2>The monthly five minutes</h2><ol><li>Wipe with a dry microfibre cloth</li><li>Spot-clean with a barely damp cloth, never soaked</li><li>Dry away from radiators and direct sun</li></ol><h2>Conditioning twice a year</h2><p>Use a neutral cream conditioner, applied thinly and buffed after twenty minutes. More is not better — over-conditioning softens fibres and stretches panels.</p><h3>Three mistakes to avoid</h3><ul><li>Drying wet leather with heat</li><li>Storing in plastic, which traps moisture</li><li>Using household soaps that strip natural oils</li></ul><h2>Storage between seasons</h2><p>Stuff bags lightly with acid-free paper, store in a breathable cotton dust bag, and keep them upright on a shelf rather than hanging by the strap.</p>',
  '/demo/wallet-2.jpg', 'Leather wallet being conditioned with a cloth', 'Guides', 'Product care',
  'Amara Cole', 'amara-cole', 'Amara leads product research at the studio and has tested more bags than she will admit to.', '/demo/wallet.jpg',
  array['leather','product care','how-to'],
  jsonb_build_object(
    'metaTitle', 'Leather care guide: clean, condition and store it properly',
    'metaDescription', 'A simple leather care routine — monthly cleaning, twice-yearly conditioning and correct storage — plus mistakes to avoid.',
    'focusKeyword', 'leather care guide',
    'canonical', '', 'robots', 'index, follow',
    'ogTitle', 'A care guide for leather that lasts decades',
    'ogDescription', 'The routine our workshop recommends for full-grain leather.',
    'ogImage', '/demo/wallet-2.jpg', 'twitterImage', '/demo/wallet-2.jpg',
    'schemaType', 'Article', 'customJsonLd', ''
  ),
  'published', now() - interval '3 days', now() - interval '1 day', 5, true, true,
  jsonb_build_array(
    jsonb_build_object('question', 'How often should I condition leather?', 'answer', 'Twice a year for everyday pieces, or whenever the surface looks dry and matte after cleaning.'),
    jsonb_build_object('question', 'Can I fix a water stain?', 'answer', 'Usually. Dampen the whole panel evenly with a cloth, then let it dry slowly at room temperature so the tone re-blends.')
  ),
  array['how-to-choose-everyday-carry-essentials','the-quiet-luxury-of-small-batch-manufacturing'],
  jsonb_build_array(
    jsonb_build_object('label', 'Shop leather goods', 'url', '/shop'),
    jsonb_build_object('label', 'Ask a care question', 'url', '/contact')
  ),
  true
);
-- Rebuild demo homepage with premium, media-rich sections (all admin-editable)
DELETE FROM public.homepage_sections WHERE is_demo = true;

INSERT INTO public.homepage_sections (type, title, position, enabled, is_demo, data) VALUES
('hero_slider', 'Hero slider', 1, true, true, '{
  "autoplay": true,
  "autoplayDelay": 6000,
  "slides": [
    {
      "eyebrow": "New season",
      "heading": "Design that lives with you",
      "text": "Considered essentials for the home, the desk and everywhere in between — built to last, priced to love.",
      "image": "/demo/hero-1.jpg",
      "mobileImage": "/demo/hero-1-mobile.jpg",
      "imageAlt": "Minimal living room with warm daylight",
      "overlay": 50,
      "align": "left",
      "theme": "dark",
      "buttonLabel": "Shop the collection",
      "buttonLink": "/shop",
      "secondaryButtonLabel": "Our story",
      "secondaryButtonLink": "/pages/about-us"
    },
    {
      "eyebrow": "Premium tech",
      "heading": "Sound and time, perfected",
      "text": "Studio-grade audio and precision wearables, now up to 25% off during our launch week.",
      "image": "/demo/hero-2.jpg",
      "mobileImage": "/demo/hero-2-mobile.jpg",
      "imageAlt": "Premium headphones and smart watch on a dark surface",
      "overlay": 55,
      "align": "left",
      "theme": "dark",
      "buttonLabel": "Shop tech",
      "buttonLink": "/search?q=audio",
      "secondaryButtonLabel": "View all products",
      "secondaryButtonLink": "/shop"
    },
    {
      "eyebrow": "Everyday carry",
      "heading": "Made for the long walk home",
      "text": "Full-grain leather, organic cotton and hard-wearing canvas — quietly premium staples.",
      "image": "/demo/backpack-2.jpg",
      "mobileImage": "/demo/wallet-2.jpg",
      "imageAlt": "Canvas backpack worn on a city street",
      "overlay": 55,
      "align": "left",
      "theme": "dark",
      "buttonLabel": "Shop essentials",
      "buttonLink": "/search?q=accessories"
    }
  ]
}'::jsonb),

('trust_badges', 'Trust badges', 2, true, true, '{
  "items": [
    {"title": "Free shipping over Rs 5,000", "text": "Dispatched within 24 hours nationwide."},
    {"title": "30-day easy returns", "text": "Changed your mind? Send it back, no questions."},
    {"title": "Secure Shopify checkout", "text": "Encrypted payments with buyer protection."}
  ]
}'::jsonb),

('product_carousel', 'Featured products', 3, true, true, '{
  "eyebrow": "Handpicked",
  "heading": "Featured products",
  "subheading": "The pieces our team reaches for again and again.",
  "tag": "featured",
  "count": 8,
  "autoplay": true,
  "autoplayDelay": 5000,
  "linkTo": "/shop",
  "linkLabel": "View all"
}'::jsonb),

('featured_collections', 'Shop by category', 4, true, true, '{
  "eyebrow": "Browse",
  "heading": "Shop by collection",
  "items": [
    {"handle": "tech", "title": "Sound & tech", "text": "Headphones, speakers and wearables.", "image": "/demo/headphones-2.jpg", "link": "/search?q=audio"},
    {"handle": "home", "title": "Home & living", "text": "Lighting, ceramics and slow-burning candles.", "image": "/demo/lamp-2.jpg", "link": "/search?q=home"},
    {"handle": "carry", "title": "Everyday carry", "text": "Bags, wallets and warm-weather eyewear.", "image": "/demo/backpack.jpg", "link": "/search?q=accessories"}
  ]
}'::jsonb),

('product_carousel', 'New arrivals', 5, true, true, '{
  "eyebrow": "Just landed",
  "heading": "New arrivals",
  "subheading": "Fresh drops added to the studio this month.",
  "tag": "new-arrival",
  "count": 8,
  "linkTo": "/shop",
  "linkLabel": "See what''s new"
}'::jsonb),

('banner_grid', 'Promotional banners', 6, true, true, '{
  "items": [
    {"heading": "Launch week: up to 25% off", "text": "Limited quantities across tech and carry.", "image": "/demo/sneakers-2.jpg", "link": "/shop", "buttonLabel": "Shop the sale"},
    {"heading": "The quiet home edit", "text": "Warm light, soft ceramics, slow scents.", "image": "/demo/candle-2.jpg", "link": "/search?q=home", "buttonLabel": "Explore home"}
  ]
}'::jsonb),

('product_carousel', 'Best sellers', 7, true, true, '{
  "eyebrow": "Customer favourites",
  "heading": "Best sellers",
  "subheading": "Consistently restocked, consistently loved.",
  "tag": "bestseller",
  "count": 8,
  "linkTo": "/shop",
  "linkLabel": "Shop best sellers"
}'::jsonb),

('image_text', 'Brand story', 8, true, true, '{
  "heading": "Built slowly, made to keep",
  "text": "Every product in the studio starts with a material we would happily live with for a decade. We work with small workshops, order in short runs and price honestly — no seasonal churn, no throwaway design.",
  "image": "/demo/mug-2.jpg",
  "imageAlt": "Stoneware mug with coffee on a linen tablecloth",
  "buttonLabel": "Read our story",
  "buttonLink": "/pages/about-us"
}'::jsonb),

('promo_banner', 'Newsletter promo', 9, true, true, '{
  "heading": "Members get first access",
  "text": "Early drops, restock alerts and a 10% welcome code on your first order.",
  "buttonLabel": "Shop now",
  "buttonLink": "/shop"
}'::jsonb),

('testimonials', 'Testimonials', 10, true, true, '{
  "heading": "What customers say",
  "items": [
    {"quote": "The headphones arrived in two days and the packaging alone felt premium. Sound is genuinely studio quality.", "author": "Sana K."},
    {"quote": "I bought the lamp on a whim and ended up going back for the mug and candle. Everything matches beautifully.", "author": "Daniyal R."},
    {"quote": "Returns were painless and support replied within an hour. Rare for an online store here.", "author": "Meher A."}
  ]
}'::jsonb),

('blog_posts', 'Journal', 11, true, true, '{"heading": "From the journal", "limit": 3}'::jsonb),
('faq', 'FAQ', 12, true, true, '{"heading": "Frequently asked questions", "limit": 5}'::jsonb),
('newsletter', 'Newsletter', 13, true, true, '{"heading": "Join the list", "text": "Product drops, restocks and slow-living notes. One email a week, never more.", "buttonLabel": "Subscribe"}'::jsonb);

-- Mega menu: parent items plus grouped children (column_group = parent label)
DELETE FROM public.menu_items WHERE location = 'header' AND is_demo = true;
INSERT INTO public.menu_items (location, label, url, position, enabled, is_demo, column_group) VALUES
('header', 'Shop', '/shop', 1, true, true, NULL),
('header', 'New arrivals', '/search?q=new-arrival', 2, true, true, NULL),
('header', 'Journal', '/blog', 3, true, true, NULL),
('header', 'Help', '/faq', 4, true, true, NULL),
('header', 'All products', '/shop', 1, true, true, 'Shop'),
('header', 'Sound & tech', '/search?q=audio', 2, true, true, 'Shop'),
('header', 'Home & living', '/search?q=home', 3, true, true, 'Shop'),
('header', 'Everyday carry', '/search?q=accessories', 4, true, true, 'Shop'),
('header', 'Apparel', '/search?q=apparel', 5, true, true, 'Shop'),
('header', 'Best sellers', '/search?q=bestseller', 6, true, true, 'Shop'),
('header', 'Shipping & delivery', '/pages/shipping-policy', 1, true, true, 'Help'),
('header', 'Returns & refunds', '/pages/refund-policy', 2, true, true, 'Help'),
('header', 'Contact us', '/contact', 3, true, true, 'Help'),
('header', 'FAQ', '/faq', 4, true, true, 'Help');

-- Storefront feature flags used by product cards / product pages
INSERT INTO public.site_settings (key, value, group_name, type, description) VALUES
('features', '{"search": true, "wishlist": true, "quickView": true, "reviews": true, "blog": true, "newsletter": true}'::jsonb, 'features', 'json', 'Storefront feature toggles')
ON CONFLICT (key) DO UPDATE SET value = public.site_settings.value || EXCLUDED.value, updated_at = now();
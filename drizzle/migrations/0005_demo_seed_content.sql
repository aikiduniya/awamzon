INSERT INTO public.faqs (question, answer, category, position, enabled, is_demo) VALUES
('How long does delivery take?','Orders are dispatched within 24 hours. Delivery takes 2-4 working days in major cities and 3-6 days elsewhere.','shipping',10,true,true),
('Do you offer cash on delivery?','Yes. Cash on delivery is available nationwide, along with card and bank transfer at checkout.','payments',11,true,true),
('How do I track my order?','You receive a tracking link by email and SMS as soon as your parcel leaves our warehouse.','orders',12,true,true),
('Are the products covered by warranty?','All electronics include a 12 month brand warranty. Apparel and accessories carry a 30 day quality guarantee.','products',13,true,true),
('Can I change my delivery address?','Yes, contact support within 6 hours of placing the order and we will update the address before dispatch.','orders',14,true,true);

INSERT INTO public.pages (slug, title, content, status, published_at, seo, is_demo) VALUES
('about-us','About us','We started in a small Karachi workshop with one idea: everyday products should feel premium without a premium price tag. Today we ship thousands of orders every month across Pakistan, working directly with makers and factories so quality stays high and prices stay fair.','published', now(), '{"metaTitle":"About us","metaDescription":"Learn about our story, our team and how we build products people love."}'::jsonb, true),
('shipping-policy','Shipping policy','Orders placed before 4pm are dispatched the same working day. Standard delivery is 2-4 working days. Free shipping applies to orders above the threshold shown in your cart.','published', now(), '{"metaTitle":"Shipping policy","metaDescription":"Delivery times, shipping charges and dispatch details."}'::jsonb, true),
('returns-policy','Returns and refunds','Changed your mind? Return any unused item within 14 days. Refunds are processed to the original payment method within 5 working days of receiving the parcel.','published', now(), '{"metaTitle":"Returns and refunds","metaDescription":"Our simple 14 day return and refund process."}'::jsonb, true),
('store-locations','Store locations','Visit us in Karachi (Clifton Block 4), Lahore (Gulberg III) or Islamabad (F-7 Markaz). Open daily from 11am to 9pm.','published', now(), '{"metaTitle":"Store locations","metaDescription":"Find our retail stores in Karachi, Lahore and Islamabad."}'::jsonb, true);

INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_image, cover_alt, category, author, tags, status, published_at, seo, is_demo) VALUES
('five-essentials-every-home-needs','Five essentials every modern home needs','A short guide to the pieces that quietly make daily life easier.','Good design is invisible. These five essentials do their job so well you stop noticing them, and that is exactly the point: a warm dimmable lamp, storage that hides clutter, one really good mug, textiles you want to touch, and a tidy cable setup.','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=70','Modern living room','Home','Ayesha Khan','{home,guides}','published', now() - interval '3 days', '{"metaTitle":"Five essentials every modern home needs"}'::jsonb, true),
('how-to-choose-headphones','How to choose headphones you will actually keep','Drivers, comfort, battery: what matters and what is marketing.','Most headphone spec sheets are noise. Focus on three things: comfort over two hours, honest battery numbers, and a fit that seals properly.','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=70','Headphones on a desk','Electronics','Bilal Ahmed','{audio,buying-guide}','published', now() - interval '9 days', '{"metaTitle":"How to choose headphones"}'::jsonb, true),
('sustainable-packaging-journey','Our journey to plastic-free packaging','What changed, what it cost, and what we learned along the way.','Switching to recycled board and paper tape raised our packaging cost by 9 percent and cut plastic waste by 94 percent. Here is the full breakdown.','https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=70','Cardboard packaging','Sustainability','Hina Raza','{sustainability}','published', now() - interval '21 days', '{"metaTitle":"Plastic-free packaging"}'::jsonb, true),
('behind-the-scenes-studio','Behind the scenes at our photo studio','How one product shoot really comes together.','Spoiler: it is mostly lighting, patience and a lot of lint rollers.','https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=70','Photo studio setup','Studio','Editorial team','{studio}','draft', NULL, '{}'::jsonb, true);

INSERT INTO public.media (url, alt, title, category, is_demo) VALUES
('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=70','Retail store interior','Storefront hero','hero',true),
('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=70','Wireless headphones','Headphones','product',true),
('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=70','Smart watch on a table','Smart watch','product',true),
('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=70','Camera on tripod','Camera','product',true),
('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=70','Living room sofa','Home banner','banner',true),
('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=70','Recycled packaging','Packaging','blog',true);

INSERT INTO public.subscribers (email, status, source, is_demo) VALUES
('ayesha.khan@example.com','subscribed','footer',true),
('bilal.ahmed@example.com','subscribed','popup',true),
('sana.tariq@example.com','subscribed','checkout',true),
('usman.ali@example.com','unsubscribed','footer',true),
('hina.raza@example.com','subscribed','blog',true),
('faisal.mehmood@example.com','subscribed','footer',true),
('mariam.j@example.com','subscribed','popup',true),
('zeeshan.iqbal@example.com','subscribed','footer',true);

INSERT INTO public.contact_messages (name, email, subject, message, status, is_demo, created_at) VALUES
('Ayesha Khan','ayesha.khan@example.com','Order 1042 delivery','Hi, could you confirm the expected delivery date for my order?','new',true, now() - interval '2 hours'),
('Bilal Ahmed','bilal.ahmed@example.com','Bulk order enquiry','We would like to order 50 units for a corporate gift. Do you offer discounts?','new',true, now() - interval '1 day'),
('Sana Tariq','sana.tariq@example.com','Exchange request','The size is a bit small, can I exchange for the next size up?','read',true, now() - interval '3 days'),
('Usman Ali','usman.ali@example.com','Warranty claim','My smart watch stopped charging after 3 months.','read',true, now() - interval '6 days'),
('Mariam J','mariam.j@example.com','Wholesale partnership','I run a boutique in Lahore and would love to stock your products.','new',true, now() - interval '9 days');

INSERT INTO public.redirects (from_path, to_path, status_code, active, is_demo) VALUES
('/old-shop','/shop',301,true,true),
('/sale','/collections/sale',302,true,true),
('/about','/pages/about-us',301,true,true);

INSERT INTO public.demo_customers (name, email, city, orders_count, total_spent, tags) VALUES
('Ayesha Khan','ayesha.khan@example.com','Karachi',6,48250,'{vip,repeat}'),
('Bilal Ahmed','bilal.ahmed@example.com','Lahore',3,19900,'{repeat}'),
('Sana Tariq','sana.tariq@example.com','Islamabad',2,11400,'{}'),
('Usman Ali','usman.ali@example.com','Faisalabad',1,4300,'{new}'),
('Hina Raza','hina.raza@example.com','Karachi',9,73800,'{vip}'),
('Faisal Mehmood','faisal.mehmood@example.com','Multan',4,26150,'{repeat}'),
('Mariam J','mariam.j@example.com','Lahore',2,15600,'{wholesale}'),
('Zeeshan Iqbal','zeeshan.iqbal@example.com','Peshawar',1,3990,'{new}');

INSERT INTO public.demo_orders (order_number, customer_name, customer_email, total, items, financial_status, fulfillment_status, channel, created_at) VALUES
('#1051','Hina Raza','hina.raza@example.com',12900,3,'paid','fulfilled','Online store', now() - interval '2 hours'),
('#1050','Ayesha Khan','ayesha.khan@example.com',7450,2,'paid','unfulfilled','Online store', now() - interval '7 hours'),
('#1049','Zeeshan Iqbal','zeeshan.iqbal@example.com',3990,1,'pending','unfulfilled','Instagram', now() - interval '1 day'),
('#1048','Faisal Mehmood','faisal.mehmood@example.com',18600,4,'paid','fulfilled','Online store', now() - interval '2 days'),
('#1047','Sana Tariq','sana.tariq@example.com',5600,1,'refunded','returned','Online store', now() - interval '4 days'),
('#1046','Bilal Ahmed','bilal.ahmed@example.com',9900,2,'paid','fulfilled','Online store', now() - interval '5 days'),
('#1045','Mariam J','mariam.j@example.com',15600,5,'paid','fulfilled','Wholesale', now() - interval '8 days'),
('#1044','Usman Ali','usman.ali@example.com',4300,1,'paid','fulfilled','Online store', now() - interval '11 days'),
('#1043','Hina Raza','hina.raza@example.com',22400,6,'paid','fulfilled','Online store', now() - interval '14 days'),
('#1042','Ayesha Khan','ayesha.khan@example.com',6800,2,'paid','fulfilled','Online store', now() - interval '18 days');

INSERT INTO public.notifications (title, body, level, link, is_demo, created_at) VALUES
('New order received','Order #1051 for PKR 12,900 was placed by Hina Raza.','success','/admin/orders',true, now() - interval '2 hours'),
('Low stock warning','3 products have fewer than 5 units left.','warning','/admin/products',true, now() - interval '5 hours'),
('New contact message','Bilal Ahmed sent a bulk order enquiry.','info','/admin/messages',true, now() - interval '1 day'),
('Refund processed','Order #1047 was refunded to the customer.','info','/admin/orders',true, now() - interval '4 days'),
('SEO scan complete','No critical issues found in the latest sitemap crawl.','success','/admin/seo',true, now() - interval '6 days');

INSERT INTO public.homepage_sections (type, title, position, enabled, data, is_demo) VALUES
('promo_banner','Season sale',45,true,'{"heading":"Mid-season sale, up to 40% off","text":"Limited stock on best sellers. Ends Sunday.","buttonLabel":"Shop the sale","buttonLink":"/shop"}'::jsonb,true),
('testimonials','Customer love',55,true,'{"heading":"Loved by 12,000+ customers","items":[{"quote":"Ordered on Monday, delivered Wednesday. Packaging was beautiful and the quality is genuinely premium.","author":"Ayesha K. from Karachi"},{"quote":"Support answered within minutes and sorted my exchange the same day. Rare service.","author":"Bilal A. from Lahore"},{"quote":"I have reordered four times now. Nothing has disappointed me yet.","author":"Hina R. from Karachi"}]}'::jsonb,true),
('blog_posts','Journal',65,true,'{"heading":"From the journal","limit":3}'::jsonb,true);
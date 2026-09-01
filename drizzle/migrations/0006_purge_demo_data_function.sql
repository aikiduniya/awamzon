CREATE OR REPLACE FUNCTION public.purge_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE removed jsonb := '{}'::jsonb; n integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can remove demo data';
  END IF;
  DELETE FROM public.pages WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('pages', n);
  DELETE FROM public.blog_posts WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('blog_posts', n);
  DELETE FROM public.faqs WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('faqs', n);
  DELETE FROM public.media WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('media', n);
  DELETE FROM public.subscribers WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('subscribers', n);
  DELETE FROM public.contact_messages WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('contact_messages', n);
  DELETE FROM public.homepage_sections WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('homepage_sections', n);
  DELETE FROM public.menu_items WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('menu_items', n);
  DELETE FROM public.redirects WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('redirects', n);
  DELETE FROM public.demo_orders WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('demo_orders', n);
  DELETE FROM public.demo_customers WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('demo_customers', n);
  DELETE FROM public.notifications WHERE is_demo; GET DIAGNOSTICS n = ROW_COUNT; removed := removed || jsonb_build_object('notifications', n);
  RETURN removed;
END;
$fn$;
REVOKE ALL ON FUNCTION public.purge_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_demo_data() TO authenticated;
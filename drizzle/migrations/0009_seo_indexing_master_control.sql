-- Add the Global Search Engine Indexing master control to the existing SEO settings group.
INSERT INTO public.site_settings (key, value)
VALUES ('seo', jsonb_build_object(
  'searchEngineIndexing', false,
  'defaultRobots', 'noindex',
  'defaultFollow', 'nofollow'
))
ON CONFLICT (key) DO UPDATE
SET value = public.site_settings.value
  || jsonb_build_object(
       'searchEngineIndexing', COALESCE(public.site_settings.value->'searchEngineIndexing', 'false'::jsonb),
       'defaultRobots', COALESCE(public.site_settings.value->'defaultRobots', '"noindex"'::jsonb),
       'defaultFollow', COALESCE(public.site_settings.value->'defaultFollow', '"nofollow"'::jsonb)
     );

-- Current state requested: entire site NOINDEX, NOFOLLOW.
UPDATE public.site_settings
SET value = value || jsonb_build_object('searchEngineIndexing', false, 'defaultRobots', 'noindex', 'defaultFollow', 'nofollow')
WHERE key = 'seo';
create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('super_admin','admin','editor','seo_manager','content_manager','order_manager','support_manager')
  )
$function$;
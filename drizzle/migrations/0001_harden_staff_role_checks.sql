-- Only explicit staff roles grant staff-level write access
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
      and role in ('super_admin','admin','editor','seo_manager')
  )
$function$;

-- Fix mutable search_path on the updated_at trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $function$
begin new.updated_at = now(); return new; end;
$function$;

-- Role helpers must not be callable by anonymous visitors
revoke execute on function public.is_staff(uuid) from anon, public;
revoke execute on function public.is_admin(uuid) from anon, public;
revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.is_staff(uuid) to authenticated, service_role;
grant execute on function public.is_admin(uuid) to authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;